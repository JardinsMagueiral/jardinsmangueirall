

## Plano: Corrigir Políticas RLS para Visualização Pública

### Problema Identificado

As políticas RLS das tabelas `imoveis` e `imovel_fotos` estão todas configuradas como **RESTRICTIVE**, mesmo após as migrações anteriores. Com políticas RESTRICTIVE:

- Lógica: Usuário precisa satisfazer **TODAS** as políticas
- Visitante anônimo: satisfaz "aprovado" ✓, mas não satisfaz "admin" ✗ nem "próprio usuário" ✗
- Resultado: Acesso negado

### Solução

Precisamos **explicitamente** recriar as políticas como `AS PERMISSIVE`:

| Tabela | Política | Ação |
|--------|----------|------|
| `imoveis` | Todas as políticas SELECT | Recriar com `AS PERMISSIVE` |
| `imovel_fotos` | Todas as políticas SELECT | Recriar com `AS PERMISSIVE` |

### Mudanças no Banco de Dados

```sql
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
```

### Por que vai funcionar agora?

1. `AS PERMISSIVE` é especificado **explicitamente** na criação da política
2. `TO public` permite acesso a usuários anônimos (não autenticados)
3. Com políticas PERMISSIVE, basta **qualquer uma** ser satisfeita para liberar acesso
4. Visitante anônimo satisfaz `status = 'aprovado'` → acesso concedido ✓

### Resultado Esperado

- Visitantes não autenticados conseguirão ver imóveis aprovados
- Visitantes não autenticados conseguirão ver fotos de imóveis aprovados
- Admins continuam vendo todos os registros
- Usuários logados continuam vendo seus próprios imóveis
- Nenhuma mudança de código necessária

