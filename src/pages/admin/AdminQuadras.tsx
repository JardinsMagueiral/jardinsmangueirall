import { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Upload, X, Image, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface Quadra {
  id: string;
  numero: number;
  nome: string;
}

interface QuadraFoto {
  id: string;
  url: string;
  ordem: number;
}

export default function AdminQuadras() {
  const [quadras, setQuadras] = useState<Quadra[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuadra, setSelectedQuadra] = useState<Quadra | null>(null);
  const [fotos, setFotos] = useState<QuadraFoto[]>([]);
  const [fotosLoading, setFotosLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchQuadras();
  }, []);

  const fetchQuadras = async () => {
    const { data } = await supabase
      .from("quadras")
      .select("id, numero, nome")
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
          ordem: fotos.length,
        });
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
      // Extract path from URL
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

            <h1 className="font-serif text-3xl font-bold mb-6">Gerenciar Fotos das Quadras</h1>

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
                      <Button variant="outline" size="sm" className="mt-3 w-full">
                        <Image className="mr-2 h-4 w-4" />
                        Gerenciar Fotos
                      </Button>
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
              {selectedQuadra?.nome} — Máximo de 10 fotos
            </DialogDescription>
          </DialogHeader>

          {fotosLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {fotos.map((foto) => (
                  <div key={foto.id} className="relative group aspect-square rounded-lg overflow-hidden">
                    <img src={foto.url} alt="" className="h-full w-full object-cover" />
                    <button
                      onClick={() => handleDelete(foto)}
                      disabled={deleting === foto.id}
                      className="absolute top-1 right-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {deleting === foto.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>

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
    </>
  );
}
