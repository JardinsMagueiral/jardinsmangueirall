-- Tabela de eventos
CREATE TABLE public.eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data date NOT NULL,
  titulo text NOT NULL,
  descricao text,
  status text DEFAULT 'pendente',
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (PERMISSIVE para combinar com OR)

-- Qualquer pessoa pode ver eventos aprovados
CREATE POLICY "Anyone can view approved events"
  ON public.eventos FOR SELECT
  USING (status = 'aprovado');

-- Admins podem ver todos os eventos
CREATE POLICY "Admins can view all events"
  ON public.eventos FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Usuários autenticados podem criar eventos (com status pendente)
CREATE POLICY "Authenticated users can create events"
  ON public.eventos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins podem atualizar eventos
CREATE POLICY "Admins can update events"
  ON public.eventos FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins podem excluir eventos
CREATE POLICY "Admins can delete events"
  ON public.eventos FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));