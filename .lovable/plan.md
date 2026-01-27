

## Plano: Criar Conta de Administrador

### Objetivo

Criar a conta `luciananepomuceno@jardinsmangueiral.com` com a senha especificada e promovê-la automaticamente a administrador.

### Abordagem

Vou criar uma Edge Function administrativa temporária que usa a API de Admin do Supabase para criar o usuário. Após a criação, a função será removida por segurança.

### Passos da Implementação

#### 1. Criar Edge Function `create-admin-user`

Esta função usará o `SUPABASE_SERVICE_ROLE_KEY` (já configurado) para:
- Criar o usuário via Admin API
- O trigger `handle_new_user` criará automaticamente o perfil
- Adicionar a role `admin` na tabela `user_roles`

#### 2. Executar a Função

Chamar a função uma vez para criar a conta.

#### 3. Remover a Edge Function

Por segurança, deletar a função após o uso para evitar criação não autorizada de admins.

### Detalhes Técnicos

**Edge Function: `supabase/functions/create-admin-user/index.ts`**

```typescript
import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
  // Proteção básica - aceitar apenas POST
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Criar usuário
  const { data: userData, error: userError } = 
    await supabaseAdmin.auth.admin.createUser({
      email: 'luciananepomuceno@jardinsmangueiral.com',
      password: 'jardinsmangueiral123',
      email_confirm: true, // Confirma o email automaticamente
      user_metadata: {
        nome: 'Luciana Nepomuceno',
        telefone: ''
      }
    })

  if (userError) {
    return new Response(JSON.stringify({ error: userError.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Adicionar role de admin
  const { error: roleError } = await supabaseAdmin
    .from('user_roles')
    .upsert({ 
      user_id: userData.user.id, 
      role: 'admin' 
    }, { 
      onConflict: 'user_id,role' 
    })

  if (roleError) {
    return new Response(JSON.stringify({ error: roleError.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ 
    success: true, 
    message: 'Admin criado com sucesso',
    user_id: userData.user.id 
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### Fluxo de Execução

```text
1. Criar Edge Function
        |
        v
2. Fazer deploy automático
        |
        v
3. Chamar função via curl_edge_functions
        |
        v
4. Usuário criado com:
   - Email confirmado
   - Perfil criado (via trigger)
   - Role admin atribuída
        |
        v
5. Deletar Edge Function (segurança)
```

### Resultado Final

- Email: `luciananepomuceno@jardinsmangueiral.com`
- Senha: `jardinsmangueiral123`
- Função: Administrador
- Pode fazer login imediatamente e acessar o painel admin

### Consideração de Segurança

A Edge Function será deletada imediatamente após o uso para evitar que qualquer pessoa possa criar novos administradores. Todo o processo é feito de forma segura usando a chave de serviço que só o backend tem acesso.

