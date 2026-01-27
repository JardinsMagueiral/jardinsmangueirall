
## Plano: Edição de Imóveis e Destaques na Homepage

### Objetivo

Permitir que administradores editem imóveis aprovados, gerenciem fotos (adicionar/remover), e exibir imóveis em destaque logo abaixo da seção de pesquisa na página inicial.

### Arquitetura Atual

```text
Homepage (Index.tsx)
├── HeroSection (contém PropertySearch)
├── WhatsAppGroups
├── CTASection
└── EventsCalendar

AdminImoveis.tsx
├── Lista de imóveis com ações
└── Botões: Aprovar, Rejeitar, Destacar, Ver, Excluir
    (Falta: Botão Editar)

ImovelForm.tsx
├── Suporta modo edição (initialData prop)
└── Upload de novas fotos
    (Falta: Visualizar/remover fotos existentes)
```

### Mudanças Necessárias

#### 1. Nova Página: Editar Imóvel (`/admin/imoveis/:id/editar`)

Criar `src/pages/admin/AdminEditarImovel.tsx`:
- Buscar dados do imóvel pelo ID
- Buscar fotos existentes do imóvel
- Usar o `ImovelForm` com `initialData` preenchido
- Permitir gerenciamento de fotos existentes

#### 2. Atualizar ImovelForm para Suportar Fotos Existentes

Modificar `src/components/imoveis/ImovelForm.tsx`:
- Adicionar prop `existingPhotos?: { id: string; url: string }[]`
- Exibir fotos existentes separadamente das novas
- Permitir remover fotos existentes (deletar do banco e storage)
- Manter funcionalidade de adicionar novas fotos

#### 3. Adicionar Botão Editar em AdminImoveis

Modificar `src/pages/admin/AdminImoveis.tsx`:
- Adicionar botão "Editar" ao lado de "Ver"
- Link para `/admin/imoveis/:id/editar`

#### 4. Novo Componente: Imóveis em Destaque

Criar `src/components/FeaturedProperties.tsx`:
- Buscar imóveis com `destaque=true` e `status='aprovado'`
- Exibir em formato de cards com carrossel ou grid
- Mostrar: foto principal, tipo, operação, preço, localização
- Link para página de detalhes

#### 5. Atualizar Homepage

Modificar `src/pages/Index.tsx`:
- Adicionar `FeaturedProperties` logo após `HeroSection`

#### 6. Adicionar Rota

Modificar `src/App.tsx`:
- Adicionar rota `/admin/imoveis/:id/editar` protegida para admin

### Estrutura Visual da Homepage

```text
+--------------------------------+
|          Header                |
+--------------------------------+
|        HeroSection             |
|   (com PropertySearch)         |
+--------------------------------+
|     FeaturedProperties         |  <-- NOVO
|   "Imóveis em Destaque"        |
|   [Card] [Card] [Card]         |
+--------------------------------+
|      WhatsAppGroups            |
+--------------------------------+
|        CTASection              |
+--------------------------------+
|      EventsCalendar            |
+--------------------------------+
|          Footer                |
+--------------------------------+
```

### Detalhes Técnicos

#### AdminEditarImovel.tsx

```typescript
// Estrutura principal
- useParams() para obter o ID
- Buscar imóvel: supabase.from("imoveis").select("*").eq("id", id)
- Buscar fotos: supabase.from("imovel_fotos").select("*").eq("imovel_id", id)
- Renderizar ImovelForm com initialData e existingPhotos
```

#### ImovelForm.tsx - Modificações

```typescript
interface ImovelFormProps {
  isAdmin?: boolean;
  initialData?: Partial<ImovelFormData> & { id?: string };
  existingPhotos?: { id: string; url: string }[];  // NOVO
  onSuccess?: () => void;
}

// Nova função para deletar foto existente
const deleteExistingPhoto = async (photoId: string, photoUrl: string) => {
  // 1. Extrair path do URL
  // 2. Deletar do storage
  // 3. Deletar da tabela imovel_fotos
  // 4. Atualizar estado local
};
```

#### FeaturedProperties.tsx

```typescript
// Query para buscar imóveis em destaque
const { data: imoveis } = await supabase
  .from("imoveis")
  .select("*")
  .eq("status", "aprovado")
  .eq("destaque", true)
  .limit(6);

// Buscar primeira foto de cada imóvel
const { data: fotos } = await supabase
  .from("imovel_fotos")
  .select("*")
  .in("imovel_id", imoveis.map(i => i.id))
  .order("ordem");
```

### Arquivos a Criar

1. `src/pages/admin/AdminEditarImovel.tsx` - Página de edição
2. `src/components/FeaturedProperties.tsx` - Seção de destaques

### Arquivos a Modificar

1. `src/App.tsx` - Adicionar nova rota
2. `src/pages/Index.tsx` - Incluir FeaturedProperties
3. `src/pages/admin/AdminImoveis.tsx` - Adicionar botão Editar
4. `src/components/imoveis/ImovelForm.tsx` - Suporte a fotos existentes

### Fluxo do Administrador

1. Acessa `/admin/imoveis`
2. Clica em "Editar" em qualquer imóvel
3. É direcionado para `/admin/imoveis/:id/editar`
4. Visualiza dados atuais e fotos existentes
5. Pode:
   - Alterar qualquer campo do formulário
   - Remover fotos existentes
   - Adicionar novas fotos
6. Clica em "Salvar Alterações"
7. Ao clicar em "Destacar", o imóvel aparece na homepage

### Considerações

- O formulário mantém o `user_id` original (não muda o proprietário)
- Admins podem editar mesmo imóveis de outros usuários (RLS já permite)
- Fotos removidas são deletadas tanto do banco quanto do storage
- O limite de 10 fotos considera fotos existentes + novas
