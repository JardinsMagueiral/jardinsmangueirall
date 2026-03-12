

# Plano: Substituir favicon do Lovable pela logo da árvore

## Problema
O `public/favicon.png` é o ícone padrão do Lovable (coração). No Google, aparece esse coração em vez da sua árvore.

## Solução
Copiar `src/assets/logo.png` para `public/favicon.png`, substituindo o ícone do Lovable pela sua logo da árvore.

Isso vai atualizar:
- A aba do navegador (favicon)
- O ícone que aparece no Google
- As imagens de compartilhamento social (og:image e twitter:image já apontam para `/favicon.png`)

**Nota:** O Google pode levar alguns dias para atualizar o ícone nos resultados de busca após a publicação.

