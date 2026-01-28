

## Plano: Adicionar 3 Fotos por Parceiro

### Objetivo

Permitir que cada parceiro cadastre até 3 fotos do seu negócio, serviço ou produtos. As fotos serão exibidas em um carrossel no card do parceiro, similar ao funcionamento das fotos de imóveis.

### Arquitetura

Seguindo o mesmo padrão de `imovel_fotos`, criaremos uma tabela separada para as fotos:

```text
┌─────────────────┐         ┌──────────────────┐
│    parceiros    │ 1 ── N  │  parceiro_fotos  │
├─────────────────┤         ├──────────────────┤
│ id (uuid)       │◄────────│ parceiro_id      │
│ nome            │         │ id (uuid)        │
│ categoria       │         │ url (text)       │
│ ...             │         │ ordem (integer)  │
└─────────────────┘         │ created_at       │
                            └──────────────────┘
```

### Fluxo Visual

```text
CARD DO PARCEIRO COM FOTOS:
┌──────────────────────────────┐
│ ┌──────────────────────────┐ │
│ │    [Foto 1]  ●○○        │ │  ← Carrossel com indicadores
│ │    ◄        ►           │ │  ← Setas de navegação
│ └──────────────────────────┘ │
│ [Categoria]          ★      │
│ Nome do Negócio             │
│ Descrição...                │
│ 📍 Endereço                 │
│ [WhatsApp] [Instagram] [Site]│
└──────────────────────────────┘
```

### Mudanças Necessárias

#### 1. Banco de Dados

Criar tabela `parceiro_fotos`:

```sql
CREATE TABLE public.parceiro_fotos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parceiro_id uuid NOT NULL REFERENCES public.parceiros(id) ON DELETE CASCADE,
  url text NOT NULL,
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.parceiro_fotos ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Anyone can view photos of approved partners"
ON public.parceiro_fotos FOR SELECT
USING (EXISTS (
  SELECT 1 FROM parceiros
  WHERE parceiros.id = parceiro_fotos.parceiro_id
  AND parceiros.status = 'aprovado'
));

CREATE POLICY "Users can view photos of their own partners"
ON public.parceiro_fotos FOR SELECT
USING (EXISTS (
  SELECT 1 FROM parceiros
  WHERE parceiros.id = parceiro_fotos.parceiro_id
  AND parceiros.user_id = auth.uid()
));

CREATE POLICY "Users can insert photos for their own partners"
ON public.parceiro_fotos FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM parceiros
  WHERE parceiros.id = parceiro_fotos.parceiro_id
  AND parceiros.user_id = auth.uid()
));

CREATE POLICY "Users can delete photos of their own partners"
ON public.parceiro_fotos FOR DELETE
USING (EXISTS (
  SELECT 1 FROM parceiros
  WHERE parceiros.id = parceiro_fotos.parceiro_id
  AND parceiros.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all partner photos"
ON public.parceiro_fotos FOR ALL
USING (has_role(auth.uid(), 'admin'));
```

#### 2. Storage Bucket

Criar bucket `parceiros` para armazenar as fotos:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('parceiros', 'parceiros', true);

-- Políticas de storage
CREATE POLICY "Authenticated users can upload partner images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'parceiros');

CREATE POLICY "Anyone can view partner images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'parceiros');

CREATE POLICY "Users can delete their own partner images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'parceiros');
```

#### 3. Formulário de Cadastro (Parceiros.tsx)

Adicionar campo de upload de fotos:

```text
FORMULÁRIO ATUALIZADO:
┌──────────────────────────────┐
│ Nome do Negócio*             │
│ [________________________]   │
│                              │
│ Categoria*                   │
│ [Dropdown____________ v]     │
│                              │
│ Fotos do Negócio (até 3)     │  ← NOVO
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ │
│ │ +  │ │foto│ │foto│ │foto│ │
│ └────┘ └────┘ └────┘ └────┘ │
│                              │
│ Descrição                    │
│ [________________________]   │
│ ...                          │
└──────────────────────────────┘
```

Mudanças:
- Adicionar estado para fotos selecionadas
- Componente de preview das fotos com botão de remover
- Validação: máximo 3 fotos, 5MB cada, tipos JPEG/PNG/WebP
- Upload após criar o parceiro (igual imóveis)

#### 4. Listagem Pública (Parceiros.tsx)

Modificar o card para exibir carrossel:

- Buscar fotos junto com parceiros
- Usar componente Carousel do shadcn/ui
- Exibir indicadores (bolinhas) se houver mais de 1 foto
- Fallback para logo_url se não tiver fotos

#### 5. Página Admin (AdminParceiros.tsx)

Exibir fotos no card do parceiro:
- Mostrar primeira foto ou todas em miniatura
- Permitir visualizar fotos
- Deletar fotos junto com o parceiro

### Componentes a Usar

- `Carousel`, `CarouselContent`, `CarouselItem` (já existe em `src/components/ui/carousel.tsx`)
- Padrão de upload similar ao `ImovelForm.tsx`

### Arquivos a Criar

Nenhum arquivo novo necessário.

### Arquivos a Modificar

1. `src/pages/Parceiros.tsx` - Upload de fotos no formulário + carrossel na listagem
2. `src/pages/admin/AdminParceiros.tsx` - Exibir fotos no card + deletar fotos ao excluir parceiro

### Experiência do Usuário

1. Ao cadastrar, usuário pode adicionar até 3 fotos
2. Fotos são exibidas em carrossel no card público
3. Se não tiver fotos, mostra logo_url (comportamento atual)
4. Se não tiver nem fotos nem logo, não mostra área de imagem
5. Admin pode ver todas as fotos ao gerenciar

### Validações

| Validação | Valor |
|-----------|-------|
| Máximo de fotos | 3 |
| Tamanho máximo por foto | 5MB |
| Formatos aceitos | JPEG, PNG, WebP |

### Detalhes Técnicos

**Estrutura de Query com Fotos:**
```typescript
const { data } = await supabase
  .from("parceiros")
  .select(`
    *,
    parceiro_fotos (id, url, ordem)
  `)
  .eq("status", "aprovado")
  .order("destaque", { ascending: false });
```

**Componente de Carrossel no Card:**
```typescript
{parceiro.parceiro_fotos?.length > 0 ? (
  <Carousel className="w-full">
    <CarouselContent>
      {parceiro.parceiro_fotos
        .sort((a, b) => a.ordem - b.ordem)
        .map((foto) => (
          <CarouselItem key={foto.id}>
            <img src={foto.url} className="h-40 w-full object-cover" />
          </CarouselItem>
        ))}
    </CarouselContent>
    {parceiro.parceiro_fotos.length > 1 && (
      <>
        <CarouselPrevious />
        <CarouselNext />
      </>
    )}
  </Carousel>
) : parceiro.logo_url ? (
  <img src={parceiro.logo_url} className="h-32 w-full object-contain" />
) : null}
```

