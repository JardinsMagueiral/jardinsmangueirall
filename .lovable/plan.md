

# Melhorias no Submenu "Inicio" e Espacamento do Menu

## 1. Quadras em grid horizontal no dropdown

Substituir a lista vertical de quadras por um grid horizontal (3 colunas x 5 linhas) com fundo verde claro (`bg-primary/5`), tornando o dropdown mais compacto e visual.

- O dropdown fica mais largo (`w-[420px]`) para acomodar o grid
- Cada quadra aparece como um "chip" compacto com o numero em destaque
- Fundo da secao de quadras com `bg-primary/5` e bordas arredondadas

## 2. Melhorar espacamento da barra de menu

O menu desktop tem 10 itens + botoes, tudo com `gap-1` e `px-3` - fica apertado.

Ajustes:
- Reduzir o `px` dos links do menu para `px-2` e usar `text-xs` em vez de `text-sm` para caber melhor
- Usar `gap-0.5` na nav para reduzir espaco entre itens
- Alternativamente, abreviar labels longos como "Parceiros e Indicacoes" para "Parceiros" no menu desktop (mantendo o texto completo na pagina)
- Mudar breakpoint de `lg:flex` para `xl:flex` se necessario

## Arquivos modificados

| Arquivo | Alteracao |
|---|---|
| `src/components/Header.tsx` | Grid horizontal para quadras no dropdown, fundo verde claro, ajuste de espacamento dos itens do menu |

## Detalhes tecnicos

### Dropdown - Grid de Quadras
```text
Layout atual: lista vertical com 15 itens (scroll longo)
Layout novo: grid 3x5 com fundo verde claro, mais compacto
```

### Espacamento do menu
- Links: `px-2 py-1.5 text-xs` (mais compactos)
- Nav container: `gap-0.5`
- Labels abreviados no desktop onde necessario (ex: "Grupos WhatsApp" -> "Grupos")
