

# Submenu "Inicio" com Quadras 1-15

## Visao Geral

Transformar o item "Inicio" do menu em um submenu com dropdown contendo "Voltar a pagina inicial" + links para 15 quadras. Cada quadra tera sua propria pagina com informacoes do condominio (nome, telefone, email, taxa) e um carrossel de ate 10 fotos gerenciaveis pelo admin.

---

## 1. Banco de Dados

### Tabela `quadras`
Armazena as informacoes fixas de cada quadra.

```text
quadras
- id: uuid (PK)
- numero: integer (1-15)
- nome: text (ex: "Jardins dos Jacarandas")
- telefone: text
- email: text
- taxa_condominio: numeric
- created_at: timestamptz
```

### Tabela `quadra_fotos`
Fotos de cada quadra, max 10, gerenciaveis pelo admin.

```text
quadra_fotos
- id: uuid (PK)
- quadra_id: uuid (FK -> quadras)
- url: text
- ordem: integer
- created_at: timestamptz
```

### RLS
- `quadras`: leitura publica para todos, CRUD para admins
- `quadra_fotos`: leitura publica para todos, CRUD para admins

### Storage Bucket
- Criar bucket `quadras` (publico) para armazenar as fotos

### Seed
- Inserir as 15 quadras com os dados fornecidos (nome, telefone, email, taxa)

---

## 2. Header - Submenu no "Inicio"

**Arquivo:** `src/components/Header.tsx`

### Desktop
- Substituir o link simples "Inicio" por um dropdown usando `DropdownMenu` (Radix UI, ja instalado)
- Ao passar o mouse / clicar, mostra submenu com:
  - "Voltar a pagina inicial" -> `/`
  - Separador
  - "Quadra 01" -> `/quadra/1`
  - "Quadra 02" -> `/quadra/2`
  - ... ate Quadra 15

### Mobile
- No menu lateral (Sheet), o item "Inicio" vira um `Collapsible` que expande para mostrar as mesmas opcoes
- Usar o componente `Collapsible` ja disponivel no projeto

---

## 3. Pagina da Quadra

**Novo arquivo:** `src/pages/QuadraDetalhe.tsx`

- Rota: `/quadra/:numero`
- Busca dados da quadra pelo numero no banco
- Exibe:
  - Nome do condominio (ex: "Quadra 01 - Jardins dos Jacarandas")
  - Telefone(s)
  - Email
  - Taxa de condominio formatada em R$
  - Carrossel de fotos (usando o componente Carousel ja existente)
- Layout com Header e Footer padrao

---

## 4. Painel Admin - Gerenciar Fotos das Quadras

**Novo arquivo:** `src/pages/admin/AdminQuadras.tsx`

- Lista as 15 quadras
- Para cada quadra, botao para gerenciar fotos
- Dialog/modal para upload e remocao de fotos (max 10 por quadra)
- Upload para o bucket `quadras` no storage
- Reordenacao das fotos (drag-and-drop, seguindo padrao do ImovelForm)

**Arquivo:** `src/pages/admin/AdminDashboard.tsx`
- Adicionar card "Gerenciar Quadras" com link para `/admin/quadras`

---

## 5. Rotas

**Arquivo:** `src/App.tsx`

Novas rotas:
- `/quadra/:numero` -> `QuadraDetalhe` (publica)
- `/admin/quadras` -> `AdminQuadras` (protegida, admin)

---

## Resumo dos arquivos

| Arquivo | Acao |
|---|---|
| Migration SQL | Criar tabelas `quadras`, `quadra_fotos`, bucket, seed 15 quadras |
| `src/components/Header.tsx` | Submenu dropdown no "Inicio" (desktop + mobile) |
| `src/pages/QuadraDetalhe.tsx` | Nova pagina publica da quadra |
| `src/pages/admin/AdminQuadras.tsx` | Nova pagina admin para fotos |
| `src/pages/admin/AdminDashboard.tsx` | Card "Gerenciar Quadras" |
| `src/App.tsx` | 2 novas rotas |

