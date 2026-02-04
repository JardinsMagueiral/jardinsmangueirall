

## Plano: Página de Clientes no Admin

### Objetivo

1. Remover informações do anunciante da página AdminImoveis
2. Criar nova página `/admin/clientes` com lista de todos os usuários cadastrados

---

### 1. Remover Informações do Anunciante

**Arquivo:** `src/pages/admin/AdminImoveis.tsx`

Remover o bloco que exibe nome, telefone e email do anunciante:
```tsx
// REMOVER este bloco:
{imovel.profiles && (
  <div className="mt-2 text-sm text-muted-foreground space-y-0.5">
    <p><strong>Anunciante:</strong> {imovel.profiles.nome}</p>
    <p><strong>Telefone:</strong> {imovel.profiles.telefone}</p>
    <p><strong>Email:</strong> {imovel.profiles.email}</p>
  </div>
)}
```

---

### 2. Criar Nova Página de Clientes

**Novo arquivo:** `src/pages/admin/AdminClientes.tsx`

Lista todos os usuários cadastrados no site com:
- Nome
- Email
- Telefone
- Data de cadastro
- Quantidade de imóveis

**Layout da página:**

```text
┌─────────────────────────────────────────────────────────────┐
│ ← Voltar                                                    │
│                                                             │
│ Clientes Cadastrados                                        │
│ X clientes encontrados                                      │
├─────────────────────────────────────────────────────────────┤
│ Nome            │ Email            │ Telefone   │ Imóveis  │
├─────────────────┼──────────────────┼────────────┼──────────┤
│ João Silva      │ joao@email.com   │ 61 99999.. │ 2        │
│ Maria Santos    │ maria@email.com  │ 61 88888.. │ 1        │
│ Pedro Costa     │ pedro@email.com  │ 61 77777.. │ 0        │
└─────────────────────────────────────────────────────────────┘
```

**Estrutura do componente:**

```typescript
interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  created_at: string;
  imoveis_count: number;
}

// Buscar todos os profiles
const { data: profiles } = await supabase
  .from("profiles")
  .select("*")
  .order("created_at", { ascending: false });

// Contar imóveis por usuário
const { data: imoveisCount } = await supabase
  .from("imoveis")
  .select("user_id");

// Combinar dados
const clientes = profiles.map(profile => ({
  ...profile,
  imoveis_count: imoveisCount.filter(i => i.user_id === profile.id).length
}));
```

---

### 3. Adicionar Rota no App.tsx

```typescript
import AdminClientes from "./pages/admin/AdminClientes";

// Nova rota
<Route
  path="/admin/clientes"
  element={
    <ProtectedRoute requireAdmin>
      <AdminClientes />
    </ProtectedRoute>
  }
/>
```

---

### 4. Adicionar Link no Dashboard

**Arquivo:** `src/pages/admin/AdminDashboard.tsx`

Adicionar card para acessar a página de clientes:

```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Users className="h-5 w-5" />
      Clientes Cadastrados
    </CardTitle>
    <CardDescription>
      Ver todos os usuários cadastrados no site
    </CardDescription>
  </CardHeader>
  <CardContent>
    <Button asChild className="w-full">
      <Link to="/admin/clientes">Ver Clientes</Link>
    </Button>
  </CardContent>
</Card>
```

---

### Resumo de Arquivos

| Arquivo | Ação |
|---------|------|
| `src/pages/admin/AdminImoveis.tsx` | Remover bloco de informações do anunciante |
| `src/pages/admin/AdminClientes.tsx` | **Criar** nova página com lista de clientes |
| `src/App.tsx` | Adicionar rota `/admin/clientes` |
| `src/pages/admin/AdminDashboard.tsx` | Adicionar card de acesso à página de clientes |

---

### Detalhes Técnicos

**Componentes utilizados:**
- Table, TableHeader, TableBody, TableRow, TableHead, TableCell (do shadcn/ui)
- Card, Button, Badge
- Loader2 para loading state

**Ícone:** `Users` do lucide-react

**Formatação de telefone:** Exibir como está salvo no banco

**Ordenação padrão:** Por data de cadastro (mais recentes primeiro)

