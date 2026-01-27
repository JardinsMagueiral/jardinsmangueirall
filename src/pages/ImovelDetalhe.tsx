import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, MessageCircle, Bed, Bath, Car, Maximize, MapPin, DollarSign, PawPrint, Sofa } from "lucide-react";

interface Imovel {
  id: string;
  tipo: string;
  operacao: string;
  endereco: string;
  numero: string | null;
  complemento: string | null;
  bairro: string;
  cep: string | null;
  quartos: number;
  banheiros: number;
  vagas: number;
  area_m2: number | null;
  preco: number;
  condominio: number | null;
  iptu: number | null;
  descricao: string | null;
  mobiliado: boolean;
  aceita_pets: boolean;
  status: string;
  destaque: boolean;
  created_at: string;
}

interface Foto {
  id: string;
  url: string;
  ordem: number;
}

export default function ImovelDetalhe() {
  const { id } = useParams();
  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  useEffect(() => {
    if (id) {
      fetchImovel();
      fetchFotos();
    }
  }, [id]);

  const fetchImovel = async () => {
    try {
      const { data, error } = await supabase
        .from("imoveis")
        .select("*")
        .eq("id", id)
        .eq("status", "aprovado")
        .maybeSingle();

      if (error) throw error;
      setImovel(data as Imovel | null);
    } catch (error) {
      console.error("Error fetching imovel:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFotos = async () => {
    try {
      const { data, error } = await supabase
        .from("imovel_fotos")
        .select("*")
        .eq("imovel_id", id)
        .order("ordem");

      if (error) throw error;
      setFotos((data as Foto[]) || []);
    } catch (error) {
      console.error("Error fetching fotos:", error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const handleWhatsApp = () => {
    if (!imovel) return;
    const message = encodeURIComponent(
      `Olá! Tenho interesse no ${imovel.tipo} para ${imovel.operacao} localizado em ${imovel.endereco}, ${imovel.bairro}. ` +
      `Valor: ${formatPrice(imovel.preco)}. Podemos conversar?`
    );
    window.open(`https://wa.me/5561991647984?text=${message}`, "_blank");
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

  if (!imovel) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center">
          <p className="mb-4 text-muted-foreground">Imóvel não encontrado</p>
          <Button asChild>
            <Link to="/imoveis">Voltar para Imóveis</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${imovel.tipo} para ${imovel.operacao} - Jardins Mangueiral`}</title>
        <meta
          name="description"
          content={`${imovel.tipo} para ${imovel.operacao} em ${imovel.bairro}. ${imovel.quartos} quartos, ${imovel.banheiros} banheiros. ${formatPrice(imovel.preco)}`}
        />
      </Helmet>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 py-8">
          <div className="container px-4">
            <div className="mb-6">
              <Button variant="ghost" asChild>
                <Link to="/imoveis">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Imóveis
                </Link>
              </Button>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Photos */}
              <div className="lg:col-span-2">
                {fotos.length > 0 ? (
                  <div className="space-y-4">
                    <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                      <img
                        src={fotos[selectedPhoto]?.url}
                        alt={`Foto ${selectedPhoto + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {fotos.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {fotos.map((foto, index) => (
                          <button
                            key={foto.id}
                            onClick={() => setSelectedPhoto(index)}
                            className={`flex-shrink-0 overflow-hidden rounded-lg ${
                              index === selectedPhoto
                                ? "ring-2 ring-primary"
                                : ""
                            }`}
                          >
                            <img
                              src={foto.url}
                              alt={`Miniatura ${index + 1}`}
                              className="h-20 w-20 object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
                    <p className="text-muted-foreground">Sem fotos disponíveis</p>
                  </div>
                )}

                {/* Description */}
                {imovel.descricao && (
                  <Card className="mt-8">
                    <CardContent className="p-6">
                      <h2 className="mb-4 text-xl font-semibold">Descrição</h2>
                      <p className="whitespace-pre-wrap text-muted-foreground">
                        {imovel.descricao}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Info */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <Badge className="capitalize">{imovel.operacao}</Badge>
                      <Badge variant="outline" className="capitalize">
                        {imovel.tipo}
                      </Badge>
                      {imovel.destaque && (
                        <Badge variant="secondary">Destaque</Badge>
                      )}
                    </div>

                    <h1 className="mb-2 font-serif text-2xl font-bold capitalize">
                      {imovel.tipo} para {imovel.operacao}
                    </h1>

                    <div className="mb-4 flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {imovel.endereco}
                        {imovel.numero && `, ${imovel.numero}`}
                        {imovel.complemento && ` - ${imovel.complemento}`}
                        <br />
                        {imovel.bairro}
                        {imovel.cep && ` - ${imovel.cep}`}
                      </span>
                    </div>

                    <p className="text-3xl font-bold text-primary">
                      {formatPrice(imovel.preco)}
                      {imovel.operacao === "aluguel" && (
                        <span className="text-sm font-normal text-muted-foreground">
                          /mês
                        </span>
                      )}
                    </p>

                    {(imovel.condominio || imovel.iptu) && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        {imovel.condominio && (
                          <p>Condomínio: {formatPrice(imovel.condominio)}</p>
                        )}
                        {imovel.iptu && <p>IPTU: {formatPrice(imovel.iptu)}</p>}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Features */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="mb-4 text-lg font-semibold">Características</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Bed className="h-5 w-5 text-muted-foreground" />
                        <span>{imovel.quartos} quartos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bath className="h-5 w-5 text-muted-foreground" />
                        <span>{imovel.banheiros} banheiros</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Car className="h-5 w-5 text-muted-foreground" />
                        <span>{imovel.vagas} vagas</span>
                      </div>
                      {imovel.area_m2 && (
                        <div className="flex items-center gap-2">
                          <Maximize className="h-5 w-5 text-muted-foreground" />
                          <span>{imovel.area_m2} m²</span>
                        </div>
                      )}
                      {imovel.mobiliado && (
                        <div className="flex items-center gap-2">
                          <Sofa className="h-5 w-5 text-muted-foreground" />
                          <span>Mobiliado</span>
                        </div>
                      )}
                      {imovel.aceita_pets && (
                        <div className="flex items-center gap-2">
                          <PawPrint className="h-5 w-5 text-muted-foreground" />
                          <span>Aceita pets</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Contact */}
                <Button
                  variant="whatsapp"
                  size="lg"
                  className="w-full"
                  onClick={handleWhatsApp}
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Falar no WhatsApp
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
