

## Plano: Sistema de Eventos com Aprovação

### Resumo

Vou transformar o calendário de eventos atual (que usa dados em memória) em um sistema completo onde:
- Qualquer pessoa pode sugerir um evento
- Administradores aprovam/rejeitam eventos
- Apenas eventos aprovados aparecem para todos

### O Que Será Criado

#### 1. Nova Tabela no Banco de Dados: `eventos`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Identificador único |
| data | date | Data do evento |
| titulo | text | Nome do evento |
| descricao | text | Detalhes do evento |
| status | text | pendente, aprovado, rejeitado |
| user_id | uuid | Quem criou (opcional para visitantes) |
| created_at | timestamp | Data de criação |

#### 2. Políticas de Segurança (RLS)

- **Visualização pública**: Qualquer pessoa vê eventos aprovados
- **Criação**: Qualquer pessoa autenticada pode criar (status = pendente)
- **Gerenciamento**: Apenas admins podem aprovar/rejeitar/excluir

#### 3. Página Pública de Eventos (Atualizada)

- Calendário mostra apenas eventos **aprovados**
- Botão "Sugerir Evento" para usuários logados
- Formulário simples para criar sugestão

#### 4. Nova Página Admin: Gerenciar Eventos

- Lista todos os eventos (pendentes, aprovados, rejeitados)
- Botões para aprovar/rejeitar
- Filtro por status

### Arquivos a Serem Modificados/Criados

**Banco de Dados:**
- Nova tabela `eventos` com RLS configurado

**Novos Arquivos:**
- `src/pages/admin/AdminEventos.tsx` - Painel de gerenciamento

**Arquivos Modificados:**
- `src/components/EventsCalendar.tsx` - Integrar com banco de dados
- `src/pages/admin/AdminDashboard.tsx` - Adicionar link para eventos
- `src/App.tsx` - Nova rota `/admin/eventos`
- `src/integrations/supabase/types.ts` - Tipos atualizados automaticamente

### Detalhes Técnicos

**SQL para criar a tabela:**

```text
-- Tabela de eventos
CREATE TABLE public.eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data date NOT NULL,
  titulo text NOT NULL,
  descricao text,
  status text DEFAULT 'pendente',
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Anyone can view approved events"
  ON public.eventos FOR SELECT
  USING (status = 'aprovado');

CREATE POLICY "Authenticated users can create events"
  ON public.eventos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pendente');

CREATE POLICY "Admins can view all events"
  ON public.eventos FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update events"
  ON public.eventos FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete events"
  ON public.eventos FOR DELETE
  USING (has_role(auth.uid(), 'admin'));
```

**Fluxo do Usuário:**

```text
Visitante
    |
    v
Ve calendario com eventos aprovados
    |
    v
Clica em "Sugerir Evento"
    |
    v
[Nao logado?] --> Redireciona para Login
    |
    v
Preenche formulario (titulo, data, descricao)
    |
    v
Evento criado com status "pendente"
    |
    v
Mensagem: "Evento enviado para aprovacao!"
```

**Fluxo do Admin:**

```text
Admin Dashboard
    |
    v
Clica em "Gerenciar Eventos"
    |
    v
Ve lista de eventos (filtro por status)
    |
    v
[Aprovar] --> status = 'aprovado' --> Aparece no calendario
[Rejeitar] --> status = 'rejeitado' --> Nao aparece
[Excluir] --> Remove do banco
```

### Interface do Painel Admin

O painel de eventos terá o mesmo visual do painel de imóveis:
- Cards com informações do evento
- Badge colorido para status
- Botões de ação (Aprovar, Rejeitar, Excluir)
- Filtro por status no topo

### Resultado Esperado

- Qualquer usuário logado pode sugerir eventos
- Admins têm controle total sobre o que aparece no calendário
- Calendário público mostra apenas eventos aprovados
- Sistema seguro com RLS protegendo os dados

