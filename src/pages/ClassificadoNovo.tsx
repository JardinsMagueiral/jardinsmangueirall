import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";

const CATEGORIAS = [
  "Eletrônicos",
  "Móveis",
  "Eletrodomésticos",
  "Veículos",
  "Roupas",
  "Brinquedos",
  "Esportes",
  "Ferramentas",
  "Outros",
];

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function ClassificadoNovo() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [precoFormatado, setPrecoFormatado] = useState("");
  const [categoria, setCategoria] = useState("");
  const [contatoWhatsapp, setContatoWhatsapp] = useState(profile?.telefone || "");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handlePrecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const num = parseInt(raw) || 0;
    setPreco(raw);
    setPrecoFormatado(num > 0 ? num.toLocaleString("pt-BR") : "");
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_PHOTOS - photos.length;
    const valid = files.filter((f) => {
      if (f.size > MAX_FILE_SIZE) {
        toast({ title: "Arquivo muito grande", description: `${f.name} excede 5MB`, variant: "destructive" });
        return false;
      }
      return true;
    }).slice(0, remaining);

    setPhotos((prev) => [...prev, ...valid]);
    setPreviews((prev) => [...prev, ...valid.map((f) => URL.createObjectURL(f))]);
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!titulo || !preco || !categoria || !contatoWhatsapp) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Insert classificado
      const { data: classificado, error } = await supabase
        .from("classificados")
        .insert({
          user_id: user.id,
          titulo,
          descricao: descricao || null,
          preco: parseInt(preco),
          categoria,
          contato_whatsapp: contatoWhatsapp,
        })
        .select()
        .single();

      if (error) throw error;

      // Upload photos
      if (photos.length > 0) {
        for (let i = 0; i < photos.length; i++) {
          const file = photos[i];
          const ext = file.name.split(".").pop();
          const path = `${classificado.id}/${Date.now()}_${i}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from("classificados")
            .upload(path, file);

          if (uploadError) continue;

          const { data: urlData } = supabase.storage
            .from("classificados")
            .getPublicUrl(path);

          await supabase.from("classificado_fotos").insert({
            classificado_id: classificado.id,
            url: urlData.publicUrl,
            ordem: i,
          });
        }
      }

      toast({
        title: "Anúncio cadastrado!",
        description: "Seu anúncio será analisado e publicado após aprovação.",
      });
      navigate("/classificados");
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao cadastrar", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Anunciar Item - Trocas e Vendas</title>
      </Helmet>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 py-8">
          <div className="container max-w-2xl px-4">
            <Button variant="ghost" className="mb-4" asChild>
              <Link to="/classificados">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Link>
            </Button>

            <div className="mb-6">
              <h1 className="font-serif text-3xl font-bold">Anunciar Item</h1>
              <p className="text-muted-foreground">
                Seu anúncio ficará visível após a aprovação de um administrador.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Dados do Anúncio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      placeholder="Ex: iPhone 13 128GB"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Select value={categoria} onValueChange={setCategoria} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIAS.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preco">Preço (R$) *</Label>
                    <Input
                      id="preco"
                      type="text"
                      inputMode="numeric"
                      placeholder="Ex: 1.500"
                      value={precoFormatado}
                      onChange={handlePrecoChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      placeholder="Descreva o item, estado de conservação, motivo da venda..."
                      rows={4}
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp para contato *</Label>
                    <Input
                      id="whatsapp"
                      placeholder="(61) 99999-9999"
                      value={contatoWhatsapp}
                      onChange={(e) => setContatoWhatsapp(e.target.value)}
                      required
                    />
                  </div>

                  {/* Photos */}
                  <div className="space-y-2">
                    <Label>Fotos (máx. {MAX_PHOTOS})</Label>
                    {previews.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {previews.map((url, i) => (
                          <div key={i} className="group relative h-24 w-24 overflow-hidden rounded-md border">
                            <img src={url} alt="" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removePhoto(i)}
                              className="absolute right-1 top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {photos.length < MAX_PHOTOS && (
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 transition-colors hover:border-primary/50">
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Adicionar fotos</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handlePhotoSelect}
                        />
                      </label>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" className="mt-6 w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Publicar Anúncio"
                )}
              </Button>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
