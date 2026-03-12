

## Plano: Usar a árvore do favicon como imagem de compartilhamento social

O favicon atual (`/favicon.png`) já é referenciado nas meta tags Open Graph e Twitter no `index.html`. Porém, para garantir que apareça corretamente no Google e redes sociais, a imagem precisa de URL absoluta (não relativa).

### Mudança

**Arquivo: `index.html`** — Alterar as meta tags `og:image` e `twitter:image` de `/favicon.png` para a URL absoluta `https://jardinsmangueiral.com/favicon.png`.

Isso é tudo que precisa mudar. Nenhuma alteração visual no front-end.

