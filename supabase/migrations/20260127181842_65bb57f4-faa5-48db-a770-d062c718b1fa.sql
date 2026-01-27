-- 1. IMOVEIS: Recriar política pública como PERMISSIVE
DROP POLICY IF EXISTS "Anyone can view approved properties" ON imoveis;

CREATE POLICY "Anyone can view approved properties"
ON imoveis
FOR SELECT
USING (status = 'aprovado');

-- 2. IMOVEL_FOTOS: Recriar política pública como PERMISSIVE
DROP POLICY IF EXISTS "Anyone can view photos of approved properties" ON imovel_fotos;

CREATE POLICY "Anyone can view photos of approved properties"
ON imovel_fotos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM imoveis
    WHERE imoveis.id = imovel_fotos.imovel_id
    AND imoveis.status = 'aprovado'
  )
);