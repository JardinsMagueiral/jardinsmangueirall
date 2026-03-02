import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Search, MessageCircle, Tag, ArrowUpDown } from "lucide-react";

interface Classificado {
  id: string;
  titulo: string;
  descricao: string | null;
  preco: number;
  categoria: string;
  contato_whatsapp: string;
  created_at: string;
  foto_url?: string;
}

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

export default function Classificados() {
  const { user } = useAuth();
  const [classificados, setClassificados] = useState<Classificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("recent");

  useEffect(() => {
    fetchClassificados();
  }, []);

  const fetchClassificados = async () => {
    try {
      const { data, error } = await supabase
        .from("classificados")
        .select("*")
        .eq("status", "aprovado")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch first photo for each classificado
      const withPhotos = await Promise.all(
        (data || []).map(async (item) => {
          const { data: fotos } = await supabase
            .from("classificado_fotos")
            .select("url")
            .eq("classificado_id", item.id)
            .order("ordem")
            .limit(1);

          return {
            ...item,
            foto_url: fotos?.[0]?.url,
          };
        })
      );

      setClassificados(withPhotos);
    } catch (error) {
      console.error("Error fetching classificados:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const filtered = classificados
    .filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.descricao?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategoria =
        categoriaFilter === "all" || item.categoria === categoriaFilter;
      return matchesSearch && matchesCategoria;
    })
    .sort((a, b) => {
      if (sortOrder === "price_asc") return a.preco - b.preco;
      if (sortOrder === "price_desc") return b.preco - a.preco;
      return 0;
    });

  return (
    <>
      <Helmet>
        <title>Desapegos - Jardins Mangueiral</title>
        <meta name="description" content="Compre e venda itens na comunidade Jardins Mangueiral. Classificados locais para moradores." />
      </Helmet>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          {/* Hero */}
          <section className="bg-primary/5 py-12">
            <div className="container px-4 text-center">
              <Tag className="mx-auto mb-4 h-10 w-10 text-primary" />
              <h1 className="font-serif text-3xl font-bold md:text-4xl">
                Desapegos
              </h1>
              <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
                Compre e venda itens com seus vizinhos do Jardins Mangueiral
              </p>
              {user && (
                <Button className="mt-6" asChild>
                  <Link to="/classificados/novo">
                    <Plus className="mr-2 h-4 w-4" />
                    Anunciar Item
                  </Link>
                </Button>
              )}
              {!user && (
                <Button className="mt-6" variant="outline" asChild>
                  <Link to="/login">
                    Faça login para anunciar
                  </Link>
                </Button>
              )}
            </div>
          </section>

          {/* Filters */}
          <section className="border-b py-4">
            <div className="container flex flex-col gap-3 px-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {CATEGORIAS.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-full sm:w-48">
                  <ArrowUpDown className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Mais Recentes</SelectItem>
                  <SelectItem value="price_asc">Menor Preço</SelectItem>
                  <SelectItem value="price_desc">Maior Preço</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          {/* Listings */}
          <section className="py-8">
            <div className="container px-4">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-12 text-center">
                  <Tag className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-lg font-medium text-muted-foreground">
                    Nenhum anúncio encontrado
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Seja o primeiro a anunciar!
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {filtered.map((item) => (
                    <Link key={item.id} to={`/classificados/${item.id}`}>
                      <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
                        <div className="aspect-square overflow-hidden bg-muted">
                          {item.foto_url ? (
                            <img
                              src={item.foto_url}
                              alt={item.titulo}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Tag className="h-12 w-12 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <p className="text-lg font-bold text-primary">
                            {formatPrice(item.preco)}
                          </p>
                          <h3 className="mt-1 line-clamp-2 font-medium">
                            {item.titulo}
                          </h3>
                          <Badge variant="secondary" className="mt-2">
                            {item.categoria}
                          </Badge>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
