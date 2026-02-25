import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Handshake, Wrench, Building2, UserPlus, MessageCircle, Phone, Mail, Instagram, Globe, MapPin, Loader2, Star, Plus, Upload, X, ImageIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ParceiroFoto {
  id: string;
  url: string;
  ordem: number;
}

interface Parceiro {
  id: string;
  nome: string;
  categoria: string;
  descricao: string | null;
  telefone: string;
  email: string | null;
  instagram: string | null;
  site: string | null;
  endereco: string | null;
  logo_url: string | null;
  destaque: boolean;
  parceiro_fotos?: ParceiroFoto[];
}

const CATEGORIAS = [
  "Alimentação",
  "Beleza e Estética",
  "Saúde",
  "Serviços Domésticos",
  "Educação",
  "Pet",
  "Tecnologia",
  "Construção e Reforma",
  "Outros",
];

const MAX_PHOTOS = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const Parceiros = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    nome: "",
    categoria: "",
    descricao: "",
    telefone: "",
    email: "",
    instagram: "",
    site: "",
    endereco: "",
  });

  useEffect(() => {
    fetchParceiros();
  }, []);

  const fetchParceiros = async () => {
    try {
      const { data, error } = await supabase
        .from("parceiros")
        .select(`
          *,
          parceiro_fotos (id, url, ordem)
        `)
        .eq("status", "aprovado")
        .order("destaque", { ascending: false })
        .order("nome", { ascending: true });

      if (error) throw error;
      setParceiros((data as Parceiro[]) || []);
    } catch (error) {
      console.error("Erro ao carregar parceiros:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < files.length; i++) {
      if (selectedPhotos.length + newFiles.length >= MAX_PHOTOS) {
        toast({
          title: "Limite de fotos",
          description: `Você pode adicionar no máximo ${MAX_PHOTOS} fotos.`,
          variant: "destructive",
        });
        break;
      }

      const file = files[i];

      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({
          title: "Formato inválido",
          description: `${file.name} não é um formato aceito. Use JPEG, PNG ou WebP.`,
          variant: "destructive",
        });
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "Arquivo muito grande",
          description: `${file.name} excede 5MB.`,
          variant: "destructive",
        });
        continue;
      }

      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setSelectedPhotos((prev) => [...prev, ...newFiles]);
    setPhotoPreviews((prev) => [...prev, ...newPreviews]);
    
    // Reset input
    e.target.value = "";
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index]);
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async (parceiroId: string) => {
    const uploadedUrls: { url: string; ordem: number }[] = [];

    for (let i = 0; i < selectedPhotos.length; i++) {
      const file = selectedPhotos[i];
      const fileExt = file.name.split(".").pop();
      const fileName = `${parceiroId}/${Date.now()}-${i}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("parceiros")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Erro ao fazer upload:", uploadError);
        continue;
      }

      const { data: publicUrl } = supabase.storage
        .from("parceiros")
        .getPublicUrl(fileName);

      uploadedUrls.push({ url: publicUrl.publicUrl, ordem: i });
    }

    // Insert photo records
    if (uploadedUrls.length > 0) {
      const { error: insertError } = await supabase
        .from("parceiro_fotos")
        .insert(
          uploadedUrls.map((photo) => ({
            parceiro_id: parceiroId,
            url: photo.url,
            ordem: photo.ordem,
          }))
        );

      if (insertError) {
        console.error("Erro ao salvar fotos:", insertError);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para cadastrar um parceiro.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!formData.nome || !formData.categoria || !formData.telefone) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, categoria e telefone.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const { data: newParceiro, error } = await supabase
        .from("parceiros")
        .insert({
          nome: formData.nome.trim(),
          categoria: formData.categoria,
          descricao: formData.descricao.trim() || null,
          telefone: formData.telefone.trim(),
          email: formData.email.trim() || null,
          instagram: formData.instagram.trim() || null,
          site: formData.site.trim() || null,
          endereco: formData.endereco.trim() || null,
          user_id: user.id,
          status: "pendente",
        })
        .select("id")
        .single();

      if (error) throw error;

      // Upload photos if any
      if (selectedPhotos.length > 0 && newParceiro) {
        await uploadPhotos(newParceiro.id);
      }

      toast({
        title: "Cadastro enviado!",
        description: "Seu negócio foi enviado para aprovação. Você será notificado quando for aprovado.",
      });

      // Reset form
      setFormData({
        nome: "",
        categoria: "",
        descricao: "",
        telefone: "",
        email: "",
        instagram: "",
        site: "",
        endereco: "",
      });
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
      setSelectedPhotos([]);
      setPhotoPreviews([]);
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Erro ao cadastrar parceiro:", error);
      toast({
        title: "Erro ao cadastrar",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatWhatsApp = (telefone: string) => {
    const cleaned = telefone.replace(/\D/g, "");
    return cleaned.startsWith("55") ? cleaned : `55${cleaned}`;
  };

  const ParceiroCard = ({ parceiro }: { parceiro: Parceiro }) => {
    const fotos = parceiro.parceiro_fotos?.sort((a, b) => a.ordem - b.ordem) || [];
    const hasPhotos = fotos.length > 0;
    const hasLogo = Boolean(parceiro.logo_url);

    return (
      <Card className={`transition-all hover:shadow-lg ${parceiro.destaque ? "ring-2 ring-primary" : ""}`}>
        {/* Photos Carousel or Logo */}
        {hasPhotos ? (
          <div className="relative overflow-hidden rounded-t-lg">
            <Carousel className="w-full">
              <CarouselContent>
                {fotos.map((foto) => (
                  <CarouselItem key={foto.id}>
                    <div className="h-40 w-full">
                      <img
                        src={foto.url}
                        alt={parceiro.nome}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {fotos.length > 1 && (
                <>
                  <CarouselPrevious className="left-2 h-8 w-8" />
                  <CarouselNext className="right-2 h-8 w-8" />
                </>
              )}
            </Carousel>
            {/* Indicators */}
            {fotos.length > 1 && (
              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                {fotos.map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-white/70"
                  />
                ))}
              </div>
            )}
          </div>
        ) : hasLogo ? (
          <div className="h-32 overflow-hidden rounded-t-lg bg-muted">
            <img
              src={parceiro.logo_url!}
              alt={parceiro.nome}
              className="h-full w-full object-contain p-4"
            />
          </div>
        ) : null}

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <Badge variant="secondary">{parceiro.categoria}</Badge>
            {parceiro.destaque && (
              <Star className="h-5 w-5 fill-primary text-primary" />
            )}
          </div>
          <CardTitle className="text-xl">{parceiro.nome}</CardTitle>
          {parceiro.descricao && (
            <CardDescription className="line-clamp-2">
              {parceiro.descricao}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {parceiro.endereco && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{parceiro.endereco}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button variant="whatsapp" size="sm" asChild>
              <a
                href={`https://wa.me/${formatWhatsApp(parceiro.telefone)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Phone className="mr-1 h-4 w-4" />
                WhatsApp
              </a>
            </Button>
            {parceiro.instagram && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://instagram.com/${parceiro.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="mr-1 h-4 w-4" />
                  Instagram
                </a>
              </Button>
            )}
            {parceiro.site && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={parceiro.site.startsWith("http") ? parceiro.site : `https://${parceiro.site}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe className="mr-1 h-4 w-4" />
                  Site
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Helmet>
        <title>Parceiros e Indicações | Jardins Mangueiral</title>
        <meta name="description" content="Encontre prestadores de serviços e empresas parceiras de confiança na comunidade Jardins Mangueiral." />
      </Helmet>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          {/* Hero */}
          <section className="bg-primary py-16 text-primary-foreground">
            <div className="container px-4 text-center">
              <Handshake className="mx-auto mb-4 h-12 w-12" />
              <h1 className="font-serif text-4xl font-bold md:text-5xl">Parceiros e Indicações</h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg opacity-90">
                Prestadores de serviços e empresas parceiras da comunidade
              </p>
            </div>
          </section>

          {/* Parceiros Aprovados */}
          {loading ? (
            <section className="py-16">
              <div className="container px-4 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </section>
          ) : parceiros.length > 0 ? (
            <section className="py-16">
              <div className="container px-4">
                <h2 className="mb-8 text-center font-serif text-3xl font-bold">
                  Parceiros da Comunidade
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {parceiros.map((parceiro) => (
                    <ParceiroCard key={parceiro.id} parceiro={parceiro} />
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {/* Quick Options */}
          <section className="py-16 bg-muted/50">
            <div className="container px-4">
              <h2 className="mb-8 text-center font-serif text-3xl font-bold">
                Precisa de Ajuda?
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="text-center transition-all hover:shadow-lg">
                  <CardHeader>
                    <Wrench className="mx-auto mb-2 h-10 w-10 text-primary" />
                    <CardTitle className="text-lg">Prestadores de Serviços</CardTitle>
                    <CardDescription>
                      Eletricistas, encanadores, diaristas e mais
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="whatsapp" className="w-full" asChild>
                      <a
                        href="https://wa.me/5561991647984?text=Olá! Procuro um prestador de serviço"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Solicitar Indicação
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="text-center transition-all hover:shadow-lg">
                  <CardHeader>
                    <Building2 className="mx-auto mb-2 h-10 w-10 text-primary" />
                    <CardTitle className="text-lg">Empresas Parceiras</CardTitle>
                    <CardDescription>
                      Lojas e empresas da região com descontos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="whatsapp" className="w-full" asChild>
                      <a
                        href="https://wa.me/5561991647984?text=Olá! Quero conhecer as empresas parceiras"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Ver Parceiros
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="text-center transition-all hover:shadow-lg">
                  <CardHeader>
                    <UserPlus className="mx-auto mb-2 h-10 w-10 text-primary" />
                    <CardTitle className="text-lg">Indique um Profissional</CardTitle>
                    <CardDescription>
                      Conhece alguém de confiança? Indique!
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" asChild>
                      <a
                        href="https://wa.me/5561991647984?text=Olá! Quero indicar um profissional"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Indicar Agora
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="text-center transition-all hover:shadow-lg bg-secondary/50">
                  <CardHeader>
                    <Handshake className="mx-auto mb-2 h-10 w-10 text-primary" />
                    <CardTitle className="text-lg">Quero Ser Parceiro</CardTitle>
                    <CardDescription>
                      Divulgue seu negócio para a comunidade
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <Plus className="mr-2 h-4 w-4" />
                          Cadastrar Negócio
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Cadastrar Meu Negócio</DialogTitle>
                          <DialogDescription>
                            Preencha os dados do seu negócio. Após envio, ele será analisado pela equipe.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="nome">Nome do Negócio *</Label>
                            <Input
                              id="nome"
                              value={formData.nome}
                              onChange={(e) => handleInputChange("nome", e.target.value)}
                              placeholder="Ex: Padaria do João"
                              required
                              maxLength={100}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="categoria">Categoria *</Label>
                            <Select
                              value={formData.categoria}
                              onValueChange={(value) => handleInputChange("categoria", value)}
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                              <SelectContent>
                                {CATEGORIAS.map((cat) => (
                                  <SelectItem key={cat} value={cat}>
                                    {cat}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Photo Upload Section */}
                          <div className="space-y-2">
                            <Label>Fotos do Negócio (até {MAX_PHOTOS})</Label>
                            <div className="flex flex-wrap gap-3">
                              {/* Photo Previews */}
                              {photoPreviews.map((preview, index) => (
                                <div key={index} className="relative h-20 w-20">
                                  <img
                                    src={preview}
                                    alt={`Foto ${index + 1}`}
                                    className="h-full w-full rounded-lg object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removePhoto(index)}
                                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}

                              {/* Add Photo Button */}
                              {selectedPhotos.length < MAX_PHOTOS && (
                                <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 text-muted-foreground transition-colors hover:border-primary hover:bg-muted hover:text-primary">
                                  <ImageIcon className="h-6 w-6" />
                                  <span className="text-xs">Adicionar</span>
                                  <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    onChange={handlePhotoSelect}
                                    className="hidden"
                                  />
                                </label>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              JPEG, PNG ou WebP. Máximo 5MB cada.
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="descricao">Descrição</Label>
                            <Textarea
                              id="descricao"
                              value={formData.descricao}
                              onChange={(e) => handleInputChange("descricao", e.target.value)}
                              placeholder="Descreva seu negócio em poucas palavras..."
                              rows={3}
                              maxLength={500}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="telefone">Telefone/WhatsApp *</Label>
                            <Input
                              id="telefone"
                              value={formData.telefone}
                              onChange={(e) => handleInputChange("telefone", e.target.value)}
                              placeholder="(61) 99999-9999"
                              required
                              maxLength={20}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange("email", e.target.value)}
                              placeholder="contato@seunegocio.com"
                              maxLength={100}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="instagram">Instagram</Label>
                            <Input
                              id="instagram"
                              value={formData.instagram}
                              onChange={(e) => handleInputChange("instagram", e.target.value)}
                              placeholder="@seunegocio"
                              maxLength={50}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="site">Site</Label>
                            <Input
                              id="site"
                              value={formData.site}
                              onChange={(e) => handleInputChange("site", e.target.value)}
                              placeholder="www.seunegocio.com.br"
                              maxLength={100}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="endereco">Endereço</Label>
                            <Input
                              id="endereco"
                              value={formData.endereco}
                              onChange={(e) => handleInputChange("endereco", e.target.value)}
                              placeholder="Rua, número - Bairro"
                              maxLength={200}
                            />
                          </div>

                          {!user && (
                            <p className="text-sm text-muted-foreground">
                              Você precisará fazer login para enviar o cadastro.
                            </p>
                          )}

                          <Button type="submit" className="w-full" disabled={submitting}>
                            {submitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enviando...
                              </>
                            ) : (
                              "Enviar para Aprovação"
                            )}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Parceiros;
