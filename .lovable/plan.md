

# Scroll por arrasto (drag-to-scroll) no dropdown de Quadras

## Objetivo
Permitir que o usuario clique e arraste com o mouse para rolar horizontalmente a lista de quadras no dropdown desktop.

## Abordagem
Adicionar um hook/ref customizado no container horizontal das quadras que implementa "drag to scroll" nativo com eventos de mouse (`mousedown`, `mousemove`, `mouseup`, `mouseleave`).

## Alteracoes

**Arquivo:** `src/components/Header.tsx`

1. Adicionar um `useRef` para o container das quadras e um `useCallback`/handler para os eventos de mouse
2. No `div` que contem as quadras (linha 88), adicionar:
   - `ref={scrollRef}`
   - `onMouseDown`, `onMouseMove`, `onMouseUp`, `onMouseLeave` handlers
   - `cursor-grab active:cursor-grabbing` nas classes CSS
   - `select-none` para evitar selecao de texto durante o arrasto

3. A logica de drag-to-scroll:
   - No `mousedown`: registra posicao inicial e scrollLeft
   - No `mousemove`: calcula o delta e atualiza o `scrollLeft` do container
   - No `mouseup`/`mouseleave`: encerra o arrasto

Nenhuma dependencia externa necessaria - tudo feito com eventos nativos do DOM.
