import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, CalendarDays, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Evento {
  id: string;
  data: string;
  titulo: string;
  descricao: string | null;
}

export function EventsCalendar() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newEvent, setNewEvent] = useState({ titulo: "", descricao: "" });
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    const { data } = await supabase
      .from("eventos")
      .select("id, data, titulo, descricao")
      .eq("status", "aprovado")
      .order("data", { ascending: true });

    if (data) {
      setEventos(data);
    }
    setLoading(false);
  };

  const eventsOnSelectedDate = eventos.filter(
    (evento) => selectedDate && evento.data === format(selectedDate, "yyyy-MM-dd")
  );

  const datesWithEvents = eventos.map((e) => new Date(e.data + "T12:00:00"));

  const handleSuggestEvent = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para sugerir um evento",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!newEvent.titulo || !selectedDate) {
      toast({
        title: "Preencha os campos",
        description: "Título e data são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("eventos").insert({
      titulo: newEvent.titulo,
      descricao: newEvent.descricao || null,
      data: format(selectedDate, "yyyy-MM-dd"),
      user_id: user.id,
      status: "pendente",
    });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o evento",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Evento enviado!",
        description: "Sua sugestão foi enviada para aprovação",
      });
      setNewEvent({ titulo: "", descricao: "" });
      setIsDialogOpen(false);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <section className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </section>
    );
  }

  return (
    <section className="bg-muted/50 py-16">
      <div className="container px-4">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Calendário de Eventos
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Fique por dentro dos eventos da comunidade
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <CardHeader className="bg-primary text-primary-foreground">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Calendário
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={ptBR}
                modifiers={{ hasEvent: datesWithEvents }}
                modifiersStyles={{
                  hasEvent: {
                    backgroundColor: "hsl(var(--accent))",
                    color: "hsl(var(--accent-foreground))",
                    fontWeight: "bold",
                  },
                }}
                className="rounded-md"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedDate
                      ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                      : "Selecione uma data"}
                  </CardTitle>
                  <CardDescription>
                    {eventsOnSelectedDate.length > 0
                      ? `${eventsOnSelectedDate.length} evento(s)`
                      : "Nenhum evento nesta data"}
                  </CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-1 h-4 w-4" />
                      Sugerir Evento
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Sugerir Novo Evento</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <p className="text-sm text-muted-foreground">
                        Data selecionada:{" "}
                        <strong>
                          {selectedDate
                            ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR })
                            : "Nenhuma"}
                        </strong>
                      </p>
                      <div>
                        <label className="text-sm font-medium">Título *</label>
                        <Input
                          value={newEvent.titulo}
                          onChange={(e) => setNewEvent({ ...newEvent, titulo: e.target.value })}
                          placeholder="Nome do evento"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Descrição</label>
                        <Textarea
                          value={newEvent.descricao}
                          onChange={(e) => setNewEvent({ ...newEvent, descricao: e.target.value })}
                          placeholder="Detalhes do evento (opcional)"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Seu evento será enviado para aprovação antes de aparecer no calendário.
                      </p>
                      <Button 
                        onClick={handleSuggestEvent} 
                        className="w-full"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Enviar para Aprovação
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {eventsOnSelectedDate.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    Nenhum evento agendado para este dia.
                  </p>
                ) : (
                  eventsOnSelectedDate.map((evento) => (
                    <div
                      key={evento.id}
                      className="rounded-lg border bg-card p-4 transition-all hover:shadow-md"
                    >
                      <h4 className="font-semibold text-foreground">{evento.titulo}</h4>
                      <p className="text-sm text-muted-foreground">
                        {evento.descricao || "Sem descrição"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
