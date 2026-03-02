import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, CheckCircle, XCircle, ExternalLink, Clock } from "lucide-react";
import { toast } from "sonner";

interface Noticia {
  id: string;
  user_id: string;
  titulo: string;
  descricao: string | null;
  link: string | null;
  status: string;
  created_at: string;
}

export default function AdminNoticias() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchNoticias();
  }, []);

  const fetchNoticias = async () => {
    const { data, error } = await supabase
      .from("noticias")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      toast.error("Erro ao carregar notícias.");
    }
    setNoticias((data as Noticia[]) || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const { error } = await supabase
        .from("noticias")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      toast.success(`Notícia ${status === "aprovado" ? "aprovada" : "rejeitada"}!`);
      setNoticias((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status } : n))
      );
    } catch {
      toast.error("Erro ao atualizar.");
    } finally {
      setUpdating(null);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "aprovado":
        return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>;
      case "rejeitado":
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Gerenciar Notícias - Admin</title>
      </Helmet>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 py-8">
          <div className="container px-4">
            <Button variant="ghost" size="sm" className="mb-4" asChild>
              <Link to="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Painel
              </Link>
            </Button>

            <h1 className="font-serif text-3xl font-bold mb-6">Gerenciar Notícias</h1>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : noticias.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma notícia enviada ainda.
              </p>
            ) : (
              <div className="space-y-4">
                {noticias.map((n) => (
                  <Card key={n.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {statusBadge(n.status)}
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(n.created_at).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          <h3 className="font-semibold">{n.titulo}</h3>
                          {n.descricao && (
                            <p className="text-sm text-muted-foreground mt-1">{n.descricao}</p>
                          )}
                          {n.link && (
                            <a
                              href={n.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {n.link}
                            </a>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          {n.status !== "aprovado" && (
                            <Button
                              size="sm"
                              onClick={() => updateStatus(n.id, "aprovado")}
                              disabled={updating === n.id}
                            >
                              {updating === n.id ? (
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle className="mr-1 h-3 w-3" />
                              )}
                              Aprovar
                            </Button>
                          )}
                          {n.status !== "rejeitado" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateStatus(n.id, "rejeitado")}
                              disabled={updating === n.id}
                            >
                              <XCircle className="mr-1 h-3 w-3" />
                              Rejeitar
                            </Button>
                          )}
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
