
## Plano: Correcao Definitiva do Acesso Admin

### Diagnostico Final

Apos analise profunda, identifiquei que:

| Item | Status | Observacao |
|------|--------|------------|
| Dados no banco | OK | 1 imovel pendente existe |
| Politicas RLS | OK | Todas PERMISSIVE |
| Role admin no banco | OK | Usuario tem role admin |
| Foreign Key | OK | Ja existe entre imoveis e profiles |

**Problema raiz**: Conflito entre `getSession()` e `onAuthStateChange()` no AuthContext.tsx

O fluxo atual causa problemas:

```text
1. Componente monta
2. onAuthStateChange registrado
3. getSession() chamado
4. getSession() resolve -> chama fetchProfile + checkAdminRole -> setLoading(false)
5. onAuthStateChange dispara (INITIAL_SESSION event) -> inicia OUTRO ciclo
6. Conflito de estados
```

### Solucao

Refatorar o AuthContext para ter um unico fluxo de inicializacao que garante que:
1. `isAdmin` seja verificado ANTES de `loading = false`
2. Nao haja conflito entre os dois metodos de recuperar sessao

### Codigo Proposto para AuthContext.tsx

```typescript
useEffect(() => {
  let mounted = true;
  
  const initializeAuth = async (session: Session | null) => {
    if (!mounted) return;
    
    setSession(session);
    setUser(session?.user ?? null);
    
    if (session?.user) {
      await fetchProfile(session.user.id);
      await checkAdminRole(session.user.id);
    } else {
      setProfile(null);
      setIsAdmin(false);
    }
    
    if (mounted) {
      setLoading(false);
    }
  };
  
  // Configurar listener PRIMEIRO
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      // Ignorar evento INITIAL_SESSION pois getSession() ja trata
      if (event === 'INITIAL_SESSION') return;
      
      await initializeAuth(session);
    }
  );
  
  // Buscar sessao inicial
  supabase.auth.getSession().then(({ data: { session } }) => {
    initializeAuth(session);
  });
  
  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);
```

### Adicionar Debug no AdminImoveis

Para confirmar que as queries funcionam, adicionar log detalhado:

```typescript
const fetchImoveis = async () => {
  try {
    console.log("Fetching imoveis...");
    
    // Verificar sessao atual
    const { data: { session } } = await supabase.auth.getSession();
    console.log("Current session user:", session?.user?.id);
    
    const { data, error } = await supabase
      .from("imoveis")
      .select(`
        *,
        profiles:user_id (
          nome,
          email,
          telefone
        )
      `)
      .order("created_at", { ascending: false });
    
    console.log("Imoveis result:", { data, error, count: data?.length });
    
    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }
    
    setImoveis((data as unknown as Imovel[]) || []);
  } catch (error) {
    console.error("Error fetching imoveis:", error);
  } finally {
    setLoading(false);
  }
};
```

### Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/contexts/AuthContext.tsx` | Refatorar para evitar conflito getSession/onAuthStateChange |
| `src/pages/admin/AdminImoveis.tsx` | Adicionar logs detalhados para debug |

### Resultado Esperado

1. Admin acessa `/admin` e ve estatisticas corretas
2. Admin clica em "Gerenciar Imoveis" e ve a lista de imoveis
3. Admin pode aprovar/rejeitar/excluir imoveis

### Instrucoes de Teste

1. Fazer logout completo
2. Fechar todas as abas do navegador com o site
3. Abrir DevTools (F12) -> Console
4. Fazer login com `rodrigoperes.adm@gmail.com`
5. Acessar `/admin/imoveis`
6. Verificar os logs no console para diagnosticar o problema

Os logs mostrarao:
- Se o usuario esta autenticado corretamente
- Se a query esta retornando dados ou erro
- Qual erro especifico esta ocorrendo (se houver)
