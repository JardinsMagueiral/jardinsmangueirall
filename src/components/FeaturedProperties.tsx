import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bed, Bath, Car, Maximize, ArrowRight } from "lucide-react";

interface Imovel {
  id: string;
  tipo: string;
  operacao: string;
  endereco: string;
  bairro: string;
  preco: number;
  quartos: number;
  banheiros: number;
  vagas: number;
  area_m2: number | null;
  fotoUrl?: string;
}

export function FeaturedProperties() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
    try {
      // Fetch featured and approved properties
      const { data: imoveisData, error: imoveisError } = await supabase
        .from("imoveis")
        .select("id, tipo, operacao, endereco, bairro, preco, quartos, banheiros, vagas, area_m2")
        .eq("status", "aprovado")
        .eq("destaque", true)
        .limit(6);

      if (imoveisError) throw imoveisError;

      if (!imoveisData || imoveisData.length === 0) {
        setImoveis([]);
        setLoading(false);
        return;
      }

      // Fetch first photo for each property
      const { data: fotosData } = await supabase
        .from("imovel_fotos")
        .select("imovel_id, url")
        .in("imovel_id", imoveisData.map(i => i.id))
        .order("ordem");

      // Map photos to properties (use first photo for each)
      const fotosMap = new Map<string, string>();
      fotosData?.forEach(foto => {
        if (!fotosMap.has(foto.imovel_id)) {
          fotosMap.set(foto.imovel_id, foto.url);
        }
      });

      const imoveisComFotos = imoveisData.map(imovel => ({
        ...imovel,
        fotoUrl: fotosMap.get(imovel.id),
      }));

      setImoveis(imoveisComFotos);
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Don't render section if no featured properties
  if (!loading && imoveis.length === 0) {
    return null;
  }

  return (
    <section className="bg-muted/50 py-16">
      <div className="container px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-3xl font-bold text-foreground">
              Imóveis em Destaque
            </h2>
            <p className="mt-2 text-muted-foreground">
              Confira as melhores oportunidades do Jardins Mangueiral
            </p>
          </div>
          <Button variant="outline" asChild className="hidden md:flex">
            <Link to="/imoveis">
              Ver Todos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full" />
                <CardContent className="p-4">
                  <Skeleton className="mb-2 h-4 w-20" />
                  <Skeleton className="mb-2 h-6 w-32" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {imoveis.map((imovel) => (
              <Link key={imovel.id} to={`/imoveis/${imovel.id}`}>
                <Card className="group overflow-hidden transition-all hover:shadow-lg">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {imovel.fotoUrl ? (
                      <img
                        src={imovel.fotoUrl}
                        alt={`${imovel.tipo} em ${imovel.bairro}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <Maximize className="h-12 w-12" />
                      </div>
                    )}
                    <Badge
                      className="absolute left-3 top-3"
                      variant={imovel.operacao === "venda" ? "default" : "secondary"}
                    >
                      {imovel.operacao === "venda" ? "Venda" : "Aluguel"}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm capitalize text-muted-foreground">
                      {imovel.tipo}
                    </p>
                    <p className="mt-1 text-xl font-bold text-primary">
                      {formatPrice(imovel.preco)}
                      {imovel.operacao === "aluguel" && (
                        <span className="text-sm font-normal text-muted-foreground">
                          /mês
                        </span>
                      )}
                    </p>
                    <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">
                      {imovel.endereco}, {imovel.bairro}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {imovel.quartos > 0 && (
                        <span className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          {imovel.quartos}
                        </span>
                      )}
                      {imovel.banheiros > 0 && (
                        <span className="flex items-center gap-1">
                          <Bath className="h-4 w-4" />
                          {imovel.banheiros}
                        </span>
                      )}
                      {imovel.vagas > 0 && (
                        <span className="flex items-center gap-1">
                          <Car className="h-4 w-4" />
                          {imovel.vagas}
                        </span>
                      )}
                      {imovel.area_m2 && (
                        <span className="flex items-center gap-1">
                          <Maximize className="h-4 w-4" />
                          {imovel.area_m2}m²
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6 text-center md:hidden">
          <Button variant="outline" asChild>
            <Link to="/imoveis">
              Ver Todos os Imóveis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
