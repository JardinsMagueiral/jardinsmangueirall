

## Plano: Corrigir Acesso de Administrador aos Imoveis

### Diagnostico Completo

Apos investigacao extensiva, confirmei que:

| Item | Status | Detalhe |
|------|--------|---------|
| Politicas RLS | OK | Todas sao PERMISSIVE e funcionando |
| Role admin | OK | `rodrigoperes.adm@gmail.com` tem role admin |
| Funcao has_role | OK | Retorna `true` para o usuario admin |
| Imoveis no banco | OK | Existem 2 imoveis com status `pendente` |
| Login recente | OK | Login bem sucedido as 16:51:25 |

**O banco de dados esta 100% correto.**

---

### Problema Identificado

O problema esta no **codigo frontend** - especificamente no `AuthContext.tsx`:

**Race Condition no carregamento:**
```typescript
// Problema: setLoading(false) pode executar ANTES de checkAdminRole terminar
if (session?.user) {
  fetchProfile(session.user.id);    // async, nao aguarda
  checkAdminRole(session.user.id);  // async, nao aguarda
}
setLoading(false);  // <-- Executa imediatamente!
```

O `ProtectedRoute` verifica `loading` e `isAdmin`. Quando `loading = false` mas `isAdmin` ainda nao foi setado (porque a promise ainda esta pendente), o usuario e redirecionado para `/minha-conta`.

---

### Solucao Proposta

**1. Corrigir AuthContext.tsx - Aguardar verificacoes antes de setar loading**

```typescript
// ANTES (problema)
supabase.auth.getSession().then(({ data: { session } }) => {
  setSession(session);
  setUser(session?.user ?? null);
  
  if (session?.user) {
    fetchProfile(session.user.id);
    checkAdminRole(session.user.id);
  }
  
  setLoading(false);  // Race condition!
});

// DEPOIS (correcao)
supabase.auth.getSession().then(async ({ data: { session } }) => {
  setSession(session);
  setUser(session?.user ?? null);
  
  if (session?.user) {
    await Promise.all([
      fetchProfile(session.user.id),
      checkAdminRole(session.user.id)
    ]);
  }
  
  setLoading(false);  // Agora aguarda as verificacoes
});
```

**2. Adicionar logs de debug temporarios no AdminImoveis**

Para confirmar que o problema foi resolvido:
```typescript
useEffect(() => {
  console.log("AdminImoveis mounted, fetching...");
  fetchImoveis();
}, []);

const fetchImoveis = async () => {
  try {
    console.log("Fetching imoveis...");
    const { data, error } = await supabase...
    console.log("Imoveis result:", { data, error });
    // ...
  }
};
```

**3. Adicionar foreign key entre imoveis e profiles (opcional)**

Para garantir que o JOIN funcione corretamente:
```sql
ALTER TABLE public.imoveis
ADD CONSTRAINT imoveis_user_id_profiles_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id);
```

Nota: Isso pode conflitar com a FK existente para `auth.users`. Uma alternativa e mudar a query para fazer o JOIN manualmente.

---

### Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/contexts/AuthContext.tsx` | Corrigir race condition com `await Promise.all()` |
| `src/pages/admin/AdminImoveis.tsx` | Adicionar logs temporarios para debug |

---

### Resultado Esperado

1. Admin logado acessa `/admin/imoveis` sem ser redirecionado
2. Todos os imoveis (pendentes, aprovados, rejeitados) aparecem na lista
3. Admin pode aprovar/rejeitar/excluir imoveis normalmente

---

### Nota sobre Teste

Apos implementar as mudancas:
1. Faca logout completo
2. Limpe o cache do navegador (Ctrl+Shift+Delete)
3. Faca login novamente com `rodrigoperes.adm@gmail.com`
4. Acesse `/admin/imoveis`

