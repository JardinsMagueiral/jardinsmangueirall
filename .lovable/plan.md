
## Plano: Corrigir Visibilidade de Imoveis para Administradores

### Problema Identificado

As politicas RLS (Row Level Security) da tabela `imoveis` estao configuradas como **RESTRICTIVE** (`Permissive: No`), o que significa que todas as condicoes precisam ser atendidas simultaneamente (AND).

Por exemplo, para um admin ver um imovel:
- A policy "Admins can view all properties" precisa passar **E**
- A policy "Anyone can view approved properties" precisa passar **E**
- A policy "Users can view their own properties" precisa passar

Como o imovel nao pertence ao admin e nao esta aprovado, o admin nao consegue ver.

### Solucao

Recriar as politicas SELECT como **PERMISSIVE** (padrao), assim qualquer uma das condicoes permite o acesso (OR).

---

### Alteracoes Necessarias

**Migracao SQL para corrigir as politicas RLS:**

```sql
-- Remover policies restritivas atuais
DROP POLICY IF EXISTS "Admins can view all properties" ON public.imoveis;
DROP POLICY IF EXISTS "Anyone can view approved properties" ON public.imoveis;
DROP POLICY IF EXISTS "Users can view their own properties" ON public.imoveis;

-- Recriar como PERMISSIVE (padrao)
CREATE POLICY "Admins can view all properties"
  ON public.imoveis FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view approved properties"
  ON public.imoveis FOR SELECT
  USING (status = 'aprovado');

CREATE POLICY "Users can view their own properties"
  ON public.imoveis FOR SELECT
  USING (auth.uid() = user_id);
```

---

### Politica para Profiles (Permitir Admin Ver Dados do Anunciante)

O admin tambem precisa ver o nome/telefone do anunciante no painel. Atualmente, a tabela `profiles` so permite que usuarios vejam seu proprio perfil.

```sql
-- Adicionar policy para admin ver profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
```

---

### Resumo das Alteracoes

| Tabela | Acao | Motivo |
|--------|------|--------|
| imoveis | Recriar 3 policies SELECT como permissivas | Permitir que qualquer condicao (admin OU dono OU aprovado) libere acesso |
| profiles | Adicionar policy SELECT para admin | Permitir que admin veja dados do anunciante |

---

### Resultado Esperado

1. **Admin logado**: Vera TODOS os imoveis no painel `/admin/imoveis` (pendentes, aprovados, rejeitados)
2. **Publico sem login**: Vera apenas imoveis com status `aprovado` em `/imoveis`
3. **Usuario logado**: Vera seus proprios imoveis + imoveis aprovados

---

### Codigo Existente

O codigo das paginas ja esta correto:
- `AdminImoveis.tsx` busca todos os imoveis (sem filtro de status na query)
- `Imoveis.tsx` filtra por `status = 'aprovado'`

Nenhuma alteracao de codigo e necessaria, apenas a correcao das politicas RLS no banco de dados.
