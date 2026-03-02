import { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X, Image, ArrowLeft, GripVertical, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Quadra {
  id: string;
  numero: number;
  nome: string;
  telefone: string;
  email: string;
  taxa_condominio: number;
}

interface QuadraFoto {
  id: string;
  url: string;
  ordem: number;
}

// Sortable photo item component
function SortableQuadraPhoto({
  foto,
  onDelete,
  isDeleting,
}: {
  foto: QuadraFoto;
  onDelete: (foto: QuadraFoto) => void;
  isDeleting: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: foto.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group aspect-square rounded-lg overflow-hidden">
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1 z-10 cursor-grab rounded bg-black/50 p-1 hover:bg-black/70 active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-white" />
      </button>
      <img src={foto.url} alt="" className="h-full w-full object-cover" draggable={false} />
      <button
        onClick={() => onDelete(foto)}
        disabled={isDeleting}
        className="absolute top-1 right-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <X className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

export default function AdminQuadras() {
  const [quadras, setQuadras] = useState<Quadra[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuadra, setSelectedQuadra] = useState<Quadra | null>(null);
  const [fotos, setFotos] = useState<QuadraFoto[]>([]);
  const [fotosLoading, setFotosLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [editingQuadra, setEditingQuadra] = useState<Quadra | null>(null);
  const [editForm, setEditForm] = useState({ nome: "", numero: "", telefone: "", email: "", taxa_condominio: "" });
  const [savingEdit, setSavingEdit] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchQuadras();
  }, []);

  const fetchQuadras = async () => {
    const { data } = await supabase
      .from("quadras")
      .select("id, numero, nome, telefone, email, taxa_condominio")
      .order("numero");
    setQuadras((data as Quadra[]) || []);
    setLoading(false);
  };

  const fetchFotos = useCallback(async (quadraId: string) => {
    setFotosLoading(true);
    const { data } = await supabase
      .from("quadra_fotos")
      .select("*")
      .eq("quadra_id", quadraId)
      .order("ordem");
    setFotos((data as QuadraFoto[]) || []);
    setFotosLoading(false);
  }, []);

  const openDialog = (quadra: Quadra) => {
    setSelectedQuadra(quadra);
    fetchFotos(quadra.id);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !selectedQuadra) return;
    const files = Array.from(e.target.files);
    
    if (fotos.length + files.length > 10) {
      toast.error("Máximo de 10 fotos por quadra.");
      return;
    }

    setUploading(true);
    try {
      let currentOrdem = fotos.length;
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} excede 5MB.`);
          continue;
        }
        const ext = file.name.split(".").pop();
        const path = `quadra-${selectedQuadra.numero}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("quadras")
          .upload(path, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("quadras").getPublicUrl(path);

        await supabase.from("quadra_fotos").insert({
          quadra_id: selectedQuadra.id,
          url: urlData.publicUrl,
          ordem: currentOrdem,
        });
        currentOrdem++;
      }
      toast.success("Fotos enviadas!");
      fetchFotos(selectedQuadra.id);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar fotos.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (foto: QuadraFoto) => {
    if (!selectedQuadra) return;
    setDeleting(foto.id);
    try {
      const url = new URL(foto.url);
      const pathParts = url.pathname.split("/storage/v1/object/public/quadras/");
      if (pathParts[1]) {
        await supabase.storage.from("quadras").remove([decodeURIComponent(pathParts[1])]);
      }
      await supabase.from("quadra_fotos").delete().eq("id", foto.id);
      toast.success("Foto removida!");
      fetchFotos(selectedQuadra.id);
    } catch {
      toast.error("Erro ao remover foto.");
    } finally {
      setDeleting(null);
    }
  };

  const openEditDialog = (quadra: Quadra) => {
    setEditingQuadra(quadra);
    setEditForm({
      nome: quadra.nome,
      numero: String(quadra.numero),
      telefone: quadra.telefone,
      email: quadra.email,
      taxa_condominio: String(quadra.taxa_condominio),
    });
  };

  const handleSaveEdit = async () => {
    if (!editingQuadra) return;
    setSavingEdit(true);
    try {
      const { error } = await supabase
        .from("quadras")
        .update({
          nome: editForm.nome.trim(),
          numero: Number(editForm.numero),
          telefone: editForm.telefone.trim(),
          email: editForm.email.trim(),
          taxa_condominio: Number(editForm.taxa_condominio),
        })
        .eq("id", editingQuadra.id);
      if (error) throw error;
      toast.success("Quadra atualizada!");
      setEditingQuadra(null);
      fetchQuadras();
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !selectedQuadra) return;

    const oldIndex = fotos.findIndex((f) => f.id === active.id);
    const newIndex = fotos.findIndex((f) => f.id === over.id);
    const reordered = arrayMove(fotos, oldIndex, newIndex);
    setFotos(reordered);

    // Persist new order
    setSavingOrder(true);
    try {
      const updates = reordered.map((foto, index) =>
        supabase.from("quadra_fotos").update({ ordem: index }).eq("id", foto.id)
      );
      await Promise.all(updates);
    } catch {
      toast.error("Erro ao salvar ordem.");
      fetchFotos(selectedQuadra.id);
    } finally {
      setSavingOrder(false);
    }
  }, [fotos, selectedQuadra, fetchFotos]);

  return (
    <>
      <Helmet>
        <title>Gerenciar Quadras - Admin</title>
      </Helmet>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 py-8">
          <div className="container px-4">
            <Button variant="ghost" size="sm" className="mb-4" asChild>
              <Link to="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Painel
              </Link>
            </Button>

            <h1 className="font-serif text-3xl font-bold mb-6">Gerenciar Quadras</h1>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {quadras.map((q) => (
                  <Card key={q.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openDialog(q)}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">
                        Quadra {String(q.numero).padStart(2, "0")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{q.nome}</p>
                      <p className="text-xs text-muted-foreground mt-1">Taxa: R$ {Number(q.taxa_condominio).toFixed(2)}</p>
                      <div className="mt-3 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); openEditDialog(q); }}>
                          <Pencil className="mr-1 h-3 w-3" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => openDialog(q)}>
                          <Image className="mr-1 h-3 w-3" />
                          Fotos
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>

      {/* Dialog for managing photos */}
      <Dialog open={!!selectedQuadra} onOpenChange={(open) => !open && setSelectedQuadra(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Fotos - Quadra {selectedQuadra && String(selectedQuadra.numero).padStart(2, "0")}
            </DialogTitle>
            <DialogDescription>
              {selectedQuadra?.nome} — Máximo de 10 fotos. Arraste para reordenar.
              {savingOrder && <span className="ml-2 text-primary">(Salvando ordem...)</span>}
            </DialogDescription>
          </DialogHeader>

          {fotosLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={fotos.map((f) => f.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {fotos.map((foto) => (
                      <SortableQuadraPhoto
                        key={foto.id}
                        foto={foto}
                        onDelete={handleDelete}
                        isDeleting={deleting === foto.id}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {fotos.length < 10 && (
                <div className="mt-4">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <Button variant="outline" className="w-full" disabled={uploading} asChild>
                      <span>
                        {uploading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="mr-2 h-4 w-4" />
                        )}
                        {uploading ? "Enviando..." : `Adicionar Fotos (${fotos.length}/10)`}
                      </span>
                    </Button>
                  </label>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
      {/* Edit Quadra Dialog */}
      <Dialog open={!!editingQuadra} onOpenChange={(open) => !open && setEditingQuadra(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Quadra {editingQuadra && String(editingQuadra.numero).padStart(2, "0")}</DialogTitle>
            <DialogDescription>Altere os dados da quadra abaixo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-nome">Nome</Label>
              <Input id="edit-nome" value={editForm.nome} onChange={(e) => setEditForm((f) => ({ ...f, nome: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="edit-numero">Número</Label>
              <Input id="edit-numero" type="number" value={editForm.numero} onChange={(e) => setEditForm((f) => ({ ...f, numero: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="edit-telefone">Telefone</Label>
              <Input id="edit-telefone" value={editForm.telefone} onChange={(e) => setEditForm((f) => ({ ...f, telefone: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="edit-taxa">Taxa de Condomínio (R$)</Label>
              <Input id="edit-taxa" type="number" step="0.01" value={editForm.taxa_condominio} onChange={(e) => setEditForm((f) => ({ ...f, taxa_condominio: e.target.value }))} />
            </div>
            <Button onClick={handleSaveEdit} disabled={savingEdit} className="w-full">
              {savingEdit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
