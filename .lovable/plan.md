

## Plano: Sistema de Cadastro de Parceiros com Aprovação

### Objetivo

Permitir que pessoas cadastrem seus serviços, lojas ou marcas locais na página de Parceiros. Os cadastros passam por aprovação do administrador antes de aparecer publicamente, seguindo o mesmo padrão de eventos e imóveis.

### Fluxo do Sistema

```text
FLUXO DO PARCEIRO:
1. Usuário (logado ou não) acessa /parceiros
2. Clica em "Cadastrar meu negócio"
3. Preenche formulário com dados do negócio
4. Se não logado, preenche nome/email/telefone
5. Envia cadastro (status: pendente)
6. Aguarda aprovação do admin

FLUXO DO ADMINISTRADOR:
1. Admin acessa /admin/parceiros
2. Vê lista de parceiros pendentes
3. Aprova ou rejeita cadastros
4. Parceiros aprovados aparecem na página pública
```

### Estrutura Visual da Página Parceiros

```text
+------------------------------------------+
|            REDE DE CONFIANÇA             |
|  Prestadores de serviços e empresas...   |
+------------------------------------------+

+------------------------------------------+
|        PARCEIROS DA COMUNIDADE           |
|  (Grid de cards com parceiros aprovados) |
|  +--------+  +--------+  +--------+      |
|  | Logo   |  | Logo   |  | Logo   |      |
|  | Nome   |  | Nome   |  | Nome   |      |
|  | Categ. |  | Categ. |  | Categ. |      |
|  | Desc.  |  | Desc.  |  | Desc.  |      |
|  | Contato|  | Contato|  | Contato|      |
|  +--------+  +--------+  +--------+      |
+------------------------------------------+

+------------------------------------------+
|        CADASTRE SEU NEGÓCIO              |
|  [Formulário ou botão para cadastrar]    |
+------------------------------------------+
```

### Mudanças Necessárias

#### 1. Criar Tabela no Banco de Dados

Nova tabela `parceiros`:

```sql
CREATE TABLE public.parceiros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  categoria text NOT NULL,
  descricao text,
  telefone text NOT NULL,
  email text,
  instagram text,
  site text,
  endereco text,
  logo_url text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text DEFAULT 'pendente',
  destaque boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.parceiros ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Anyone can view approved partners"
ON public.parceiros FOR SELECT
USING (status = 'aprovado');

CREATE POLICY "Users can view their own partners"
ON public.parceiros FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create partners"
ON public.parceiros FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all partners"
ON public.parceiros FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all partners"
ON public.parceiros FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all partners"
ON public.parceiros FOR DELETE
USING (has_role(auth.uid(), 'admin'));
```

Categorias sugeridas:
- Alimentação
- Beleza e Estética
- Saúde
- Serviços Domésticos
- Educação
- Pet
- Tecnologia
- Construção e Reforma
- Outros

#### 2. Atualizar Página de Parceiros

Modificar `src/pages/Parceiros.tsx`:
- Adicionar seção que lista parceiros aprovados
- Adicionar formulário/dialog para cadastro de novo parceiro
- Usuário logado pode cadastrar diretamente
- Usuário não logado é redirecionado para login

#### 3. Criar Página Admin de Parceiros

Criar `src/pages/admin/AdminParceiros.tsx`:
- Lista todos os parceiros (pendentes, aprovados, rejeitados)
- Botões para aprovar/rejeitar
- Opção de destacar parceiro
- Deletar parceiro

#### 4. Atualizar Dashboard Admin

Modificar `src/pages/admin/AdminDashboard.tsx`:
- Adicionar card "Gerenciar Parceiros"
- Mostrar estatísticas de parceiros pendentes

#### 5. Atualizar Rotas

Modificar `src/App.tsx`:
- Adicionar rota `/admin/parceiros` protegida para admin

### Detalhes do Formulário de Cadastro

```text
+------------------------------------------+
|        CADASTRAR MEU NEGÓCIO             |
|------------------------------------------|
| Nome do Negócio*: [____________]         |
| Categoria*:       [Dropdown___v]         |
| Descrição:        [textarea____]         |
| Telefone/WhatsApp*:[____________]        |
| Email:            [____________]         |
| Instagram:        [____________]         |
| Site:             [____________]         |
| Endereço:         [____________]         |
| Logo:             [Upload_____]          |
|                                          |
| [Enviar para Aprovação]                  |
+------------------------------------------+
```

### Componente de Card do Parceiro

```typescript
const ParceiroCard = ({ parceiro }) => (
  <Card>
    {parceiro.logo_url && (
      <img src={parceiro.logo_url} className="h-32 w-full object-contain" />
    )}
    <CardHeader>
      <Badge>{parceiro.categoria}</Badge>
      <CardTitle>{parceiro.nome}</CardTitle>
      {parceiro.descricao && (
        <CardDescription>{parceiro.descricao}</CardDescription>
      )}
    </CardHeader>
    <CardContent>
      <div className="flex gap-2">
        <Button variant="whatsapp">
          <a href={`https://wa.me/${parceiro.telefone}`}>WhatsApp</a>
        </Button>
        {parceiro.instagram && (
          <Button variant="outline">Instagram</Button>
        )}
      </div>
    </CardContent>
  </Card>
);
```

### Arquivos a Criar

1. `src/pages/admin/AdminParceiros.tsx` - Gerenciamento de parceiros

### Arquivos a Modificar

1. `src/pages/Parceiros.tsx` - Adicionar listagem e formulário
2. `src/pages/admin/AdminDashboard.tsx` - Adicionar link para parceiros
3. `src/App.tsx` - Adicionar rota admin

### Migração SQL

```sql
-- Criar tabela parceiros
CREATE TABLE public.parceiros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  categoria text NOT NULL,
  descricao text,
  telefone text NOT NULL,
  email text,
  instagram text,
  site text,
  endereco text,
  logo_url text,
  user_id uuid,
  status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  destaque boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.parceiros ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can view approved partners"
ON public.parceiros FOR SELECT TO public
USING (status = 'aprovado');

CREATE POLICY "Users can view their own partners"
ON public.parceiros FOR SELECT TO public
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create partners"
ON public.parceiros FOR INSERT TO public
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all partners"
ON public.parceiros FOR SELECT TO public
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all partners"
ON public.parceiros FOR UPDATE TO public
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all partners"
ON public.parceiros FOR DELETE TO public
USING (has_role(auth.uid(), 'admin'));

-- Trigger para updated_at
CREATE TRIGGER update_parceiros_updated_at
  BEFORE UPDATE ON public.parceiros
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Experiência do Usuário

1. Visitante vê parceiros aprovados na página
2. Para cadastrar, precisa estar logado
3. Preenche formulário simples
4. Recebe confirmação de que foi enviado para aprovação
5. Admin aprova e parceiro aparece publicamente
6. Parceiros destacados aparecem primeiro

### Considerações de Segurança

- RLS garante que apenas admins podem aprovar/rejeitar
- Usuários só podem criar parceiros com seu próprio user_id
- Upload de logo usa o storage bucket existente (ou novo bucket)
- Validação de campos obrigatórios no frontend e backend

