

## Plano: Edição de Imóveis pelo Cliente (Apenas Pendentes)

### Objetivo

Permitir que clientes possam visualizar e editar seus imóveis enquanto aguardam aprovação. Após a aprovação, apenas administradores podem editar.

### Situação Atual

```text
Cliente (MinhaConta.tsx)
├── Botão "Editar" aponta para /minha-conta/editar-imovel/:id
├── Botão "Ver" aponta para /imoveis/:id
└── PROBLEMA: Rota de edição não existe no App.tsx

ImovelDetalhe.tsx (página pública)
├── Mostra apenas imóveis aprovados
└── PROBLEMA: Cliente não consegue ver seu próprio imóvel pendente
```

### Novo Fluxo

```text
Imóvel PENDENTE ou REJEITADO:
├── Cliente PODE editar e visualizar
├── Admin PODE editar e visualizar

Imóvel APROVADO:
├── Cliente NÃO pode editar (apenas visualizar)
├── Admin PODE editar e visualizar
```

### Mudanças Necessárias

#### 1. Criar Página de Edição do Cliente

Criar `src/pages/cliente/EditarImovel.tsx`:
- Buscar imóvel pelo ID
- Verificar se pertence ao usuário logado
- Verificar se status permite edição (pendente ou rejeitado)
- Se aprovado, mostrar mensagem informando que não pode editar
- Usar o `ImovelForm` existente

#### 2. Registrar Nova Rota

Modificar `src/App.tsx`:
- Adicionar rota `/minha-conta/editar-imovel/:id` protegida

#### 3. Atualizar Interface da MinhaConta

Modificar `src/pages/cliente/MinhaConta.tsx`:
- Desabilitar/esconder botão "Editar" quando status for "aprovado"
- Mostrar tooltip explicando que só admin pode editar após aprovação
- Manter botão "Ver" sempre visível

#### 4. Criar Página de Visualização para o Proprietário

Modificar `src/pages/ImovelDetalhe.tsx`:
- Permitir que proprietário veja seu próprio imóvel, independente do status
- Manter restrição de `aprovado` para visitantes públicos

#### 5. Ajustar RLS Policy de UPDATE

A política atual permite atualização sem restrição por status. Precisamos restringir:
- Usuários podem atualizar apenas imóveis PENDENTES ou REJEITADOS
- Admins podem atualizar qualquer imóvel

### Estrutura Visual

```text
+------------------------------------------+
|  MinhaConta - Lista de Imóveis           |
+------------------------------------------+
|  Casa para Venda | Pendente              |
|  Rua ABC, 123                            |
|  [Ver] [Editar] [Excluir]                |  <- Editar habilitado
|------------------------------------------|
|  Apartamento para Aluguel | Aprovado     |
|  Rua XYZ, 456                            |
|  [Ver] [Excluir]                         |  <- Sem Editar
|  "Imóvel aprovado - apenas admin edita"  |
|------------------------------------------|
|  Casa para Venda | Rejeitado             |
|  Rua DEF, 789                            |
|  [Ver] [Editar] [Excluir]                |  <- Editar habilitado
+------------------------------------------+
```

### Detalhes Técnicos

#### EditarImovel.tsx (Nova Página)

```typescript
export default function EditarImovel() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [imovel, setImovel] = useState(null);
  const [canEdit, setCanEdit] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("imoveis")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();
      
      if (data) {
        setImovel(data);
        // Pode editar se não estiver aprovado
        setCanEdit(data.status !== "aprovado");
      }
    };
    fetchData();
  }, [id, user]);

  if (!canEdit) {
    return (
      <div>
        <p>Este imóvel já foi aprovado e não pode mais ser editado.</p>
        <p>Entre em contato com a administração para alterações.</p>
        <Button onClick={() => navigate("/minha-conta")}>Voltar</Button>
      </div>
    );
  }

  return <ImovelForm initialData={imovel} existingPhotos={fotos} />;
}
```

#### RLS Policy Atualizada

```sql
-- Remover política antiga
DROP POLICY IF EXISTS "Users can update their own properties" ON public.imoveis;

-- Nova política: usuários editam apenas pendentes/rejeitados
CREATE POLICY "Users can update their own pending properties"
ON public.imoveis
FOR UPDATE
TO public
USING (
  auth.uid() = user_id 
  AND status IN ('pendente', 'rejeitado')
);
```

#### ImovelDetalhe.tsx - Permitir Proprietário Ver

```typescript
const fetchImovel = async () => {
  // Se usuário logado, verificar se é proprietário
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;

  let query = supabase
    .from("imoveis")
    .select("*")
    .eq("id", id);

  // Se não for o proprietário, exigir status aprovado
  if (!userId) {
    query = query.eq("status", "aprovado");
  }

  const { data } = await query.maybeSingle();
  
  // Se tem dados mas usuário não é proprietário e não está aprovado
  if (data && userId !== data.user_id && data.status !== "aprovado") {
    setImovel(null); // Não mostrar
  } else {
    setImovel(data);
  }
};
```

### Arquivos a Criar

1. `src/pages/cliente/EditarImovel.tsx` - Página de edição para clientes

### Arquivos a Modificar

1. `src/App.tsx` - Registrar nova rota
2. `src/pages/cliente/MinhaConta.tsx` - Condicionar botão Editar
3. `src/pages/ImovelDetalhe.tsx` - Permitir proprietário visualizar

### Migração SQL

```sql
-- Ajustar política de UPDATE para restringir por status
DROP POLICY IF EXISTS "Users can update their own properties" ON public.imoveis;

CREATE POLICY "Users can update their own pending properties"
ON public.imoveis
FOR UPDATE
TO public
USING (
  auth.uid() = user_id 
  AND status IN ('pendente', 'rejeitado')
);
```

### Considerações de Segurança

- RLS garante que mesmo se cliente tentar editar via API, será bloqueado
- Verificação dupla: frontend (UX) + backend (segurança)
- Admin mantém acesso total via política separada

### Experiência do Usuário

1. Cliente cadastra imóvel (status: pendente)
2. Pode visualizar e editar enquanto aguarda
3. Ao ser rejeitado, pode corrigir e reenviar
4. Ao ser aprovado, não pode mais editar (mensagem clara)
5. Para alterações pós-aprovação, contata administração

