

# Ajustes no Submenu "Inicio" e Tamanho dos Itens do Menu

## Problemas identificados

1. O dropdown das quadras esta em grid 3x5 - o usuario quer 1 coluna com 16 itens (pagina inicial + 15 quadras) com fundo verde transparente
2. No menu mobile (Collapsible), o submenu das quadras nao tem fundo verde - o usuario quer fundo com a cor verde do site
3. Os itens do menu desktop ficaram pequenos demais (text-xs, gap-0.5) apos a ultima alteracao

## Alteracoes

**Arquivo:** `src/components/Header.tsx`

### 1. Dropdown desktop - Grid 1x16 com fundo verde transparente
- Trocar `grid-cols-3` por lista em coluna unica (1 coluna)
- Reduzir a largura do dropdown de `w-[420px]` para `w-64`
- Manter o fundo `bg-primary/10` (verde transparente) na secao das quadras
- Incluir "Pagina Inicial" junto com as 15 quadras na mesma lista
- Adicionar `max-h-[70vh] overflow-y-auto` para scroll caso nao caiba na tela

### 2. Menu mobile - Fundo verde no submenu
- Adicionar `bg-primary/10 rounded-lg p-2` no `CollapsibleContent` das quadras
- Cada link de quadra tera hover com `hover:bg-primary/20` para manter a coerencia visual

### 3. Itens do menu desktop - Aumentar tamanho
- Voltar o tamanho da fonte para `text-sm` (em vez de `text-xs`)
- Aumentar o gap da nav para `gap-1` (em vez de `gap-0.5`)
- Aumentar o padding dos links para `px-3 py-2` (em vez de `px-2 py-1.5`)
- Manter os shortLabels para labels longos nao quebrarem

