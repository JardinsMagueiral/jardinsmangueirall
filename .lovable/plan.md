
## Plano: Corrigir Bug de Login Travando

### Problema Identificado

A otimização anterior introduziu um bug:

```typescript
let isInitializing = false;

const initializeAuth = async (session: Session | null) => {
  if (!mounted || isInitializing) return;  // ← PROBLEMA AQUI
  isInitializing = true;
  // ...
  isInitializing = false;
};
```

**O que acontece**:
1. Usuário clica em "Entrar"
2. Login bem-sucedido no backend
3. `onAuthStateChange` dispara evento `SIGNED_IN` com nova sessão
4. Mas se `isInitializing = true` (de uma chamada anterior ainda em andamento), a função **retorna sem processar**
5. `loading` nunca vira `false` → tela trava

### Solução

Remover a flag `isInitializing` e usar uma abordagem diferente:
- Usar `setTimeout(..., 0)` no `onAuthStateChange` para defer a execução e evitar conflito com chamadas síncronas do Supabase
- Manter as queries em paralelo (essa otimização está correta)

### Mudanças

| Arquivo | Alteração |
|---------|-----------|
| `src/contexts/AuthContext.tsx` | Remover `isInitializing` e usar `setTimeout` para eventos de auth |

### Código Corrigido

```typescript
useEffect(() => {
  let mounted = true;

  const initializeAuth = async (session: Session | null) => {
    if (!mounted) return;

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
  };

  // Set up auth state listener FIRST
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      // Ignore INITIAL_SESSION as getSession() handles it
      if (event === 'INITIAL_SESSION') return;

      // Usar setTimeout para evitar conflitos com chamadas síncronas
      setTimeout(() => {
        initializeAuth(session);
      }, 0);
    }
  );

  // THEN get initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    initializeAuth(session);
  });

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);
```

### Por que isso funciona?

1. **Sem flag bloqueadora**: Remove `isInitializing` que estava causando o bloqueio
2. **setTimeout(0)**: Coloca a execução no próximo tick do event loop, evitando que `onAuthStateChange` e `getSession` colidam
3. **Mounted check**: Ainda protege contra memory leaks se o componente desmontar
4. **Queries paralelas**: Mantém a otimização de performance

### Resultado Esperado

- Login volta a funcionar normalmente
- Performance mantida (queries paralelas)
- Sem bloqueio na inicialização
