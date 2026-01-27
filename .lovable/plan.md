
## Plano: Corrigir Visualização Pública de Imóveis e Fotos

### Problema Identificado

As políticas RLS das tabelas `imoveis` e `imovel_fotos` estão configuradas como **RESTRICTIVE** ao invés de **PERMISSIVE**:

```
Policy Name: Anyone can view approved properties 
Command: SELECT
Permissive: No  ← PROBLEMA!
```

**Como funciona:**
- **PERMISSIVE (padrão)**: Acesso concedido se **qualquer** política for satisfeita
- **RESTRICTIVE**: Acesso só concedido se **todas** as políticas forem satisfeitas

**Resultado atual:**
Um visitante não autenticado precisa satisfazer:
1. "Anyone can view approved properties" ✓
2. "Admins can view all properties" ✗ (não é admin)
3. "Users can view their own properties" ✗ (não está logado)

Como todas são RESTRICTIVE, nenhum dado é retornado!

### Solução

Recriar as políticas de SELECT público como **PERMISSIVE** (padrão):

| Tabela | Política | Ação |
|--------|----------|------|
| `imoveis` | "Anyone can view approved properties" | Recriar como PERMISSIVE |
| `imovel_fotos` | "Anyone can view photos of approved properties" | Recriar como PERMISSIVE |

### Mudanças no Banco de Dados

```sql
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
```

### Por que isso resolve?

1. **Políticas PERMISSIVE** (padrão) funcionam com lógica **OR**
2. Se qualquer política PERMISSIVE for satisfeita, o acesso é concedido
3. Um visitante não autenticado acessando imóveis aprovados terá acesso porque:
   - `status = 'aprovado'` é verdadeiro ✓
   - Não importa que as outras políticas (admin, próprio usuário) não sejam satisfeitas

### Resultado Esperado

- Visitantes não autenticados verão imóveis aprovados
- Visitantes não autenticados verão fotos de imóveis aprovados
- Admins continuam vendo tudo
- Usuários logados continuam vendo seus próprios imóveis

### Nenhuma mudança no código

O código atual em `src/pages/Imoveis.tsx` e `src/pages/ImovelDetalhe.tsx` já está correto - apenas as políticas RLS precisam ser ajustadas.
