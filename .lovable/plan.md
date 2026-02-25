

# Plano de Melhorias - 5 Ajustes

## 1. CTA "Anuncie nos Classificados" - Redirecionar para criacao de anuncio

**Arquivo:** `src/components/CTASection.tsx`

- Alterar o item "Anuncie nos Classificados" para apontar para `/classificados/novo` (rota interna) em vez do link do WhatsApp.
- Mudar `isExternal: true` para `isExternal: false`.

---

## 2. Painel Admin para gerenciar Grupos WhatsApp

Criar uma tabela no banco de dados para armazenar os grupos, e um painel admin para adicionar/remover grupos. Os componentes `WhatsAppGroups`, `Footer` e a pagina `Grupos` passam a buscar os grupos do banco.

### Banco de dados
- Criar tabela `whatsapp_grupos` com colunas: `id`, `titulo`, `descricao`, `link`, `ordem`, `ativo`, `created_at`.
- RLS: leitura publica para grupos ativos, CRUD completo para admins.

### Nova pagina admin
- **Arquivo:** `src/pages/admin/AdminGrupos.tsx`
- Listar todos os grupos com opcoes de adicionar, editar e excluir.
- Formulario simples com titulo, descricao e link.

### Rota e navegacao
- Registrar `/admin/grupos` em `App.tsx`.
- Adicionar card "Gerenciar Grupos WhatsApp" no `AdminDashboard.tsx`.

### Componentes atualizados
- **`WhatsAppGroups.tsx`**: Buscar grupos da tabela `whatsapp_grupos` em vez de array hardcoded.
- **`Footer.tsx`**: Buscar grupos da tabela `whatsapp_grupos` em vez de links hardcoded.
- **`Grupos.tsx`**: Ja usa `WhatsAppGroups`, entao sera atualizado automaticamente.

### Seed dos grupos atuais
- Inserir os 5 grupos existentes (Geral, Geral 2, Carona, Imoveis, Desapego) na tabela via migration.

---

## 3. Rodape - Adicionar grupo "Geral 2"

Sera resolvido automaticamente pelo item 2, pois o Footer passara a buscar todos os grupos do banco (incluindo Geral 2).

---

## 4. Renomear "Parceiros" para "Parceiros e Indicacoes"

**Arquivos afetados:**
- `src/components/Header.tsx`: Alterar label do menu de "Parceiros" para "Parceiros e Indicacoes".
- `src/components/Footer.tsx`: Atualizar texto no rodape se houver referencia.
- `src/pages/Parceiros.tsx`: Atualizar titulo e textos da pagina.

---

## 5. Menu mobile com scroll

**Arquivo:** `src/components/Header.tsx`

- Adicionar `ScrollArea` do Radix UI ao conteudo do `SheetContent` do menu mobile, permitindo rolar quando ha muitos itens de menu.
- Aplicar altura maxima com overflow para garantir que todas as opcoes fiquem acessiveis.

---

## Resumo dos arquivos modificados

| Arquivo | Alteracao |
|---|---|
| `src/components/CTASection.tsx` | Link classificados interno |
| `src/components/WhatsAppGroups.tsx` | Buscar grupos do banco |
| `src/components/Footer.tsx` | Buscar grupos do banco + rename parceiros |
| `src/components/Header.tsx` | Rename parceiros + scroll mobile |
| `src/pages/admin/AdminGrupos.tsx` | Nova pagina (CRUD grupos) |
| `src/pages/admin/AdminDashboard.tsx` | Card para gerenciar grupos |
| `src/pages/Parceiros.tsx` | Atualizar titulo |
| `src/App.tsx` | Rota `/admin/grupos` |
| Migration SQL | Tabela `whatsapp_grupos` + seed |

