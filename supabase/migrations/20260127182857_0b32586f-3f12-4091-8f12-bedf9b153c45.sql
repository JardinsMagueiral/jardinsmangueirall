-- IMOVEIS: Recriar TODAS as políticas SELECT como PERMISSIVE explícito
DROP POLICY IF EXISTS "Anyone can view approved properties" ON imoveis;
DROP POLICY IF EXISTS "Users can view their own properties" ON imoveis;
DROP POLICY IF EXISTS "Admins can view all properties" ON imoveis;

CREATE POLICY "Anyone can view approved properties"
ON imoveis AS PERMISSIVE
FOR SELECT TO public
USING (status = 'aprovado');

CREATE POLICY "Users can view their own properties"
ON imoveis AS PERMISSIVE
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all properties"
ON imoveis AS PERMISSIVE
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- IMOVEL_FOTOS: Recriar políticas SELECT como PERMISSIVE
DROP POLICY IF EXISTS "Anyone can view photos of approved properties" ON imovel_fotos;
DROP POLICY IF EXISTS "Users can view photos of their own properties" ON imovel_fotos;

CREATE POLICY "Anyone can view photos of approved properties"
ON imovel_fotos AS PERMISSIVE
FOR SELECT TO public
USING (
  EXISTS (
    SELECT 1 FROM imoveis
    WHERE imoveis.id = imovel_fotos.imovel_id
    AND imoveis.status = 'aprovado'
  )
);

CREATE POLICY "Users can view photos of their own properties"
ON imovel_fotos AS PERMISSIVE
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM imoveis
    WHERE imoveis.id = imovel_fotos.imovel_id
    AND imoveis.user_id = auth.uid()
  )
);