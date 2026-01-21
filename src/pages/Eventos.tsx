import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EventsCalendar } from "@/components/EventsCalendar";
import { CalendarDays } from "lucide-react";

const Eventos = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary py-16 text-primary-foreground">
          <div className="container px-4 text-center">
            <CalendarDays className="mx-auto mb-4 h-12 w-12" />
            <h1 className="font-serif text-4xl font-bold md:text-5xl">Eventos</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg opacity-90">
              Fique por dentro de tudo que acontece no Jardins Mangueiral
            </p>
          </div>
        </section>

        {/* Calendar */}
        <EventsCalendar />
      </main>
      <Footer />
    </div>
  );
};

export default Eventos;
