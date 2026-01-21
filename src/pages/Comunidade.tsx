import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, CalendarDays, ShoppingBag, MessageCircle } from "lucide-react";

const Comunidade = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary py-16 text-primary-foreground">
          <div className="container px-4 text-center">
            <MessageCircle className="mx-auto mb-4 h-12 w-12" />
            <h1 className="font-serif text-4xl font-bold md:text-5xl">Comunidade Viva</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg opacity-90">
              Eventos, notícias e classificados da nossa comunidade
            </p>
          </div>
        </section>

        {/* Options */}
        <section className="py-16">
          <div className="container px-4">
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="text-center transition-all hover:shadow-lg">
                <CardHeader>
                  <CalendarDays className="mx-auto mb-2 h-12 w-12 text-primary" />
                  <CardTitle>Eventos Locais</CardTitle>
                  <CardDescription>
                    Feiras, festas e encontros do bairro
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button size="lg" className="w-full" asChild>
                    <a href="/eventos">Ver Eventos</a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center transition-all hover:shadow-lg">
                <CardHeader>
                  <Newspaper className="mx-auto mb-2 h-12 w-12 text-primary" />
                  <CardTitle>Notícias da Região</CardTitle>
                  <CardDescription>
                    Fique por dentro de tudo que acontece
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="whatsapp" size="lg" className="w-full" asChild>
                    <a href="https://chat.whatsapp.com/GH1XuLDJfKP4be24ullSCD" target="_blank">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Grupo Geral
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center transition-all hover:shadow-lg">
                <CardHeader>
                  <ShoppingBag className="mx-auto mb-2 h-12 w-12 text-primary" />
                  <CardTitle>Classificados</CardTitle>
                  <CardDescription>
                    Compre e venda entre vizinhos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="whatsapp" size="lg" className="w-full" asChild>
                    <a href="https://chat.whatsapp.com/LtNPTADfoSK24EjGsFubsp" target="_blank">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Grupo Desapego
                    </a>
                  </Button>
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

export default Comunidade;
