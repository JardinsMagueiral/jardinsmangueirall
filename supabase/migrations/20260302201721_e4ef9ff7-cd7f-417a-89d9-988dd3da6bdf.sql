CREATE TABLE public.noticias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  titulo text NOT NULL,
  descricao text,
  link text,
  status text DEFAULT 'pendente',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.noticias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved noticias" ON public.noticias
  FOR SELECT USING (status = 'aprovado');

CREATE POLICY "Users can view their own noticias" ON public.noticias
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create noticias" ON public.noticias
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all noticias" ON public.noticias
  FOR ALL USING (has_role(auth.uid(), 'admin'));