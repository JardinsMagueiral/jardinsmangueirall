import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Building, MessageCircle, Key, Loader2, Bed, Bath, Car, Maximize, Search, Star, DollarSign } from "lucide-react";

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
  destaque: boolean;
  imovel_fotos: { url: string }[];
}

const Imoveis = () => {
  const [searchParams] = useSearchParams();
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipoFilter, setTipoFilter] = useState("all");
  const [operacaoFilter, setOperacaoFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [precoMin, setPrecoMin] = useState(searchParams.get("precoMin") || "");
  const [precoMax, setPrecoMax] = useState(searchParams.get("precoMax") || "");
  const [quartosFilter, setQuartosFilter] = useState(searchParams.get("quartos") || "all");
  const [banheirosFilter, setBanheirosFilter] = useState(searchParams.get("banheiros") || "all");

  useEffect(() => {
    fetchImoveis();
  }, []);

  const fetchImoveis = async () => {
    try {
      const { data, error } = await supabase
        .from("imoveis")
        .select(`
          id,
          tipo,
          operacao,
          endereco,
          bairro,
          preco,
          quartos,
          banheiros,
          vagas,
          area_m2,
          destaque,
          imovel_fotos (url)
        `)
        .eq("status", "aprovado")
        .order("destaque", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setImoveis((data as unknown as Imovel[]) || []);
    } catch (error) {
      console.error("Error fetching imoveis:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const filteredImoveis = imoveis.filter((imovel) => {
    const matchesTipo = tipoFilter === "all" || imovel.tipo === tipoFilter;
    const matchesOperacao = operacaoFilter === "all" || imovel.operacao === operacaoFilter;
    const matchesSearch = searchQuery === "" || 
      imovel.endereco.toLowerCase().includes(searchQuery.toLowerCase()) ||
      imovel.bairro.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrecoMin = !precoMin || imovel.preco >= Number(precoMin);
    const matchesPrecoMax = !precoMax || imovel.preco <= Number(precoMax);
    const matchesQuartos = quartosFilter === "all" || 
      (quartosFilter === "4" ? imovel.quartos >= 4 : imovel.quartos === Number(quartosFilter));
    const matchesBanheiros = banheirosFilter === "all" || 
      (banheirosFilter === "3" ? imovel.banheiros >= 3 : imovel.banheiros === Number(banheirosFilter));
    return matchesTipo && matchesOperacao && matchesSearch && matchesPrecoMin && matchesPrecoMax && matchesQuartos && matchesBanheiros;
  });

  return (
    <>
      <Helmet>
        <title>Imóveis - Jardins Mangueiral</title>
        <meta 
          name="description" 
          content="Encontre casas e apartamentos para compra ou aluguel no Jardins Mangueiral. Anuncie seu imóvel gratuitamente." 
        />
      </Helmet>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          {/* Hero */}
          <section className="bg-primary py-16 text-primary-foreground">
            <div className="container px-4 text-center">
              <Building className="mx-auto mb-4 h-12 w-12" />
              <h1 className="font-serif text-4xl font-bold md:text-5xl">Morar & Viver Aqui</h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg opacity-90">
                Encontre seu lar no Jardins Mangueiral ou anuncie seu imóvel
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/login">
                    <Key className="mr-2 h-5 w-5" />
                    Cadastrar Imóvel
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Filters */}
          <section className="border-b py-6">
            <div className="container px-4">
              <div className="flex flex-col gap-4">
                {/* First row: Search and basic filters */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por endereço ou bairro..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={tipoFilter} onValueChange={setTipoFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="casa">Casa</SelectItem>
                      <SelectItem value="apartamento">Apartamento</SelectItem>
                      <SelectItem value="terreno">Terreno</SelectItem>
                      <SelectItem value="comercial">Comercial</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={operacaoFilter} onValueChange={setOperacaoFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Operação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Venda e Aluguel</SelectItem>
                      <SelectItem value="venda">Venda</SelectItem>
                      <SelectItem value="aluguel">Aluguel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Second row: Price and room filters */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative w-40">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Preço mín."
                      value={precoMin}
                      onChange={(e) => setPrecoMin(e.target.value)}
                      className="pl-10"
                      type="number"
                    />
                  </div>
                  <div className="relative w-40">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Preço máx."
                      value={precoMax}
                      onChange={(e) => setPrecoMax(e.target.value)}
                      className="pl-10"
                      type="number"
                    />
                  </div>
                  <Select value={quartosFilter} onValueChange={setQuartosFilter}>
                    <SelectTrigger className="w-36">
                      <Bed className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Quartos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="1">1 Quarto</SelectItem>
                      <SelectItem value="2">2 Quartos</SelectItem>
                      <SelectItem value="3">3 Quartos</SelectItem>
                      <SelectItem value="4">4+ Quartos</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={banheirosFilter} onValueChange={setBanheirosFilter}>
                    <SelectTrigger className="w-36">
                      <Bath className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Banheiros" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="1">1 Banheiro</SelectItem>
                      <SelectItem value="2">2 Banheiros</SelectItem>
                      <SelectItem value="3">3+ Banheiros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </section>

          {/* Listings */}
          <section className="py-12">
            <div className="container px-4">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredImoveis.length === 0 ? (
                <div className="py-12 text-center">
                  <Building className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Nenhum imóvel encontrado</h3>
                  <p className="text-muted-foreground">
                    Tente ajustar os filtros ou{" "}
                    <Link to="/login" className="text-primary hover:underline">
                      cadastre seu imóvel
                    </Link>
                  </p>
                </div>
              ) : (
                <>
                  <p className="mb-6 text-muted-foreground">
                    {filteredImoveis.length} imóveis encontrados
                  </p>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredImoveis.map((imovel) => (
                      <Link key={imovel.id} to={`/imoveis/${imovel.id}`}>
                        <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                          <div className="relative aspect-video bg-muted">
                            {imovel.imovel_fotos?.[0]?.url ? (
                              <img
                                src={imovel.imovel_fotos[0].url}
                                alt={`${imovel.tipo} em ${imovel.bairro}`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Building className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
                            <div className="absolute left-2 top-2 flex gap-2">
                              <Badge className="capitalize">{imovel.operacao}</Badge>
                              {imovel.destaque && (
                                <Badge variant="secondary">
                                  <Star className="mr-1 h-3 w-3 fill-current" />
                                  Destaque
                                </Badge>
                              )}
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <p className="text-2xl font-bold text-primary">
                              {formatPrice(imovel.preco)}
                              {imovel.operacao === "aluguel" && (
                                <span className="text-sm font-normal text-muted-foreground">
                                  /mês
                                </span>
                              )}
                            </p>
                            <h3 className="mt-1 font-semibold capitalize">{imovel.tipo}</h3>
                            <p className="text-sm text-muted-foreground">
                              {imovel.endereco}, {imovel.bairro}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Bed className="h-4 w-4" />
                                {imovel.quartos}
                              </span>
                              <span className="flex items-center gap-1">
                                <Bath className="h-4 w-4" />
                                {imovel.banheiros}
                              </span>
                              <span className="flex items-center gap-1">
                                <Car className="h-4 w-4" />
                                {imovel.vagas}
                              </span>
                              {imovel.area_m2 && (
                                <span className="flex items-center gap-1">
                                  <Maximize className="h-4 w-4" />
                                  {imovel.area_m2} m²
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-secondary py-16">
            <div className="container px-4 text-center">
              <h2 className="font-serif text-3xl font-bold">Quer anunciar seu imóvel?</h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Crie sua conta gratuitamente e anuncie seu imóvel para milhares de pessoas no Jardins Mangueiral.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button size="lg" asChild>
                  <Link to="/cadastro">
                    <Key className="mr-2 h-5 w-5" />
                    Criar Conta
                  </Link>
                </Button>
                <Button size="lg" variant="whatsapp" asChild>
                  <a
                    href="https://wa.me/5561991647984?text=Olá! Tenho dúvidas sobre como anunciar meu imóvel"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Fale Conosco
                  </a>
                </Button>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Imoveis;
