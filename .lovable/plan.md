
## Plano: Melhorias de Segurança

### Resumo dos Problemas Encontrados

| Prioridade | Problema | Risco |
|------------|----------|-------|
| Alta | Upload de fotos sem validação | Arquivos maliciosos podem ser enviados |
| Alta | Exposição do user_id em imóveis públicos | Permite rastrear proprietários |
| Média | Console.log em produção | Expõe detalhes internos |
| Média | Proteção de senha vazada desabilitada | Senhas comprometidas podem ser usadas |
| Baixa | Bucket de storage público | Todas as fotos são acessíveis |

### Correções Propostas

#### 1. Validação de Upload de Fotos (ImovelForm.tsx)

Adicionar validação no cliente para:
- Tamanho máximo de 5MB por arquivo
- Tipo de arquivo (apenas imagens JPEG, PNG, WebP)
- Verificação do MIME type

```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  
  // Validar cada arquivo
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Arquivo muito grande",
        description: `${file.name} excede o limite de 5MB`,
        variant: "destructive",
      });
      return;
    }
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        title: "Tipo de arquivo inválido",
        description: `${file.name} não é uma imagem válida (use JPEG, PNG ou WebP)`,
        variant: "destructive",
      });
      return;
    }
  }
  
  // ... resto da lógica
};
```

#### 2. Criar View Pública para Imóveis (Banco de Dados)

Criar uma view que exclui o `user_id` para consultas públicas:

```sql
-- View pública para imóveis aprovados (sem user_id)
CREATE VIEW public.imoveis_publicos
WITH (security_invoker=on) AS
  SELECT 
    id, tipo, operacao, endereco, numero, complemento, 
    bairro, cep, quartos, banheiros, vagas, area_m2,
    preco, condominio, iptu, descricao, mobiliado, 
    aceita_pets, destaque, created_at
  FROM public.imoveis
  WHERE status = 'aprovado';

-- Política para a view
CREATE POLICY "Anyone can view public properties"
  ON public.imoveis_publicos FOR SELECT
  USING (true);
```

**Nota**: Após análise, esta abordagem é complexa porque views com RLS requerem configurações adicionais. Uma alternativa mais simples é simplesmente não incluir `user_id` nas consultas do frontend para páginas públicas (que já foi feito em `ImovelDetalhe.tsx`).

#### 3. Remover Console.log de Produção

Modificar os seguintes arquivos para usar logging condicional:

**AdminImoveis.tsx** - Remover todos os console.log/console.error:
- Linha 50, 56, 60, 68, 76, 83, 90, 104

**MinhaConta.tsx** - Remover console.error:
- Linha 60

**ImovelDetalhe.tsx** - Remover console.error:
- Linha 68, 85

**AuthContext.tsx** - Remover console.error:
- Linha 44

#### 4. Habilitar Proteção de Senha Vazada

Usar a ferramenta de configuração de autenticação para habilitar a proteção contra senhas vazadas.

### Detalhes Técnicos

**Arquivos a serem modificados:**

1. `src/components/imoveis/ImovelForm.tsx`
   - Adicionar constantes de validação
   - Modificar função `handlePhotoChange` para validar arquivos
   - Adicionar validação no upload antes de enviar

2. `src/pages/admin/AdminImoveis.tsx`
   - Remover linhas de console.log (50, 56, 60, 68, 76, 83, 90)
   - Remover linhas de console.error (71, 104)

3. `src/pages/cliente/MinhaConta.tsx`
   - Remover linha de console.error (60)

4. `src/pages/ImovelDetalhe.tsx`
   - Remover linhas de console.error (68, 85)

5. `src/contexts/AuthContext.tsx`
   - Remover linha de console.error (44)

### Itens Já Corrigidos

- A página `ImovelDetalhe.tsx` já não faz JOIN com profiles
- O contato é feito através de um número fixo de WhatsApp
- RLS está configurado corretamente nas tabelas principais

### O Que NÃO Será Alterado

- **Bucket público de storage**: Manter público é aceitável para um site imobiliário onde as fotos de imóveis aprovados devem ser visíveis
- **Verificação de admin no cliente**: O RLS no banco de dados já protege os dados; a verificação no cliente é apenas UX

### Resultado Esperado

- Upload de fotos será validado (tipo e tamanho)
- Logs de debug serão removidos da produção
- Proteção contra senhas vazadas será habilitada
- A aplicação seguirá melhores práticas de segurança
