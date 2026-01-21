import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Phone, MapPin, Clock, Calendar } from "lucide-react";

const Contato = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary py-16 text-primary-foreground">
          <div className="container px-4 text-center">
            <Phone className="mx-auto mb-4 h-12 w-12" />
            <h1 className="font-serif text-4xl font-bold md:text-5xl">Fale com a Gente</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg opacity-90">
              Estamos aqui para ajudar você
            </p>
          </div>
        </section>

        {/* Contact Options */}
        <section className="py-16">
          <div className="container px-4">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="text-center">
                <CardHeader>
                  <MessageCircle className="mx-auto mb-2 h-12 w-12 text-whatsapp" />
                  <CardTitle>Vamos Conversar?</CardTitle>
                  <CardDescription>
                    Tire suas dúvidas pelo WhatsApp
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="whatsapp" size="lg" className="w-full" asChild>
                    <a href="https://wa.me/5561991647984" target="_blank" rel="noopener noreferrer">
                      Enviar Mensagem
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Calendar className="mx-auto mb-2 h-12 w-12 text-primary" />
                  <CardTitle>Agende sua Visita</CardTitle>
                  <CardDescription>
                    Conheça os imóveis pessoalmente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button size="lg" className="w-full" asChild>
                    <a 
                      href="https://wa.me/5561991647984?text=Olá! Gostaria de agendar uma visita" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Agendar Agora
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center md:col-span-2 lg:col-span-1">
                <CardHeader>
                  <MapPin className="mx-auto mb-2 h-12 w-12 text-accent" />
                  <CardTitle>Localização</CardTitle>
                  <CardDescription>
                    Jardins Mangueiral, Brasília - DF
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>(61) 99164-7984</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Seg - Sex: 8h às 18h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contato;
