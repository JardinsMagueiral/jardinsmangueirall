

# Plano de Migração: Lovable Cloud → Supabase Próprio

## Contexto

O projeto usa Lovable Cloud (que internamente é Supabase) com: banco de dados (14 tabelas), autenticação, 5 buckets de storage e variáveis de ambiente. Não há edge functions no código. O cliente Supabase já usa `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` — variáveis padrão que funcionam com qualquer projeto Supabase.

## Passo 1 — Conectar ao seu Supabase

Você precisa primeiro desconectar o Lovable Cloud e conectar seu projeto Supabase externo:

1. Vá em **Settings → Connectors → Supabase** e conecte seu projeto externo
2. O Lovable vai gerar automaticamente as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` no `.env`

> **Nota importante:** Lovable Cloud não pode ser desconectado depois de ativado. Porém, ao conectar um projeto Supabase externo, o código passará a apontar para o novo projeto. Será necessário recriar toda a infraestrutura no Supabase externo.

## Passo 2 — Recriar o Schema no Supabase Externo

No **SQL Editor** do seu Supabase dashboard, execute as 17 migrations existentes em `supabase/migrations/` na ordem cronológica. Elas contêm:

- **Tabelas (14):** profiles, user_roles, imoveis, imovel_fotos, classificados, classificado_fotos, parceiros, parceiro_fotos, quadras, quadra_fotos, eventos, noticias, whatsapp_grupos, audit_log
- **Enum:** `app_role` (admin, user)
- **Funções:** `has_role()`, `handle_new_user()`, `update_updated_at_column()`
- **Trigger:** `on_auth_user_created` (cria profile + role automaticamente)
- **Políticas RLS:** todas as políticas de cada tabela
- **Storage:** configuração de buckets com limites de tamanho e tipos MIME

Alternativa: use `supabase db push` via CLI apontando para seu projeto externo.

## Passo 3 — Recriar Storage Buckets

No dashboard Supabase, crie 5 buckets **públicos**:

| Bucket | Público | Limite | Tipos permitidos |
|---|---|---|---|
| `imoveis` | Sim | 5MB | jpeg, png, webp |
| `parceiros` | Sim | 5MB | jpeg, png, webp |
| `classificados` | Sim | 5MB | jpeg, png, webp |
| `quadras` | Sim | 5MB | jpeg, png, webp |
| `noticias` | Sim | 5MB | jpeg, png, webp |

Configure as **Storage Policies** para permitir upload por usuários autenticados e leitura pública.

## Passo 4 — Configurar Autenticação

No dashboard Supabase → Authentication → Settings:
- Habilitar **Email** como provider
- Configurar **Site URL** para seu domínio (ex: `https://jardinsmangueiral.com`)
- Adicionar **Redirect URLs** permitidas
- Se usa Google OAuth, configurar o provider com suas credenciais

## Passo 5 — Código (mudanças mínimas)

O código **não precisa de alterações** se o conector Supabase do Lovable gerar as mesmas variáveis (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`). O client.ts já usa essas variáveis. Todos os imports usam `@/integrations/supabase/client` corretamente.

**Não há edge functions** no projeto — nenhum arquivo em `supabase/functions/` é referenciado pelo código.

## Passo 6 — O que migrar manualmente

| Item | Ação |
|---|---|
| Dados existentes (profiles, imoveis, etc.) | Exportar do Cloud e importar no novo Supabase |
| Arquivos nos buckets de storage | Download manual e re-upload |
| Trigger `on_auth_user_created` | Verificar que aponta para `auth.users` no novo projeto |
| Usuários registrados | Exportar via Supabase Auth Admin API e importar |
| Role de admin | Inserir manualmente na tabela `user_roles` |
| Domínio customizado | Reconfigurar DNS se o storage URL mudar |
| URLs de imagens existentes | Atualizar referências no banco se o domínio Supabase mudar |

## Passo 7 — Checklist Final de Testes

```text
[ ] Login com email/senha existente
[ ] Cadastro de novo usuário (profile + role criados automaticamente)
[ ] Redefinição de senha (email recebido + nova senha funciona)
[ ] Upload de foto em imóvel (bucket imoveis)
[ ] Upload de foto em classificado (bucket classificados)
[ ] Upload de foto em parceiro (bucket parceiros)
[ ] Upload de foto em quadra (bucket quadras, admin)
[ ] Upload de foto em notícia (bucket noticias)
[ ] Listagem pública de imóveis aprovados
[ ] Listagem pública de classificados aprovados
[ ] Listagem pública de parceiros aprovados
[ ] Visualização de eventos aprovados
[ ] Visualização de notícias aprovadas
[ ] Visualização de grupos WhatsApp ativos
[ ] Painel admin: aprovar/rejeitar imóvel
[ ] Painel admin: aprovar/rejeitar classificado
[ ] Painel admin: gerenciar quadras e fotos
[ ] Painel admin: gerenciar grupos WhatsApp
[ ] Painel admin: ver lista de clientes
[ ] Rota protegida: /minha-conta acessível só logado
[ ] Rota protegida: /admin/* acessível só para admin
[ ] Rota protegida: redireciona para login se não autenticado
```

---

**Próximo passo:** Conecte seu projeto Supabase externo via Settings → Connectors → Supabase. Depois disso, posso ajudar a gerar o SQL consolidado de todas as migrations para executar no seu novo projeto.

