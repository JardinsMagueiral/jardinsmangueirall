

## Plano: Melhorias no Sistema de Busca, Formulários e Admin

### Resumo das Mudanças

1. **Filtro de tipo de imóvel** - Adicionar opções: Casa, Apartamento, Terreno, Loja
2. **Visibilidade da senha** - Botão "olho mágico" nos campos de senha
3. **Entrada de preço formatada** - Aceitar valores com pontos (200.000)
4. **Lista de clientes no admin** - Ver nome, telefone e email dos clientes

---

### 1. Filtro de Tipo de Imóvel

**Arquivos a modificar:**
- `src/components/PropertySearch.tsx`
- `src/pages/Imoveis.tsx`

**Mudança no layout:**

```text
ATUAL:
[Categoria ▼]     [Operação ▼]
- Residencial     - Venda
- Comercial       - Aluguel

NOVO:
[Tipo ▼]          [Operação ▼]
- Todos           - Venda
- Casa            - Aluguel
- Apartamento
- Terreno
- Loja
```

**Lógica de filtragem:**
```typescript
// Novo estado para tipo
const [tipoFilter, setTipoFilter] = useState(searchParams.get("tipo") || "all");

// Filtragem por tipo específico
const matchesTipo = tipoFilter === "all" || imovel.tipo === tipoFilter;
```

**Nota:** "Loja" será mapeado para "comercial" no banco (valor existente).

---

### 2. Toggle de Visibilidade da Senha

**Arquivos a modificar:**
- `src/pages/auth/Cadastro.tsx`
- `src/pages/auth/Login.tsx`
- `src/pages/auth/RedefinirSenha.tsx`

**Implementação:**

Adicionar estados para controlar visibilidade:
```typescript
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
```

Substituir o Input de senha por um Input com botão:
```tsx
<div className="relative">
  <Input
    id="password"
    type={showPassword ? "text" : "password"}
    placeholder="••••••••"
    className="pr-10"
    {...register("password")}
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
  >
    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </button>
</div>
```

---

### 3. Entrada de Preço Formatada

**Arquivo a modificar:**
- `src/components/imoveis/ImovelForm.tsx`

**Problema atual:**
O campo de preço usa `type="number"`, que não aceita pontos como separador de milhar (200.000).

**Solução:**
Criar um componente de input de moeda que:
- Exibe o valor formatado (R$ 200.000,00)
- Remove formatação antes de enviar ao formulário
- Aceita digitação natural com pontos ou vírgulas

**Implementação:**
```typescript
// Estado para valor formatado
const [precoFormatado, setPrecoFormatado] = useState("");

// Função para formatar
const formatarPreco = (valor: string) => {
  // Remove tudo exceto números
  const numeros = valor.replace(/\D/g, "");
  // Converte para número
  const numero = parseInt(numeros) || 0;
  // Formata como moeda brasileira
  return numero.toLocaleString("pt-BR");
};

// Ao mudar o input
const handlePrecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const valorDigitado = e.target.value;
  const formatado = formatarPreco(valorDigitado);
  setPrecoFormatado(formatado);
  
  // Atualiza o valor real no formulário (apenas números)
  const valorNumerico = parseInt(valorDigitado.replace(/\D/g, "")) || 0;
  setValue("preco", valorNumerico);
};
```

**Campo no formulário:**
```tsx
<Input
  id="preco"
  type="text"
  inputMode="numeric"
  placeholder="200.000"
  value={precoFormatado}
  onChange={handlePrecoChange}
/>
```

Mesma lógica aplicada para campos: condomínio e IPTU.

---

### 4. Lista de Clientes no Admin

**Opção A: Adicionar à página existente de imóveis**

A página `AdminImoveis.tsx` já mostra nome e telefone do anunciante. Vou adicionar o email também:

```tsx
// Mudança na exibição
{imovel.profiles && (
  <div className="mt-2 text-sm text-muted-foreground">
    <p><strong>Anunciante:</strong> {imovel.profiles.nome}</p>
    <p><strong>Telefone:</strong> {imovel.profiles.telefone}</p>
    <p><strong>Email:</strong> {imovel.profiles.email}</p>
  </div>
)}
```

**Opção B: Nova página dedicada de clientes**

Criar nova página `/admin/clientes` que lista todos os clientes cadastrados:

| Nome | Email | Telefone | Imóveis | Ações |
|------|-------|----------|---------|-------|
| João Silva | joao@email.com | (61) 99999-9999 | 2 | Ver |

**Recomendação:** Começar com a Opção A (mais simples), pois já existe a estrutura para mostrar dados do cliente junto com o imóvel.

---

### Resumo de Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/components/PropertySearch.tsx` | Substituir categoria por tipo específico |
| `src/pages/Imoveis.tsx` | Substituir filtro categoria por tipo |
| `src/pages/auth/Cadastro.tsx` | Adicionar toggle de senha |
| `src/pages/auth/Login.tsx` | Adicionar toggle de senha |
| `src/pages/auth/RedefinirSenha.tsx` | Adicionar toggle de senha |
| `src/components/imoveis/ImovelForm.tsx` | Formatação de preço com pontos |
| `src/pages/admin/AdminImoveis.tsx` | Mostrar email do cliente |

---

### Detalhes Técnicos

**Mapeamento de tipos:**
- Casa → `casa`
- Apartamento → `apartamento`
- Terreno → `terreno`
- Loja → `comercial` (usa o tipo existente no banco)

**Ícones a importar:**
```typescript
import { Eye, EyeOff } from "lucide-react";
```

**Validação de preço:**
O schema Zod continuará validando como número, mas receberá o valor limpo (sem formatação).

