

## Plano: Corrigir Visualização de Imóveis

### Problema Identificado

A página de detalhes do imóvel (`ImovelDetalhe.tsx`) não está funcionando corretamente para administradores e proprietários por dois motivos:

1. **Race condition**: O `useEffect` executa imediatamente quando a página carrega, mas o `user` do AuthContext pode ainda não estar disponível, resultando em `user?.id` sendo `undefined`

2. **Falta verificação de admin**: A lógica atual só verifica se o usuário é proprietário, mas não considera se é administrador

### Fluxo Atual (Problemático)

```text
1. Página carrega
2. useEffect dispara (dependência: [id])
3. fetchImovel() executa
4. user ainda pode ser null (AuthContext ainda carregando)
5. Verificação user?.id === imovelData.user_id falha
6. Imóvel não aprovado é bloqueado mesmo para proprietário/admin
```

### Novo Fluxo (Corrigido)

```text
1. Página carrega
2. Espera AuthContext terminar loading
3. useEffect dispara (dependências: [id, user, isAdmin, loading])
4. fetchImovel() executa com user já disponível
5. Verifica se é proprietário OU se é admin
6. Mostra imóvel corretamente
```

### Mudanças Necessárias

#### Modificar ImovelDetalhe.tsx

1. **Adicionar `isAdmin` do AuthContext**:
```typescript
const { user, isAdmin, loading: authLoading } = useAuth();
```

2. **Atualizar dependências do useEffect**:
```typescript
useEffect(() => {
  // Só buscar quando auth terminar de carregar
  if (id && !authLoading) {
    fetchImovel();
    fetchFotos();
  }
}, [id, user, isAdmin, authLoading]);
```

3. **Atualizar lógica de permissão**:
```typescript
const fetchImovel = async () => {
  // ...busca do imóvel...
  
  if (data) {
    const imovelData = data as Imovel;
    const userIsOwner = user?.id === imovelData.user_id;
    setIsOwner(userIsOwner);
    
    // Pode ver se: aprovado OU é proprietário OU é admin
    if (imovelData.status === "aprovado" || userIsOwner || isAdmin) {
      setImovel(imovelData);
    } else {
      setImovel(null);
    }
  }
};
```

4. **Mostrar loading enquanto auth carrega**:
```typescript
if (loading || authLoading) {
  return (
    // ...loading spinner...
  );
}
```

5. **Adicionar indicador visual para imóveis não aprovados**:
```typescript
{imovel.status !== "aprovado" && (
  <Badge variant="secondary" className="mb-4">
    Status: {imovel.status}
  </Badge>
)}
```

### Código Final Proposto

```typescript
export default function ImovelDetalhe() {
  const { id } = useParams();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (id && !authLoading) {
      fetchImovel();
      fetchFotos();
    }
  }, [id, user, isAdmin, authLoading]);

  const fetchImovel = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("imoveis")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        const imovelData = data as Imovel;
        const userIsOwner = user?.id === imovelData.user_id;
        setIsOwner(userIsOwner);
        
        // Pode ver se: aprovado OU é proprietário OU é admin
        if (imovelData.status === "aprovado" || userIsOwner || isAdmin) {
          setImovel(imovelData);
        } else {
          setImovel(null);
        }
      } else {
        setImovel(null);
      }
    } catch {
      setImovel(null);
    } finally {
      setLoading(false);
    }
  };

  // Loading: mostra spinner se dados OU auth estão carregando
  if (loading || authLoading) {
    return (/* loading spinner */);
  }
  
  // ...resto do componente...
}
```

### Arquivos a Modificar

1. `src/pages/ImovelDetalhe.tsx` - Corrigir lógica de visualização

### Experiência do Usuário

- **Visitante anônimo**: Só vê imóveis aprovados
- **Cliente logado (proprietário)**: Vê seus próprios imóveis em qualquer status
- **Administrador**: Vê todos os imóveis em qualquer status
- **Indicador visual**: Imóveis pendentes/rejeitados mostram badge de status

