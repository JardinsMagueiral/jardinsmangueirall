import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, MessageCircle, Tag, ChevronLeft, ChevronRight } from "lucide-react";

interface Classificado {
  id: string;
  titulo: string;
  descricao: string | null;
  preco: number;
  categoria: string;
  contato_whatsapp: string;
  created_at: string;
}

interface Foto {
  id: string;
  url: string;
  ordem: number | null;
}

export default function ClassificadoDetalhe() {
  const { id } = useParams();
  const [item, setItem] = useState<Classificado | null>(null);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const [itemRes, fotosRes] = await Promise.all([
        supabase.from("classificados").select("*").eq("id", id).single(),
        supabase.from("classificado_fotos").select("*").eq("classificado_id", id!).order("ordem"),
      ]);

      if (itemRes.error) throw itemRes.error;
      setItem(itemRes.data);
      setFotos(fotosRes.data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleWhatsApp = () => {
    if (!item) return;
    const anuncioUrl = `https://jardinsmangueiral.com/classificados/${item.id}`;
    const msg = encodeURIComponent(
      `Olá! Vi seu anúncio "${item.titulo}" por ${formatPrice(item.preco)} no site jardinsmangueiral.com e tenho interesse!\n\nLink do anúncio: ${anuncioUrl}`
    );
    const phone = item.contato_whatsapp.replace(/\D/g, "");
    window.open(`https://wa.me/55${phone}?text=${msg}`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-lg text-muted-foreground">Anúncio não encontrado</p>
          <Button asChild>
            <Link to="/classificados">Voltar aos anúncios</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{item.titulo} - Trocas e Vendas</title>
      </Helmet>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 py-8">
          <div className="container max-w-4xl px-4">
            <Button variant="ghost" className="mb-4" asChild>
              <Link to="/classificados">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Link>
            </Button>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Photos */}
              <div>
                {fotos.length > 0 ? (
                  <div className="space-y-2">
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                      <img
                        src={fotos[selectedPhoto]?.url}
                        alt={item.titulo}
                        className="h-full w-full object-cover"
                      />
                      {fotos.length > 1 && (
                        <>
                          <button
                            onClick={() => setSelectedPhoto((p) => (p === 0 ? fotos.length - 1 : p - 1))}
                            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 shadow"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setSelectedPhoto((p) => (p === fotos.length - 1 ? 0 : p + 1))}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 shadow"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                    {fotos.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto">
                        {fotos.map((foto, i) => (
                          <button
                            key={foto.id}
                            onClick={() => setSelectedPhoto(i)}
                            className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 ${
                              i === selectedPhoto ? "border-primary" : "border-transparent"
                            }`}
                          >
                            <img src={foto.url} alt="" className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex aspect-square items-center justify-center rounded-lg bg-muted">
                    <Tag className="h-16 w-16 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <Badge variant="secondary">{item.categoria}</Badge>
                  <h1 className="mt-2 font-serif text-2xl font-bold">{item.titulo}</h1>
                  <p className="mt-1 text-3xl font-bold text-primary">
                    {formatPrice(item.preco)}
                  </p>
                </div>

                {item.descricao && (
                  <Card>
                    <CardContent className="p-4">
                      <h2 className="mb-2 font-semibold">Descrição</h2>
                      <p className="whitespace-pre-line text-muted-foreground">
                        {item.descricao}
                      </p>
                    </CardContent>
                  </Card>
                )}

                <p className="text-sm text-muted-foreground">
                  Publicado em{" "}
                  {new Date(item.created_at).toLocaleDateString("pt-BR")}
                </p>

                <Button
                  variant="whatsapp"
                  size="lg"
                  className="w-full"
                  onClick={handleWhatsApp}
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Falar com o Vendedor
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
