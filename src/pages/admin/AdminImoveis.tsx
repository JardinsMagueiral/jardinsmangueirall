import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Check, X, Trash2, Eye, Star, StarOff } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Imovel {
  id: string;
  tipo: string;
  operacao: string;
  endereco: string;
  bairro: string;
  preco: number;
  quartos: number;
  status: string;
  destaque: boolean;
  created_at: string;
  profiles: {
    nome: string;
    email: string;
    telefone: string;
  } | null;
}

export default function AdminImoveis() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    console.log("AdminImoveis mounted, fetching...");
    fetchImoveis();
  }, []);

  const fetchImoveis = async () => {
    try {
      console.log("Fetching imoveis...");

      // Verify current session
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Current session user:", session?.user?.id);

      const { data, error } = await supabase
        .from("imoveis")
        .select(`
          *,
          profiles:user_id (
            nome,
            email,
            telefone
          )
        `)
        .order("created_at", { ascending: false });

      console.log("Imoveis result:", { data, error, count: data?.length });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      setImoveis((data as unknown as Imovel[]) || []);
    } catch (error) {
      console.error("Error fetching imoveis:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("imoveis")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: `Imóvel ${status === "aprovado" ? "aprovado" : "rejeitado"} com sucesso`,
      });

      setImoveis(
        imoveis.map((i) => (i.id === id ? { ...i, status } : i))
      );
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive",
      });
    }
  };

  const toggleDestaque = async (id: string, destaque: boolean) => {
    try {
      const { error } = await supabase
        .from("imoveis")
        .update({ destaque: !destaque })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: destaque ? "Destaque removido" : "Imóvel destacado",
      });

      setImoveis(
        imoveis.map((i) => (i.id === id ? { ...i, destaque: !destaque } : i))
      );
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o destaque",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("imoveis")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Imóvel excluído",
        description: "O imóvel foi removido com sucesso",
      });

      setImoveis(imoveis.filter((i) => i.id !== id));
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o imóvel",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { label: "Pendente", variant: "secondary" as const },
      aprovado: { label: "Aprovado", variant: "default" as const },
      rejeitado: { label: "Rejeitado", variant: "destructive" as const },
      inativo: { label: "Inativo", variant: "outline" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const filteredImoveis = filter === "all" 
    ? imoveis 
    : imoveis.filter((i) => i.status === filter);

  return (
    <>
      <Helmet>
        <title>Gerenciar Imóveis - Admin</title>
      </Helmet>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 py-8">
          <div className="container px-4">
            <div className="mb-6">
              <Button variant="ghost" asChild>
                <Link to="/admin">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Link>
              </Button>
            </div>

            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="font-serif text-3xl font-bold">Gerenciar Imóveis</h1>
                <p className="text-muted-foreground">
                  {filteredImoveis.length} imóveis encontrados
                </p>
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendente">Pendentes</SelectItem>
                  <SelectItem value="aprovado">Aprovados</SelectItem>
                  <SelectItem value="rejeitado">Rejeitados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredImoveis.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">Nenhum imóvel encontrado</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredImoveis.map((imovel) => (
                  <Card key={imovel.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold capitalize">
                              {imovel.tipo} para {imovel.operacao}
                            </h3>
                            {getStatusBadge(imovel.status)}
                            {imovel.destaque && (
                              <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                                <Star className="mr-1 h-3 w-3 fill-current" />
                                Destaque
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {imovel.endereco}, {imovel.bairro}
                          </p>
                          <p className="text-lg font-bold text-primary">
                            {formatPrice(imovel.preco)}
                          </p>
                          {imovel.profiles && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              Anunciante: {imovel.profiles.nome} ({imovel.profiles.telefone})
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {imovel.status === "pendente" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateStatus(imovel.id, "aprovado")}
                              >
                                <Check className="mr-1 h-4 w-4" />
                                Aprovar
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => updateStatus(imovel.id, "rejeitado")}
                              >
                                <X className="mr-1 h-4 w-4" />
                                Rejeitar
                              </Button>
                            </>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleDestaque(imovel.id, imovel.destaque)}
                          >
                            {imovel.destaque ? (
                              <>
                                <StarOff className="mr-1 h-4 w-4" />
                                Remover Destaque
                              </>
                            ) : (
                              <>
                                <Star className="mr-1 h-4 w-4" />
                                Destacar
                              </>
                            )}
                          </Button>

                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/imoveis/${imovel.id}`}>
                              <Eye className="mr-1 h-4 w-4" />
                              Ver
                            </Link>
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="mr-1 h-4 w-4" />
                                Excluir
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir imóvel?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. O imóvel será
                                  permanentemente removido.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(imovel.id)}
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
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
    </>
  );
}
