import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PhotoItem {
  id: string;
  url: string;
  type: 'existing' | 'new';
  file?: File;
}

interface SortablePhotoItemProps {
  photo: PhotoItem;
  index: number;
  onRemove: (photo: PhotoItem) => void;
  isDeleting: boolean;
}

export function SortablePhotoItem({ photo, index, onRemove, isDeleting }: SortablePhotoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: photo.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative aspect-square"
    >
      {/* Drag Handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1 z-10 cursor-grab rounded bg-black/50 p-1 hover:bg-black/70 active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-white" />
      </button>

      {/* Cover badge */}
      {index === 0 && (
        <span className="absolute left-8 top-1 z-10 rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground">
          Capa
        </span>
      )}

      {/* Image */}
      <img
        src={photo.url}
        alt={`Foto ${index + 1}`}
        className="h-full w-full rounded-lg object-cover"
        draggable={false}
      />

      {/* Remove button */}
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute -right-2 -top-2 z-20 h-6 w-6"
        onClick={() => onRemove(photo)}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <X className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
