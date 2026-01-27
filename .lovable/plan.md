
## Plano: Atualizar Favicon e Meta Tags

### O que será feito

Vou usar a logo que você enviou como favicon (ícone na aba do navegador) e também atualizar o título e descrições do site.

### Mudanças

**1. Copiar a imagem para a pasta pública**
- Copiar `user-uploads://ChatGPT_Image_21_de_jan._de_2026_12_03_48.png` para `public/favicon.png`

**2. Atualizar o arquivo `index.html`**

| Item | Antes | Depois |
|------|-------|--------|
| Favicon | Nenhum definido | Sua logo |
| Título | "Lovable App" | "Jardins Mangueiral" |
| Descrição | "Lovable Generated Project" | "Conectando vizinhos e fortalecendo comunidades no Jardins Mangueiral" |
| OG Title | "Lovable App" | "Jardins Mangueiral" |
| OG Description | "Lovable Generated Project" | "Conectando vizinhos e fortalecendo comunidades no Jardins Mangueiral" |
| Idioma | "en" | "pt-BR" |

### Código Final do index.html

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="/favicon.png" type="image/png" />
    <title>Jardins Mangueiral</title>
    <meta name="description" content="Conectando vizinhos e fortalecendo comunidades no Jardins Mangueiral. Encontre imóveis, eventos e serviços locais." />
    <meta name="author" content="Jardins Mangueiral" />

    <meta property="og:title" content="Jardins Mangueiral" />
    <meta property="og:description" content="Conectando vizinhos e fortalecendo comunidades no Jardins Mangueiral" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="/favicon.png" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@JardinsMangueiral" />
    <meta name="twitter:image" content="/favicon.png" />
  </head>

  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Resultado

- A aba do navegador mostrará sua logo da árvore
- O título "Jardins Mangueiral" aparecerá na aba
- Links compartilhados em redes sociais mostrarão informações corretas
