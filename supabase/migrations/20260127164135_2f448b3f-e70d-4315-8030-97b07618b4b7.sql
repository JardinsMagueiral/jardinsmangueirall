-- Remover policies restritivas atuais da tabela imoveis
DROP POLICY IF EXISTS "Admins can view all properties" ON public.imoveis;
DROP POLICY IF EXISTS "Anyone can view approved properties" ON public.imoveis;
DROP POLICY IF EXISTS "Users can view their own properties" ON public.imoveis;

-- Recriar como PERMISSIVE (padrão) - qualquer condição libera acesso
CREATE POLICY "Admins can view all properties"
  ON public.imoveis FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view approved properties"
  ON public.imoveis FOR SELECT
  USING (status = 'aprovado');

CREATE POLICY "Users can view their own properties"
  ON public.imoveis FOR SELECT
  USING (auth.uid() = user_id);

-- Adicionar policy para admin ver profiles (dados do anunciante)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));