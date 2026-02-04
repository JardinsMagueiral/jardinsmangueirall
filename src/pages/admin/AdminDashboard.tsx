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
import { Loader2, Plus, Home, CheckCircle, XCircle, Clock, Building, CalendarDays, Handshake, Users } from "lucide-react";

interface Stats {
  total: number;
  pendentes: number;
  aprovados: number;
  rejeitados: number;
}

interface ParceiroStats {
  total: number;
  pendentes: number;
}

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats>({ total: 0, pendentes: 0, aprovados: 0, rejeitados: 0 });
  const [parceiroStats, setParceiroStats] = useState<ParceiroStats>({ total: 0, pendentes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchParceiroStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from("imoveis")
        .select("status");

      if (error) throw error;

      const stats = {
        total: data.length,
        pendentes: data.filter((i) => i.status === "pendente").length,
        aprovados: data.filter((i) => i.status === "aprovado").length,
        rejeitados: data.filter((i) => i.status === "rejeitado").length,
      };

      setStats(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParceiroStats = async () => {
    try {
      const { data, error } = await supabase
        .from("parceiros")
        .select("status");

      if (error) throw error;

      setParceiroStats({
        total: data.length,
        pendentes: data.filter((p) => p.status === "pendente").length,
      });
    } catch (error) {
      console.error("Error fetching parceiro stats:", error);
    }
  };

  return (
    <>
      <Helmet>
        <title>Painel Admin - Jardins Mangueiral</title>
      </Helmet>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 py-8">
          <div className="container px-4">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="font-serif text-3xl font-bold">Painel Administrativo</h1>
                <p className="text-muted-foreground">
                  Bem-vindo, {profile?.nome}!
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <Link to="/admin/novo-imovel">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Imóvel
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stats */}
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="mb-8 grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardDescription>Total de Imóveis</CardDescription>
                    <Building className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardDescription>Pendentes</CardDescription>
                    <Clock className="h-5 w-5 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats.pendentes}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardDescription>Aprovados</CardDescription>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats.aprovados}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardDescription>Rejeitados</CardDescription>
                    <XCircle className="h-5 w-5 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats.rejeitados}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Quick Links */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Gerenciar Imóveis
                  </CardTitle>
                  <CardDescription>
                    Aprovar, rejeitar e gerenciar todos os imóveis cadastrados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to="/admin/imoveis">Ver Imóveis</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Gerenciar Eventos
                  </CardTitle>
                  <CardDescription>
                    Aprovar, rejeitar e gerenciar eventos da comunidade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to="/admin/eventos">Ver Eventos</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Handshake className="h-5 w-5" />
                    Gerenciar Parceiros
                  </CardTitle>
                  <CardDescription>
                    Aprovar e gerenciar parceiros da comunidade
                    {parceiroStats.pendentes > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {parceiroStats.pendentes} pendente{parceiroStats.pendentes > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to="/admin/parceiros">Ver Parceiros</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Clientes Cadastrados
                  </CardTitle>
                  <CardDescription>
                    Ver todos os usuários cadastrados no site
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to="/admin/clientes">Ver Clientes</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Cadastrar Imóvel
                  </CardTitle>
                  <CardDescription>
                    Adicionar um novo imóvel diretamente (vai direto para aprovado)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to="/admin/novo-imovel">Cadastrar Imóvel</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
