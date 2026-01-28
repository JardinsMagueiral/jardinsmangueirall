-- Create table for partner photos
CREATE TABLE public.parceiro_fotos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parceiro_id uuid NOT NULL REFERENCES public.parceiros(id) ON DELETE CASCADE,
  url text NOT NULL,
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.parceiro_fotos ENABLE ROW LEVEL SECURITY;

-- Policies for viewing photos
CREATE POLICY "Anyone can view photos of approved partners"
ON public.parceiro_fotos FOR SELECT
USING (EXISTS (
  SELECT 1 FROM parceiros
  WHERE parceiros.id = parceiro_fotos.parceiro_id
  AND parceiros.status = 'aprovado'
));

CREATE POLICY "Users can view photos of their own partners"
ON public.parceiro_fotos FOR SELECT
USING (EXISTS (
  SELECT 1 FROM parceiros
  WHERE parceiros.id = parceiro_fotos.parceiro_id
  AND parceiros.user_id = auth.uid()
));

-- Policies for managing photos
CREATE POLICY "Users can insert photos for their own partners"
ON public.parceiro_fotos FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM parceiros
  WHERE parceiros.id = parceiro_fotos.parceiro_id
  AND parceiros.user_id = auth.uid()
));

CREATE POLICY "Users can delete photos of their own partners"
ON public.parceiro_fotos FOR DELETE
USING (EXISTS (
  SELECT 1 FROM parceiros
  WHERE parceiros.id = parceiro_fotos.parceiro_id
  AND parceiros.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all partner photos"
ON public.parceiro_fotos FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create storage bucket for partner images
INSERT INTO storage.buckets (id, name, public)
VALUES ('parceiros', 'parceiros', true);

-- Storage policies
CREATE POLICY "Authenticated users can upload partner images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'parceiros');

CREATE POLICY "Anyone can view partner images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'parceiros');

CREATE POLICY "Users can delete their own partner images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'parceiros');