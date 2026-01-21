import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Handshake, Wrench, Building2, UserPlus, MessageCircle } from "lucide-react";

const Parceiros = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary py-16 text-primary-foreground">
          <div className="container px-4 text-center">
            <Handshake className="mx-auto mb-4 h-12 w-12" />
            <h1 className="font-serif text-4xl font-bold md:text-5xl">Rede de Confiança</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg opacity-90">
              Prestadores de serviços e empresas parceiras da comunidade
            </p>
          </div>
        </section>

        {/* Options */}
        <section className="py-16">
          <div className="container px-4">
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="text-center transition-all hover:shadow-lg">
                <CardHeader>
                  <Wrench className="mx-auto mb-2 h-12 w-12 text-primary" />
                  <CardTitle>Prestadores de Serviços</CardTitle>
                  <CardDescription>
                    Eletricistas, encanadores, diaristas e mais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="whatsapp" size="lg" className="w-full" asChild>
                    <a 
                      href="https://wa.me/5561981537063?text=Olá! Procuro um prestador de serviço" 
                      target="_blank"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Solicitar Indicação
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center transition-all hover:shadow-lg">
                <CardHeader>
                  <Building2 className="mx-auto mb-2 h-12 w-12 text-primary" />
                  <CardTitle>Empresas Parceiras</CardTitle>
                  <CardDescription>
                    Lojas e empresas da região com descontos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="whatsapp" size="lg" className="w-full" asChild>
                    <a 
                      href="https://wa.me/5561981537063?text=Olá! Quero conhecer as empresas parceiras" 
                      target="_blank"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Ver Parceiros
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center transition-all hover:shadow-lg">
                <CardHeader>
                  <UserPlus className="mx-auto mb-2 h-12 w-12 text-primary" />
                  <CardTitle>Indique um Profissional</CardTitle>
                  <CardDescription>
                    Conhece alguém de confiança? Indique!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button size="lg" className="w-full" asChild>
                    <a 
                      href="https://wa.me/5561981537063?text=Olá! Quero indicar um profissional" 
                      target="_blank"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Indicar Agora
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center transition-all hover:shadow-lg bg-secondary">
                <CardHeader>
                  <Handshake className="mx-auto mb-2 h-12 w-12 text-primary" />
                  <CardTitle>Quero Ser Parceiro</CardTitle>
                  <CardDescription>
                    Divulgue seu negócio para a comunidade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="lg" className="w-full" asChild>
                    <a 
                      href="https://wa.me/5561981537063?text=Olá! Quero ser parceiro do Jardins Mangueiral" 
                      target="_blank"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Seja Parceiro
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

export default Parceiros;
