import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, CalendarDays, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Event {
  id: string;
  date: Date;
  title: string;
  description: string;
}

const initialEvents: Event[] = [
  { id: "1", date: new Date(2025, 0, 25), title: "Feira Comunitária", description: "Feira de produtos locais na praça principal" },
  { id: "2", date: new Date(2025, 0, 28), title: "Reunião de Moradores", description: "Discussão sobre melhorias no bairro" },
  { id: "3", date: new Date(2025, 1, 1), title: "Festival de Verão", description: "Música ao vivo e comidas típicas" },
];

export function EventsCalendar() {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState({ title: "", description: "" });

  const eventsOnSelectedDate = events.filter(
    (event) => selectedDate && format(event.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  );

  const datesWithEvents = events.map((e) => e.date);

  const handleAddEvent = () => {
    if (newEvent.title && selectedDate) {
      if (editingEvent) {
        setEvents(events.map((e) => 
          e.id === editingEvent.id 
            ? { ...e, title: newEvent.title, description: newEvent.description }
            : e
        ));
      } else {
        setEvents([
          ...events,
          {
            id: Date.now().toString(),
            date: selectedDate,
            title: newEvent.title,
            description: newEvent.description,
          },
        ]);
      }
      setNewEvent({ title: "", description: "" });
      setEditingEvent(null);
      setIsDialogOpen(false);
    }
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setNewEvent({ title: event.title, description: event.description });
    setIsDialogOpen(true);
  };

  return (
    <section className="py-16 bg-muted/50">
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
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) {
                    setEditingEvent(null);
                    setNewEvent({ title: "", description: "" });
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-1 h-4 w-4" />
                      Adicionar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingEvent ? "Editar Evento" : "Novo Evento"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="text-sm font-medium">Título</label>
                        <Input
                          value={newEvent.title}
                          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                          placeholder="Nome do evento"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Descrição</label>
                        <Textarea
                          value={newEvent.description}
                          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                          placeholder="Detalhes do evento"
                        />
                      </div>
                      <Button onClick={handleAddEvent} className="w-full">
                        {editingEvent ? "Salvar Alterações" : "Adicionar Evento"}
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
                  eventsOnSelectedDate.map((event) => (
                    <div
                      key={event.id}
                      className="group rounded-lg border bg-card p-4 transition-all hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditEvent(event)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
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
