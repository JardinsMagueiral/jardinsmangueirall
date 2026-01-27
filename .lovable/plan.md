
## Plano: Corrigir Query de Imoveis no AdminImoveis

### Diagnostico Confirmado

| Item | Status | Observacao |
|------|--------|------------|
| Dashboard mostra numeros | OK | Query simples sem JOIN funciona |
| AdminImoveis mostra lista vazia | ERRO | Query com JOIN profiles falha |
| Dados no banco | OK | 1 imovel pendente existe |
| Politicas RLS | OK | Todas configuradas corretamente |

**Problema identificado**: A query com JOIN `profiles:user_id` pode estar falhando silenciosamente ou retornando array vazio quando o Supabase nao consegue resolver o relacionamento via RLS no contexto do cliente.

---

### Solucao

Modificar o `AdminImoveis.tsx` para buscar os dados em duas etapas:
1. Buscar imoveis primeiro (sem JOIN)
2. Buscar profiles separadamente
3. Combinar os dados manualmente

Esta abordagem evita o problema do JOIN com RLS e garante que os imoveis sempre aparecem.

---

### Codigo para AdminImoveis.tsx

Substituir a funcao `fetchImoveis`:

```typescript
const fetchImoveis = async () => {
  try {
    console.log("AdminImoveis mounted, fetching...");

    // Verificar sessao atual
    const { data: { session } } = await supabase.auth.getSession();
    console.log("Current session user:", session?.user?.id);

    // 1. Buscar imoveis primeiro (sem JOIN)
    const { data: imoveisData, error: imoveisError } = await supabase
      .from("imoveis")
      .select("*")
      .order("created_at", { ascending: false });

    console.log("Imoveis result:", { data: imoveisData, error: imoveisError, count: imoveisData?.length });

    if (imoveisError) {
      console.error("Supabase error fetching imoveis:", imoveisError);
      throw imoveisError;
    }

    if (!imoveisData || imoveisData.length === 0) {
      console.log("No imoveis found");
      setImoveis([]);
      return;
    }

    // 2. Buscar profiles dos proprietarios
    const userIds = [...new Set(imoveisData.map(i => i.user_id))];
    console.log("Fetching profiles for user_ids:", userIds);

    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, nome, email, telefone")
      .in("id", userIds);

    console.log("Profiles result:", { data: profilesData, error: profilesError });

    // 3. Combinar dados (mesmo se profiles falhar, ainda mostra imoveis)
    const profilesMap = new Map(
      (profilesData || []).map(p => [p.id, p])
    );

    const imoveisComProfiles = imoveisData.map(imovel => ({
      ...imovel,
      profiles: profilesMap.get(imovel.user_id) || null
    }));

    setImoveis(imoveisComProfiles as Imovel[]);
  } catch (error) {
    console.error("Error fetching imoveis:", error);
  } finally {
    setLoading(false);
  }
};
```

---

### Mudancas

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/admin/AdminImoveis.tsx` | Refatorar `fetchImoveis` para buscar dados separadamente e combinar manualmente |

---

### Beneficios

1. **Robustez**: Imoveis sempre aparecem, mesmo se o JOIN com profiles falhar
2. **Debug melhorado**: Logs separados para cada etapa
3. **Fallback**: Se profiles nao carregar, imoveis ainda aparecem (sem dados do anunciante)

---

### Por que isso resolve?

O problema do JOIN com RLS e complexo. Quando o Supabase faz um JOIN:
- Aplica RLS em ambas as tabelas
- Se uma linha do JOIN nao satisfaz a politica, a linha inteira e filtrada

Ao buscar separadamente:
- Query de imoveis usa politica "Admins can view all properties"
- Query de profiles usa politica "Admins can view all profiles"
- Nao ha conflito de JOIN

---

### Teste Apos Implementacao

1. Fazer logout
2. Limpar cache (Ctrl+Shift+R ou limpar storage)
3. Login com rodrigoperes.adm@gmail.com
4. Acessar /admin/imoveis
5. Verificar console para os logs de debug
6. O imovel pendente deve aparecer na lista
