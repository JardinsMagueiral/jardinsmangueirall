
-- Add image URL column to noticias
ALTER TABLE public.noticias ADD COLUMN imagem_url text;

-- Create storage bucket for news images
INSERT INTO storage.buckets (id, name, public) VALUES ('noticias', 'noticias', true);

-- Storage policies
CREATE POLICY "Anyone can view noticia images"
ON storage.objects FOR SELECT
USING (bucket_id = 'noticias');

CREATE POLICY "Authenticated users can upload noticia images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'noticias' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own noticia images"
ON storage.objects FOR DELETE
USING (bucket_id = 'noticias' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can manage all noticia images"
ON storage.objects FOR ALL
USING (bucket_id = 'noticias' AND has_role(auth.uid(), 'admin'));
