
-- Create classificados table
CREATE TABLE public.classificados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  preco NUMERIC NOT NULL,
  categoria TEXT NOT NULL,
  contato_whatsapp TEXT NOT NULL,
  status TEXT DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.classificados ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view approved classificados"
ON public.classificados FOR SELECT
USING (status = 'aprovado');

CREATE POLICY "Users can view their own classificados"
ON public.classificados FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all classificados"
ON public.classificados FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own classificados"
ON public.classificados FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending classificados"
ON public.classificados FOR UPDATE
USING (auth.uid() = user_id AND status IN ('pendente', 'rejeitado'));

CREATE POLICY "Admins can update all classificados"
ON public.classificados FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their own classificados"
ON public.classificados FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete all classificados"
ON public.classificados FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_classificados_updated_at
BEFORE UPDATE ON public.classificados
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create classificado_fotos table
CREATE TABLE public.classificado_fotos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  classificado_id UUID NOT NULL REFERENCES public.classificados(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.classificado_fotos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view photos of approved classificados"
ON public.classificado_fotos FOR SELECT
USING (EXISTS (SELECT 1 FROM classificados WHERE classificados.id = classificado_fotos.classificado_id AND classificados.status = 'aprovado'));

CREATE POLICY "Users can view photos of their own classificados"
ON public.classificado_fotos FOR SELECT
USING (EXISTS (SELECT 1 FROM classificados WHERE classificados.id = classificado_fotos.classificado_id AND classificados.user_id = auth.uid()));

CREATE POLICY "Admins can manage all classificado photos"
ON public.classificado_fotos FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert photos for their own classificados"
ON public.classificado_fotos FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM classificados WHERE classificados.id = classificado_fotos.classificado_id AND classificados.user_id = auth.uid()));

CREATE POLICY "Users can delete photos of their own classificados"
ON public.classificado_fotos FOR DELETE
USING (EXISTS (SELECT 1 FROM classificados WHERE classificados.id = classificado_fotos.classificado_id AND classificados.user_id = auth.uid()));

-- Storage bucket for classificados photos
INSERT INTO storage.buckets (id, name, public) VALUES ('classificados', 'classificados', true);

CREATE POLICY "Anyone can view classificado images"
ON storage.objects FOR SELECT
USING (bucket_id = 'classificados');

CREATE POLICY "Authenticated users can upload classificado images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'classificados' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own classificado images"
ON storage.objects FOR DELETE
USING (bucket_id = 'classificados' AND auth.role() = 'authenticated');
