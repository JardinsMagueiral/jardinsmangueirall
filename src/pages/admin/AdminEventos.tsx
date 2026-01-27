import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, Trash2, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Evento {
  id: string;
  data: string;
  titulo: string;
  descricao: string | null;
  status: string;
  user_id: string | null;
  created_at: string;
}

export default function AdminEventos() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("eventos")
      .select("*")
      .order("data", { ascending: true });

    if (!error && data) {
      setEventos(data);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, status: "aprovado" | "rejeitado") => {
    setActionLoading(id);
    const { error } = await supabase
      .from("eventos")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive",
      });
    } else {
      toast({
        title: status === "aprovado" ? "Evento aprovado!" : "Evento rejeitado",
        description: status === "aprovado" 
          ? "O evento agora aparece no calendário público" 
          : "O evento foi rejeitado",
      });
      fetchEventos();
    }
    setActionLoading(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return;
    
    setActionLoading(id);
    const { error } = await supabase
      .from("eventos")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o evento",
        variant: "destructive",
      });
    } else {
      toast({ title: "Evento excluído" });
      fetchEventos();
    }
    setActionLoading(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "aprovado":
        return <Badge className="bg-green-500">Aprovado</Badge>;
      case "rejeitado":
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const filterEventos = (status: string) => {
    if (status === "todos") return eventos;
    return eventos.filter((e) => e.status === status);
  };

  const EventoCard = ({ evento }: { evento: Evento }) => (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{evento.titulo}</CardTitle>
            <CardDescription>
              {format(new Date(evento.data + "T12:00:00"), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </CardDescription>
          </div>
          {getStatusBadge(evento.status)}
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          {evento.descricao || "Sem descrição"}
        </p>
        <div className="flex flex-wrap gap-2">
          {evento.status === "pendente" && (
            <>
              <Button
                size="sm"
                onClick={() => handleUpdateStatus(evento.id, "aprovado")}
                disabled={actionLoading === evento.id}
              >
                {actionLoading === evento.id ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-1 h-4 w-4" />
                )}
                Aprovar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUpdateStatus(evento.id, "rejeitado")}
                disabled={actionLoading === evento.id}
              >
                <XCircle className="mr-1 h-4 w-4" />
                Rejeitar
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => handleDelete(evento.id)}
            disabled={actionLoading === evento.id}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Helmet>
        <title>Gerenciar Eventos - Admin</title>
      </Helmet>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 py-8">
          <div className="container px-4">
            <div className="mb-8">
              <h1 className="flex items-center gap-2 font-serif text-3xl font-bold">
                <CalendarDays className="h-8 w-8" />
                Gerenciar Eventos
              </h1>
              <p className="text-muted-foreground">
                Aprove ou rejeite eventos sugeridos pela comunidade
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Tabs defaultValue="pendente">
                <TabsList className="mb-6">
                  <TabsTrigger value="pendente">
                    Pendentes ({filterEventos("pendente").length})
                  </TabsTrigger>
                  <TabsTrigger value="aprovado">
                    Aprovados ({filterEventos("aprovado").length})
                  </TabsTrigger>
                  <TabsTrigger value="rejeitado">
                    Rejeitados ({filterEventos("rejeitado").length})
                  </TabsTrigger>
                  <TabsTrigger value="todos">
                    Todos ({eventos.length})
                  </TabsTrigger>
                </TabsList>

                {["pendente", "aprovado", "rejeitado", "todos"].map((status) => (
                  <TabsContent key={status} value={status}>
                    {filterEventos(status).length === 0 ? (
                      <p className="py-8 text-center text-muted-foreground">
                        Nenhum evento {status === "todos" ? "cadastrado" : status}
                      </p>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filterEventos(status).map((evento) => (
                          <EventoCard key={evento.id} evento={evento} />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
