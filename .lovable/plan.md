

## Plano: Resolver Problemas de Segurança

### Objetivo

Corrigir os problemas de segurança identificados no scan, exceto aqueles que já estão resolvidos ou são falsos positivos.

### Análise Detalhada

#### Problemas JÁ RESOLVIDOS (marcar como ignorados):

1. **Owner Contact Exposure** - O código atual em `ImovelDetalhe.tsx` NÃO faz JOIN com profiles. Usa WhatsApp fixo.
2. **Photo Upload Validation** - Já implementado com limite de 5MB e validação de tipos.

#### Problemas a RESOLVER:

1. **Console Error Logging** (fácil) - Remover/condicionar console.logs em produção
2. **Missing UPDATE Policy for Photos** (fácil) - Adicionar política RLS
3. **has_role SECURITY DEFINER** (médio) - Adicionar validação de NULL
4. **Client Admin Check** (médio) - Já tem RLS, mas podemos melhorar
5. **Admin Audit Trail** (médio) - Criar tabela de auditoria

#### Problemas a IGNORAR com justificativa:

1. **Public Storage Bucket** - Aceitável para site de imóveis (fotos precisam ser públicas)
2. **Profiles Table Exposure** - RLS já está configurado corretamente

### Passos da Implementação

#### 1. Marcar Falsos Positivos como Ignorados

Usar a ferramenta de segurança para atualizar os findings que já estão resolvidos.

#### 2. Adicionar UPDATE Policy para imovel_fotos

```sql
CREATE POLICY "Users can update photos of their own properties"
  ON public.imovel_fotos FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM imoveis 
    WHERE imoveis.id = imovel_fotos.imovel_id 
    AND imoveis.user_id = auth.uid()
  ));
```

#### 3. Melhorar Função has_role

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN _user_id IS NULL THEN false
    ELSE EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id AND role = _role
    )
  END
$$;
```

#### 4. Remover Console Logs de Produção

Atualizar os arquivos para usar logging condicional:
- `AuthContext.tsx`
- `AdminImoveis.tsx`
- `ImovelForm.tsx`

Exemplo:
```typescript
// Antes
console.error("Error:", error);

// Depois (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  console.error("Error:", error);
}
```

#### 5. Criar Tabela de Auditoria (Opcional - Melhoria)

```sql
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON public.audit_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit logs"
  ON public.audit_log FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));
```

#### 6. Ignorar Storage Bucket Warning

Justificativa: Para um site de anúncios de imóveis, as fotos de propriedades aprovadas precisam ser públicas para exibição. Isso é comportamento esperado.

### Detalhes Técnicos

#### Arquivos a Modificar:

1. **src/contexts/AuthContext.tsx** - Remover/condicionar console.error
2. **src/pages/admin/AdminImoveis.tsx** - Remover logs de debug
3. **src/components/imoveis/ImovelForm.tsx** - Condicionar logs

#### Migrações SQL:

1. Adicionar UPDATE policy para imovel_fotos
2. Atualizar função has_role com validação de NULL
3. (Opcional) Criar tabela audit_log

### Resultado Esperado

Após implementação:
- 2 findings marcados como resolvidos (falsos positivos)
- 2 findings marcados como ignorados (comportamento intencional)
- 3-4 findings efetivamente corrigidos
- Código mais seguro sem logs sensíveis em produção

### Considerações

1. **Leaked Password Protection** - Esta configuração precisa ser ativada nas configurações do backend (autenticação). Não é código que eu altero diretamente.

2. **Audit Trail** - É uma melhoria de segurança recomendada, mas não crítica. Posso implementar se desejar.

