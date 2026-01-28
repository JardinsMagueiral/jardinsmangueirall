-- Criar tabela parceiros
CREATE TABLE public.parceiros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  categoria text NOT NULL,
  descricao text,
  telefone text NOT NULL,
  email text,
  instagram text,
  site text,
  endereco text,
  logo_url text,
  user_id uuid,
  status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  destaque boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.parceiros ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can view approved partners"
ON public.parceiros FOR SELECT TO public
USING (status = 'aprovado');

CREATE POLICY "Users can view their own partners"
ON public.parceiros FOR SELECT TO public
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create partners"
ON public.parceiros FOR INSERT TO public
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all partners"
ON public.parceiros FOR SELECT TO public
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all partners"
ON public.parceiros FOR UPDATE TO public
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all partners"
ON public.parceiros FOR DELETE TO public
USING (has_role(auth.uid(), 'admin'));

-- Trigger para updated_at
CREATE TRIGGER update_parceiros_updated_at
  BEFORE UPDATE ON public.parceiros
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();