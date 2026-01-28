-- Remover política antiga de UPDATE por usuários
DROP POLICY IF EXISTS "Users can update their own properties" ON public.imoveis;

-- Nova política: usuários podem atualizar apenas imóveis pendentes ou rejeitados
CREATE POLICY "Users can update their own pending properties"
ON public.imoveis
FOR UPDATE
TO public
USING (
  auth.uid() = user_id 
  AND status IN ('pendente', 'rejeitado')
);