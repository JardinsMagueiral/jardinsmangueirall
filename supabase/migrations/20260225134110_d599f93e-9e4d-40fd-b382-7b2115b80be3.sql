
-- Create whatsapp_grupos table
CREATE TABLE public.whatsapp_grupos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  link TEXT NOT NULL,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_grupos ENABLE ROW LEVEL SECURITY;

-- Public can view active groups
CREATE POLICY "Anyone can view active groups"
ON public.whatsapp_grupos
FOR SELECT
USING (ativo = true);

-- Admins full access
CREATE POLICY "Admins can manage all groups"
ON public.whatsapp_grupos
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Seed existing groups
INSERT INTO public.whatsapp_grupos (titulo, descricao, link, ordem) VALUES
('Geral 🔊', 'Grupo principal da comunidade', 'https://chat.whatsapp.com/GH1XuLDJfKP4be24ullSCD', 1),
('Geral 2 🔊', 'Segundo grupo geral', 'https://chat.whatsapp.com/DrIx3XxBW8h2CuqQSj0q1F', 2),
('Carona 🚕', 'Encontre ou ofereça caronas', 'https://chat.whatsapp.com/BoCnDmejx5wGLgTweIk782', 3),
('Imóveis 🏡', 'Compra, venda e aluguel', 'https://chat.whatsapp.com/DGIxINfCoLw8rAt2BKMuoj', 4),
('Desapego 🛍️', 'Classificados da comunidade', 'https://chat.whatsapp.com/LtNPTADfoSK24EjGsFubsp', 5);
