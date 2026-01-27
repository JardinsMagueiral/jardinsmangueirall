

## Plano: Ordenação de Fotos com Drag and Drop

### Objetivo

Permitir que usuários e administradores reordenem as fotos dos imóveis através de arrastar e soltar (drag and drop), tanto para fotos existentes quanto para novas fotos sendo adicionadas.

### Solução Técnica

Utilizarei a biblioteca **@dnd-kit** que é moderna, leve e bem mantida para implementar drag and drop em React. Esta biblioteca oferece:
- Suporte a touch devices (mobile)
- Acessibilidade (navegação por teclado)
- Performance otimizada
- API declarativa e fácil de usar

### Estrutura Visual

```text
+------------------------------------------+
|  Fotos                                   |
|  Adicione até 10 fotos (3/10)            |
|  Arraste para reordenar                  |
+------------------------------------------+
|                                          |
|  [1] ≡  [2] ≡  [3] ≡  [+]               |
|  foto   foto   foto   Adicionar          |
|   ×      ×      ×                        |
|                                          |
|  ≡ = ícone de arrastar (drag handle)    |
|  × = botão de remover                    |
+------------------------------------------+
```

### Mudanças Necessárias

#### 1. Instalar Dependência

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

#### 2. Criar Componente SortablePhotoItem

Criar `src/components/imoveis/SortablePhotoItem.tsx`:
- Componente individual para cada foto
- Integrado com useSortable do dnd-kit
- Exibe ícone de arrastar (GripVertical)
- Mantém botão de remover

#### 3. Atualizar ImovelForm

Modificar `src/components/imoveis/ImovelForm.tsx`:

**Novos estados e tipos:**
```typescript
interface PhotoItem {
  id: string;
  url: string;
  type: 'existing' | 'new';
  file?: File;
}

// Estado unificado para todas as fotos (existentes + novas)
const [allPhotos, setAllPhotos] = useState<PhotoItem[]>([]);
```

**Implementar DndContext e SortableContext:**
```typescript
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';

// No render:
<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
  <SortableContext items={allPhotos.map(p => p.id)} strategy={rectSortingStrategy}>
    {allPhotos.map((photo, index) => (
      <SortablePhotoItem 
        key={photo.id}
        photo={photo}
        index={index}
        onRemove={handleRemovePhoto}
        isDeleting={deletingPhotoId === photo.id}
      />
    ))}
  </SortableContext>
</DndContext>
```

**Função de reordenação:**
```typescript
const handleDragEnd = (event) => {
  const { active, over } = event;
  if (active.id !== over.id) {
    setAllPhotos((items) => {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  }
};
```

#### 4. Atualizar Lógica de Salvamento

**Ao salvar o imóvel:**
1. Para fotos existentes: Atualizar a coluna `ordem` no banco
2. Para novas fotos: Fazer upload e inserir com a ordem correta

```typescript
const savePhotosOrder = async (imovelId: string) => {
  // Atualizar ordem das fotos existentes
  for (let i = 0; i < allPhotos.length; i++) {
    const photo = allPhotos[i];
    if (photo.type === 'existing') {
      await supabase
        .from("imovel_fotos")
        .update({ ordem: i })
        .eq("id", photo.id);
    }
  }
  
  // Upload e inserção das novas fotos com ordem correta
  for (let i = 0; i < allPhotos.length; i++) {
    const photo = allPhotos[i];
    if (photo.type === 'new' && photo.file) {
      // upload para storage
      // inserir no banco com ordem: i
    }
  }
};
```

### Arquivos a Criar

1. `src/components/imoveis/SortablePhotoItem.tsx` - Componente de foto arrastável

### Arquivos a Modificar

1. `src/components/imoveis/ImovelForm.tsx` - Adicionar lógica de drag and drop

### Experiência do Usuário

1. Ao adicionar fotos, elas aparecem em um grid
2. Cada foto mostra um ícone de arrastar (≡) no canto superior esquerdo
3. O usuário pode clicar e arrastar para reordenar
4. A primeira foto (posição 0) será a foto principal/capa do imóvel
5. Ao salvar, a ordem é persistida no banco de dados
6. Funciona tanto em desktop quanto em dispositivos móveis

### Detalhes Técnicos

**SortablePhotoItem.tsx:**
```typescript
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Loader2 } from 'lucide-react';

interface Props {
  photo: PhotoItem;
  index: number;
  onRemove: (photo: PhotoItem) => void;
  isDeleting: boolean;
}

export function SortablePhotoItem({ photo, index, onRemove, isDeleting }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: photo.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative aspect-square">
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1 z-10 cursor-grab bg-black/50 rounded p-1"
      >
        <GripVertical className="h-4 w-4 text-white" />
      </button>
      
      {/* Indicador de foto principal */}
      {index === 0 && (
        <span className="absolute left-8 top-1 z-10 bg-primary text-white text-xs px-2 py-0.5 rounded">
          Capa
        </span>
      )}
      
      {/* Imagem */}
      <img src={photo.url} className="h-full w-full rounded-lg object-cover" />
      
      {/* Botão remover */}
      <Button onClick={() => onRemove(photo)} disabled={isDeleting}>
        {isDeleting ? <Loader2 /> : <X />}
      </Button>
    </div>
  );
}
```

### Considerações

- A tabela `imovel_fotos` já possui a coluna `ordem`, então não precisa de migração
- O drag and drop funciona em touch screens automaticamente
- A foto na posição 0 é considerada a foto principal/capa
- A experiência visual inclui feedback durante o arrasto (opacidade reduzida)

