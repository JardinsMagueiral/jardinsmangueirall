

## Plano: Otimizar Performance do Login

### Problema Identificado

O login está lento porque:

1. **Chamadas sequenciais**: `fetchProfile` e `checkAdminRole` são executadas uma após a outra (await + await), dobrando o tempo de espera
2. **Chamadas duplicadas**: Quando o usuário faz login, tanto `getSession()` quanto `onAuthStateChange` (evento SIGNED_IN) executam `initializeAuth`, resultando em 4 queries ao banco ao invés de 2

### Solução

1. **Executar queries em paralelo** usando `Promise.all()`
2. **Evitar duplicação** verificando se já está inicializando

### Mudanças Propostas

| Arquivo | Alteração |
|---------|-----------|
| `src/contexts/AuthContext.tsx` | Otimizar com Promise.all e evitar duplicação |

### Código Otimizado

```typescript
useEffect(() => {
  let mounted = true;
  let isInitializing = false; // Flag para evitar duplicação

  const initializeAuth = async (session: Session | null) => {
    if (!mounted || isInitializing) return;
    isInitializing = true;

    setSession(session);
    setUser(session?.user ?? null);

    if (session?.user) {
      // Executar ambas as queries EM PARALELO (2x mais rápido)
      await Promise.all([
        fetchProfile(session.user.id),
        checkAdminRole(session.user.id)
      ]);
    } else {
      setProfile(null);
      setIsAdmin(false);
    }

    if (mounted) {
      setLoading(false);
    }
    isInitializing = false;
  };

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      // Ignorar INITIAL_SESSION pois getSession() já trata
      if (event === 'INITIAL_SESSION') return;
      
      await initializeAuth(session);
    }
  );

  supabase.auth.getSession().then(({ data: { session } }) => {
    initializeAuth(session);
  });

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);
```

### Benefícios

| Antes | Depois |
|-------|--------|
| fetchProfile → aguarda → checkAdminRole | fetchProfile + checkAdminRole (simultâneo) |
| ~400-600ms total | ~200-300ms total |
| Possível duplicação de chamadas | Proteção contra duplicação |

### Resultado Esperado

- Login aproximadamente **2x mais rápido**
- Sem chamadas duplicadas ao banco de dados
- Mesma funcionalidade mantida

