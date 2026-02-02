

## Plano: Filtros de Categoria e Operação

### Objetivo

Simplificar os filtros de busca de imóveis usando duas categorias principais:
- **Categoria**: Residencial ou Comercial
- **Operação**: Aluguel ou Venda

### Mudança Visual

```text
ANTES (filtro atual):
┌──────────────────────────────────────────────────────┐
│ [Busca...]  [Todos os tipos ▼]  [Venda e Aluguel ▼] │
│             - Casa                                   │
│             - Apartamento                            │
│             - Terreno                                │
│             - Comercial                              │
└──────────────────────────────────────────────────────┘

DEPOIS (novo filtro):
┌──────────────────────────────────────────────────────┐
│ [Busca...]  [Categoria ▼]      [Operação ▼]         │
│             - Todos             - Todos              │
│             - Residencial       - Venda              │
│             - Comercial         - Aluguel            │
└──────────────────────────────────────────────────────┘
```

### Mapeamento de Categorias

| Categoria | Tipos incluídos |
|-----------|-----------------|
| Residencial | casa, apartamento |
| Comercial | comercial, terreno |

### Arquivos a Modificar

1. **src/components/PropertySearch.tsx** (busca na homepage)
   - Adicionar filtro de categoria (residencial/comercial)
   - Adicionar filtro de operação (venda/aluguel)
   - Passar esses filtros como query params para /imoveis

2. **src/pages/Imoveis.tsx** (página de listagem)
   - Substituir filtro de tipo individual por filtro de categoria
   - Ler parâmetros de categoria e operação da URL
   - Ajustar lógica de filtragem para agrupar tipos

### Mudanças no PropertySearch.tsx

Adicionar dois novos selects:

```typescript
// Novo estado
const [categoria, setCategoria] = useState("");
const [operacao, setOperacao] = useState("");

// Novo select de Categoria
<Select value={categoria} onValueChange={setCategoria}>
  <SelectTrigger>
    <Home className="mr-2 h-5 w-5" />
    <SelectValue placeholder="Categoria" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">Todos</SelectItem>
    <SelectItem value="residencial">Residencial</SelectItem>
    <SelectItem value="comercial">Comercial</SelectItem>
  </SelectContent>
</Select>

// Novo select de Operação
<Select value={operacao} onValueChange={setOperacao}>
  <SelectTrigger>
    <Key className="mr-2 h-5 w-5" />
    <SelectValue placeholder="Operação" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">Todos</SelectItem>
    <SelectItem value="venda">Venda</SelectItem>
    <SelectItem value="aluguel">Aluguel</SelectItem>
  </SelectContent>
</Select>
```

### Mudanças no Imoveis.tsx

Atualizar a lógica de filtragem:

```typescript
// Estado para categoria
const [categoriaFilter, setCategoriaFilter] = useState(
  searchParams.get("categoria") || "all"
);

// Lógica de filtragem atualizada
const filteredImoveis = imoveis.filter((imovel) => {
  // Categoria: residencial = casa/apartamento, comercial = comercial/terreno
  const tiposResidenciais = ["casa", "apartamento"];
  const tiposComerciais = ["comercial", "terreno"];
  
  const matchesCategoria = 
    categoriaFilter === "all" ||
    (categoriaFilter === "residencial" && tiposResidenciais.includes(imovel.tipo)) ||
    (categoriaFilter === "comercial" && tiposComerciais.includes(imovel.tipo));
  
  const matchesOperacao = operacaoFilter === "all" || imovel.operacao === operacaoFilter;
  
  // ... resto dos filtros
});
```

### Detalhes Técnicos

**Parâmetros de URL:**
- `categoria=residencial` ou `categoria=comercial`
- `operacao=venda` ou `operacao=aluguel`

**Exemplo de URL:**
```
/imoveis?categoria=residencial&operacao=aluguel
```

### Layout do Formulário de Busca

```text
┌────────────────────────────────────────────────┐
│        Encontre O Seu Sonho                    │
├────────────────────────────────────────────────┤
│ [🔍 Localização                           ]    │
│                                                │
│ [🏠 Categoria ▼]     [🔑 Operação ▼]          │
│                                                │
│ [💲 Valor mín.]      [💲 Valor máx.]          │
│                                                │
│ [🛏️ Quartos ▼]       [🚿 Banheiros ▼]         │
│                                                │
│ [        🔍 Buscar Imóveis              ]     │
└────────────────────────────────────────────────┘
```

### Resumo das Mudanças

| Arquivo | Mudança |
|---------|---------|
| PropertySearch.tsx | Adicionar filtros categoria e operação |
| Imoveis.tsx | Substituir filtro tipo por categoria, ajustar lógica |

