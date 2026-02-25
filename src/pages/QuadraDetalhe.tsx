import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Phone, Mail, DollarSign, ArrowLeft, Building } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function QuadraDetalhe() {
  const { numero } = useParams<{ numero: string }>();
  const [quadra, setQuadra] = useState<Quadra | null>(null);
  const [fotos, setFotos] = useState<QuadraFoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!numero) return;
    const fetchQuadra = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("quadras")
        .select("*")
        .eq("numero", parseInt(numero))
        .single();

      if (!error && data) {
        setQuadra(data as Quadra);
        const { data: fotosData } = await supabase
          .from("quadra_fotos")
          .select("*")
          .eq("quadra_id", data.id)
          .order("ordem");
        setFotos((fotosData as QuadraFoto[]) || []);
      }
      setLoading(false);
    };
    fetchQuadra();
  }, [numero]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!quadra) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Quadra não encontrada</h1>
            <Button asChild>
              <Link to="/">Voltar ao Início</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Quadra {String(quadra.numero).padStart(2, "0")} - {quadra.nome} | Jardins Mangueiral</title>
        <meta name="description" content={`Informações da Quadra ${String(quadra.numero).padStart(2, "0")} - ${quadra.nome} no Jardins Mangueiral.`} />
      </Helmet>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 py-8">
          <div className="container px-4">
            <Button variant="ghost" size="sm" className="mb-6" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Início
              </Link>
            </Button>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Photo Carousel */}
              <div>
                {fotos.length > 0 ? (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {fotos.map((foto) => (
                        <CarouselItem key={foto.id}>
                          <div className="aspect-video overflow-hidden rounded-lg">
                            <img
                              src={foto.url}
                              alt={`Foto da ${quadra.nome}`}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {fotos.length > 1 && (
                      <>
                        <CarouselPrevious />
                        <CarouselNext />
                      </>
                    )}
                  </Carousel>
                ) : (
                  <div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
                    <Building className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div>
                <h1 className="font-serif text-3xl font-bold mb-2">
                  Quadra {String(quadra.numero).padStart(2, "0")}
                </h1>
                <p className="text-xl text-primary font-semibold mb-6">{quadra.nome}</p>

                <Card>
                  <CardContent className="space-y-4 pt-6">
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Telefone(s)</p>
                        <p className="font-medium">{quadra.telefone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">E-mail</p>
                        <a href={`mailto:${quadra.email}`} className="font-medium text-primary hover:underline break-all">
                          {quadra.email.toLowerCase()}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Taxa de Condomínio</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(quadra.taxa_condominio)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
