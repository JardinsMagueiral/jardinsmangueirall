
## Plano: Corrigir Visualização de Detalhes do Imóvel

### Problema Identificado

A página de detalhes do imóvel (`ImovelDetalhe.tsx`) faz um JOIN com a tabela `profiles`:

```typescript
const { data, error } = await supabase
  .from("imoveis")
  .select(`
    *,
    profiles:user_id (
      nome,
      telefone
    )
  `)
  .eq("id", id)
  .single();
```

Porém, a tabela `profiles` possui políticas RLS que **impedem leitura pública**:

| Política | Condição |
|----------|----------|
| "Admins can view all profiles" | `has_role(auth.uid(), 'admin')` |
| "Users can view their own profile" | `auth.uid() = id` |

**Visitantes não autenticados não podem ler perfis**, então a consulta com JOIN falha silenciosamente.

### Análise das Opções

**Opção 1: Adicionar política pública para profiles**
- Risco de segurança: expõe dados pessoais (nome, telefone, email, CPF) publicamente
- Não recomendado para dados sensíveis

**Opção 2: Remover o JOIN com profiles** (recomendado)
- A página já usa um número fixo de WhatsApp para contato
- O JOIN com profiles não é necessário para a funcionalidade atual
- Mantém a privacidade dos dados dos proprietários

### Solução Proposta

Modificar a consulta em `ImovelDetalhe.tsx` para **remover o JOIN com profiles**:

```typescript
const { data, error } = await supabase
  .from("imoveis")
  .select("*")
  .eq("id", id)
  .eq("status", "aprovado")  // Garantir que só mostra aprovados
  .maybeSingle();
```

### Mudanças no Código

**Arquivo: `src/pages/ImovelDetalhe.tsx`**

1. Remover a propriedade `profiles` da interface `Imovel`
2. Alterar a consulta para remover o JOIN com profiles
3. Adicionar filtro `status = 'aprovado'` para segurança extra
4. Usar `.maybeSingle()` ao invés de `.single()` para evitar erro quando não encontra

### Resultado Esperado

- Visitantes não autenticados conseguirão ver detalhes de imóveis aprovados
- As fotos serão exibidas corretamente
- O botão de WhatsApp continuará funcionando (usa número fixo)
- Dados pessoais dos proprietários permanecem protegidos
