

# Plano: Otimização SEO para "Jardins Mangueiral"

## O que falta no projeto hoje

1. **Sem sitemap.xml** — Google precisa disso para indexar todas as páginas
2. **robots.txt sem referência ao sitemap**
3. **Sem canonical URL** nas meta tags
4. **Sem structured data (JSON-LD)** — dados estruturados que aparecem no Google como rich snippets
5. **Meta tags incompletas** — faltam `og:url`, `og:locale`, `keywords`
6. **Sem meta tags específicas por página** em algumas rotas

## O que vou fazer

### 1. Criar `public/sitemap.xml`
Sitemap estático com todas as rotas públicas do site (`/`, `/quem-somos`, `/imoveis`, `/noticias`, `/parceiros`, `/grupos`, `/eventos`, `/calculadoras`, `/contato`, `/classificados`, `/quadra/1` a `/quadra/15`), usando `https://jardinsmangueiral.com` como base.

### 2. Atualizar `public/robots.txt`
Adicionar referência ao sitemap: `Sitemap: https://jardinsmangueiral.com/sitemap.xml`

### 3. Melhorar `index.html`
- Adicionar `canonical` link
- Adicionar `og:url`, `og:locale`
- Adicionar `keywords` meta tag com termos relevantes (Jardins Mangueiral, imóveis, comunidade, Brasília, etc.)
- Adicionar **JSON-LD structured data** (WebSite + Organization) para o Google entender melhor o site

### 4. Melhorar meta tags da página inicial (`Index.tsx`)
- Adicionar `canonical`, `keywords` e JSON-LD via Helmet

## O que NÃO muda
- Nenhuma alteração visual/design
- Apenas infraestrutura de SEO

## Nota importante
SEO no Google depende de vários fatores externos (backlinks, idade do domínio, conteúdo, etc.). Essas mudanças maximizam o que podemos controlar no código. Resultados podem levar semanas para aparecer.

