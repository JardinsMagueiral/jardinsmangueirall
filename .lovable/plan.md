

## Plano: Termo de Autorização antes do WhatsApp

### Objetivo

Adicionar uma etapa de aceite de termos legais antes do redirecionamento para o WhatsApp após o cadastro do imóvel. O usuário só poderá prosseguir para o WhatsApp após aceitar o termo.

### Fluxo Atual

```text
1. Usuário preenche formulário
2. Clica em "Cadastrar Imóvel"
3. Imóvel é salvo no banco
4. Dialog de sucesso aparece
5. Usuário clica em "Ir para o WhatsApp"
6. Redirecionado para WhatsApp
```

### Novo Fluxo

```text
1. Usuário preenche formulário
2. Clica em "Cadastrar Imóvel"
3. Imóvel é salvo no banco
4. Dialog de sucesso aparece COM termos
5. Usuário lê os termos
6. Marca checkbox "Li e aceito os termos"
7. Botão "Ir para o WhatsApp" fica habilitado
8. Usuário clica no botão
9. Redirecionado para WhatsApp
```

### Estrutura Visual do Dialog

```text
+------------------------------------------+
|              [✓ Checkmark Icon]          |
|                                          |
|     Imóvel Cadastrado com Sucesso!       |
|                                          |
|  Seu imóvel foi enviado para aprovação.  |
|                                          |
+------------------------------------------+
|  TERMOS DE AUTORIZAÇÃO                   |
|  +------------------------------------+  |
|  | 1ª) A presente autorização...      |  |
|  | 2ª) Fica autorizada...             |  |
|  | 3ª) Esta autorização é concedida...|  |
|  | 4ª) O(a)(s) contratante(s)...      |  |
|  | 5ª) As informações contidas...     |  |
|  +------------------------------------+  |
|                                          |
|  [ ] Li e aceito os termos de            |
|      autorização acima                   |
|                                          |
|       [Ir para o WhatsApp] (disabled)    |
+------------------------------------------+
```

### Mudanças Necessárias

#### Modificar ImovelForm.tsx

1. **Adicionar novo estado** para controlar o aceite dos termos:
```typescript
const [termsAccepted, setTermsAccepted] = useState(false);
```

2. **Resetar estado** quando dialog fecha:
```typescript
// No handleWhatsAppRedirect e onOpenChange do Dialog
setTermsAccepted(false);
```

3. **Expandir o Dialog de sucesso** para incluir:
   - ScrollArea com os termos legais
   - Checkbox para aceite
   - Botão desabilitado até aceitar

### Termo Legal (Conteúdo)

```text
TERMOS DE AUTORIZAÇÃO

1ª) A presente autorização, SEM EXCLUSIVIDADE, tem seu amparo na Lei 6.530, Art. 20, Item III e Artigos 722 a 729 do Código Civil Brasileiro.

2ª) Fica autorizada a colocação de placas, publicação de anúncios, a promoção e a intermediação da venda do imóvel acima descrito.

3ª) Esta autorização é concedida pelo prazo de 90 dias a contar desta data, prorrogada automaticamente, caso o(a)(s) contratante(s), após o término do prazo, não se manifeste(m) expressamente por escrito.

4ª) O(a)(s) contratante(s) se compromete(m) a pagar os honorários de 5%, desde que a compra, venda ou permuta, ora iniciada, intermediada por esta empresa, associadas ou associados, ocorra dentro do prazo acima estipulado, ou na sua prorrogação.

5ª) As informações contidas neste documento são de inteira responsabilidade do(a)(s) proprietário(a)(s) do imóvel.
```

### Detalhes Técnicos

#### Componentes a Importar

```typescript
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
```

#### Novo Dialog de Sucesso

```typescript
<Dialog open={showSuccessDialog} onOpenChange={(open) => {
  setShowSuccessDialog(open);
  if (!open) setTermsAccepted(false);
}}>
  <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden">
    <DialogHeader className="space-y-4">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <CheckCircle className="h-10 w-10 text-primary" />
      </div>
      <DialogTitle className="text-xl text-center">
        Imóvel Cadastrado com Sucesso!
      </DialogTitle>
      <DialogDescription className="text-base text-center">
        Seu imóvel foi enviado para aprovação. Para prosseguir, leia e aceite os termos abaixo.
      </DialogDescription>
    </DialogHeader>
    
    {/* Termos em ScrollArea */}
    <div className="mt-4">
      <h4 className="font-semibold mb-2">Termos de Autorização</h4>
      <ScrollArea className="h-48 w-full rounded-md border p-4 text-sm text-muted-foreground">
        <div className="space-y-3">
          <p>1ª) A presente autorização, SEM EXCLUSIVIDADE, tem seu amparo na Lei 6.530, Art. 20, Item III e Artigos 722 a 729 do Código Civil Brasileiro.</p>
          <p>2ª) Fica autorizada a colocação de placas, publicação de anúncios, a promoção e a intermediação da venda do imóvel acima descrito.</p>
          <p>3ª) Esta autorização é concedida pelo prazo de 90 dias a contar desta data, prorrogada automaticamente, caso o(a)(s) contratante(s), após o término do prazo, não se manifeste(m) expressamente por escrito.</p>
          <p>4ª) O(a)(s) contratante(s) se compromete(m) a pagar os honorários de 5%, desde que a compra, venda ou permuta, ora iniciada, intermediada por esta empresa, associadas ou associados, ocorra dentro do prazo acima estipulado, ou na sua prorrogação.</p>
          <p>5ª) As informações contidas neste documento são de inteira responsabilidade do(a)(s) proprietário(a)(s) do imóvel.</p>
        </div>
      </ScrollArea>
    </div>

    {/* Checkbox de aceite */}
    <div className="flex items-start gap-3 mt-4">
      <Checkbox
        id="terms"
        checked={termsAccepted}
        onCheckedChange={(checked) => setTermsAccepted(checked === true)}
      />
      <label htmlFor="terms" className="text-sm font-medium leading-none cursor-pointer">
        Li e aceito os termos de autorização acima
      </label>
    </div>

    <DialogFooter className="mt-4 sm:justify-center">
      <Button 
        variant="whatsapp" 
        onClick={handleWhatsAppRedirect} 
        disabled={!termsAccepted}
        className="w-full sm:w-auto"
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        Ir para o WhatsApp
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Arquivos a Modificar

1. `src/components/imoveis/ImovelForm.tsx` - Adicionar termos no dialog

### Considerações

- O termo só aparece no cadastro de imóveis por usuários (não admins)
- O checkbox deve ser marcado para habilitar o botão
- O estado é resetado quando o dialog fecha
- O ScrollArea permite visualizar todo o conteúdo mesmo em telas menores
- O texto dos termos é apresentado de forma clara e legível

