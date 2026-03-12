

# Plano de Implementacao

Este plano cobre 5 mudancas principais solicitadas:

## 1. Substituir "Comunidade" por "Noticias" com sistema de submissao e aprovacao

**Banco de dados:** Criar tabela `noticias` com colunas: id, user_id, titulo, descricao, link (opcional), status (pendente/aprovado/rejeitado), created_at. Adicionar RLS para usuarios criarem suas proprias noticias e admins gerenciarem todas.

**Pagina `/noticias` (substituindo `/comunidade`):**
- Formulario no topo para usuarios logados enviarem noticias (titulo, descricao, link opcional). Status inicial: pendente.
- Abaixo, lista de noticias aprovadas da comunidade.
- Abaixo, secao "Noticias da Regiao" com 8 noticias recentes sobre o Jardins Mangueiral (hardcoded com dados do Google):
  1. Ibaneis inaugura escola no Jardins Mangueiral (Metropoles)
  2. Jardim Mangueiral ganha nova escola publica com capacidade para 1.000 alunos (R7)
  3. GDF inaugura escola nos Jardins Mangueiral com capacidade para 700 alunos por turno (R7)
  4. Jardins Mangueiral, um bairro em transformacao (Instagram - aderivaldo_cardoso)
  5. Novidades para o Jardim Botanico e Jardins Mangueiral (Facebook - Sao Sebastiao Noticias)
  6. CEF 01 do Jardins Mangueiral inaugurado (Instagram - cre_sao_sebastiao)
  7. Nova escola do loteamento Breno Garcia (Instagram - sop_rs)
  8. Gangue de pichacao volta a agir no Mangueiral (Facebook - Jornal Mangueiral)
- No final, link para o grupo de WhatsApp geral.

**Admin:** Criar pagina `/admin/noticias` para aprovar/rejeitar noticias. Adicionar link no AdminDashboard.

**Rotas:** Trocar `/comunidade` por `/noticias` no App.tsx.

## 2. Renomear "Trocas e Vendas" para "Desapegos"

- Header.tsx: trocar label e shortLabel de "Trocas e Vendas" para "Desapegos"
- Classificados.tsx: trocar titulo de "Trocas e Vendas" para "Desapegos", textos descritivos
- Helmet title atualizado

## 3. Filtro de ordenacao por preco (menor para maior) nos Imoveis e Desapegos

- **Imoveis.tsx:** Adicionar um Select de ordenacao (Mais recentes, Menor preco, Maior preco). Aplicar sort no array filtrado.
- **Classificados.tsx:** Mesmo Select de ordenacao por preco. Aplicar sort no array filtrado.

## 4. Admin pode editar todos os dados das Quadras

- **AdminQuadras.tsx:** Adicionar formulario de edicao (nome, numero, telefone, email, taxa_condominio) em um dialog ou inline, alem do gerenciamento de fotos existente. Botao "Editar Dados" em cada card de quadra.

## Detalhes Tecnicos

### Migracao SQL
```sql
CREATE TABLE public.noticias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  titulo text NOT NULL,
  descricao text,
  link text,
  status text DEFAULT 'pendente',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.noticias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved noticias" ON public.noticias
  FOR SELECT USING (status = 'aprovado');

CREATE POLICY "Users can view their own noticias" ON public.noticias
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create noticias" ON public.noticias
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all noticias" ON public.noticias
  FOR ALL USING (has_role(auth.uid(), 'admin'));
```

### Arquivos a criar
- `src/pages/Noticias.tsx` - pagina publica com formulario + listagem + noticias externas + link WhatsApp
- `src/pages/admin/AdminNoticias.tsx` - painel de aprovacao

### Arquivos a modificar
- `src/App.tsx` - trocar rota /comunidade por /noticias, adicionar /admin/noticias
- `src/components/Header.tsx` - trocar "Comunidade" por "Noticias" (href e label), trocar "Trocas e Vendas" por "Desapegos"
- `src/pages/Classificados.tsx` - renomear para "Desapegos", adicionar filtro de ordenacao por preco
- `src/pages/Imoveis.tsx` - adicionar filtro de ordenacao por preco
- `src/pages/admin/AdminQuadras.tsx` - adicionar dialog/formulario para editar dados da quadra (nome, numero, telefone, email, taxa)
- `src/pages/admin/AdminDashboard.tsx` - adicionar link para admin noticias
- Deletar `src/pages/Comunidade.tsx`

