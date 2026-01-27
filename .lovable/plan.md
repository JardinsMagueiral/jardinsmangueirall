

## Plano: Corrigir Acesso Admin e Carregamento de Imoveis

### Problemas Identificados

Apos investigacao detalhada, encontrei **dois problemas**:

| Problema | Descricao | Impacto |
|----------|-----------|---------|
| Race Condition no AuthContext | O `onAuthStateChange` usa `setTimeout` com async callback que nao e aguardado antes de `setLoading(false)` | Admin pode ser redirecionado antes de `isAdmin` ser verificado |
| Falta de Foreign Key | A tabela `imoveis` nao tem FK para `profiles`, entao a sintaxe `profiles:user_id` do Supabase nao funciona | Query retorna array vazio ou dados incompletos |

---

### Solucao 1: Corrigir Race Condition no AuthContext

**Arquivo**: `src/contexts/AuthContext.tsx`

O problema esta nas linhas 77-88:

```typescript
// PROBLEMA: setTimeout com callback async nao e aguardado
if (session?.user) {
  setTimeout(async () => {
    await fetchProfile(session.user.id);
    await checkAdminRole(session.user.id);
  }, 0);
} else {
  setProfile(null);
  setIsAdmin(false);
}

setLoading(false);  // Executa ANTES do setTimeout terminar!
```

**Correcao**: Mover `setLoading(false)` para dentro do callback ou usar uma abordagem diferente:

```typescript
if (session?.user) {
  // Usar setTimeout para evitar deadlock, mas setar loading dentro
  setTimeout(async () => {
    await fetchProfile(session.user.id);
    await checkAdminRole(session.user.id);
    setLoading(false);  // Agora e executado APOS as verificacoes
  }, 0);
} else {
  setProfile(null);
  setIsAdmin(false);
  setLoading(false);  // So seta loading quando nao ha usuario
}
```

---

### Solucao 2: Adicionar Foreign Key entre imoveis e profiles

**Tipo**: Migracao SQL

```sql
ALTER TABLE public.imoveis
ADD CONSTRAINT imoveis_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id);
```

Isso permite que o Supabase client use a sintaxe:
```typescript
.select(`*, profiles:user_id (nome, email, telefone)`)
```

---

### Solucao Alternativa para Query (caso FK nao seja desejavel)

Se preferir nao adicionar a FK, podemos modificar a query no `AdminImoveis.tsx` para buscar os dados separadamente:

```typescript
const fetchImoveis = async () => {
  try {
    // Buscar imoveis primeiro
    const { data: imoveisData, error: imoveisError } = await supabase
      .from("imoveis")
      .select("*")
      .order("created_at", { ascending: false });

    if (imoveisError) throw imoveisError;

    // Buscar profiles dos users
    const userIds = [...new Set(imoveisData?.map(i => i.user_id) || [])];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, nome, email, telefone")
      .in("id", userIds);

    // Combinar dados
    const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
    const imoveisComProfiles = imoveisData?.map(imovel => ({
      ...imovel,
      profiles: profilesMap.get(imovel.user_id) || null
    })) || [];

    setImoveis(imoveisComProfiles as Imovel[]);
  } catch (error) {
    console.error("Error fetching imoveis:", error);
  } finally {
    setLoading(false);
  }
};
```

---

### Resumo das Alteracoes

| Arquivo | Alteracao |
|---------|-----------|
| `src/contexts/AuthContext.tsx` | Mover `setLoading(false)` para dentro do setTimeout ou condicional |
| **Opcao A**: Migracao SQL | Adicionar FK `imoveis.user_id` -> `profiles.id` |
| **Opcao B**: `src/pages/admin/AdminImoveis.tsx` | Modificar query para buscar dados separadamente |

---

### Recomendacao

Recomendo implementar:
1. **Correcao do AuthContext** (obrigatorio)
2. **Adicionar a Foreign Key** (preferivel, mais simples e correto)

Isso vai resolver:
- O problema de redirecionamento do admin
- O problema de imoveis nao aparecerem
- Vai permitir que os dados do anunciante aparecam corretamente

---

### Passos de Teste

1. Fazer logout completo
2. Limpar cache do navegador
3. Fazer login com `rodrigoperes.adm@gmail.com`
4. Acessar `/admin/imoveis`
5. Verificar se o imovel pendente aparece

