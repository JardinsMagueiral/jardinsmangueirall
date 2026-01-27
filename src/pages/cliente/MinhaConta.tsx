import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Home, Settings, LogOut, Eye, Edit, Trash2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  created_at: string;
}

export default function MinhaConta() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchImoveis();
  }, [user]);

  const fetchImoveis = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("imoveis")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setImoveis((data as Imovel[]) || []);
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
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

  return (
    <>
      <Helmet>
        <title>Minha Conta - Jardins Mangueiral</title>
      </Helmet>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 py-8">
          <div className="container px-4">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="font-serif text-3xl font-bold">Minha Conta</h1>
                <p className="text-muted-foreground">
                  Olá, {profile?.nome || "Usuário"}!
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {isAdmin && (
                  <Button variant="outline" asChild>
                    <Link to="/admin">
                      <Shield className="mr-2 h-4 w-4" />
                      Painel Admin
                    </Link>
                  </Button>
                )}
                <Button asChild>
                  <Link to="/minha-conta/novo-imovel">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Imóvel
                  </Link>
                </Button>
                <Button variant="ghost" onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="mb-8 grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total de Imóveis</CardDescription>
                  <CardTitle className="text-3xl">{imoveis.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Pendentes</CardDescription>
                  <CardTitle className="text-3xl text-yellow-600">
                    {imoveis.filter((i) => i.status === "pendente").length}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Aprovados</CardDescription>
                  <CardTitle className="text-3xl text-green-600">
                    {imoveis.filter((i) => i.status === "aprovado").length}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Rejeitados</CardDescription>
                  <CardTitle className="text-3xl text-red-600">
                    {imoveis.filter((i) => i.status === "rejeitado").length}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Imoveis List */}
            <Card>
              <CardHeader>
                <CardTitle>Meus Imóveis</CardTitle>
                <CardDescription>
                  Gerencie seus imóveis cadastrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : imoveis.length === 0 ? (
                  <div className="py-8 text-center">
                    <Home className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Você ainda não cadastrou nenhum imóvel
                    </p>
                    <Button className="mt-4" asChild>
                      <Link to="/minha-conta/novo-imovel">
                        <Plus className="mr-2 h-4 w-4" />
                        Cadastrar Imóvel
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {imoveis.map((imovel) => (
                      <div
                        key={imovel.id}
                        className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold capitalize">
                              {imovel.tipo} para {imovel.operacao}
                            </h3>
                            {getStatusBadge(imovel.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {imovel.endereco}, {imovel.bairro}
                          </p>
                          <p className="text-lg font-bold text-primary">
                            {formatPrice(imovel.preco)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/imoveis/${imovel.id}`}>
                              <Eye className="mr-1 h-4 w-4" />
                              Ver
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/minha-conta/editar-imovel/${imovel.id}`}>
                              <Edit className="mr-1 h-4 w-4" />
                              Editar
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
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
