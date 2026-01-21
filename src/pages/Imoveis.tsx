import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PropertySearch } from "@/components/PropertySearch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, MessageCircle, Home, Key } from "lucide-react";

const Imoveis = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary py-16 text-primary-foreground">
          <div className="container px-4 text-center">
            <Building className="mx-auto mb-4 h-12 w-12" />
            <h1 className="font-serif text-4xl font-bold md:text-5xl">Morar & Viver Aqui</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg opacity-90">
              Encontre seu lar no Jardins Mangueiral ou anuncie seu imóvel
            </p>
          </div>
        </section>

        {/* Search Section */}
        <section className="py-16">
          <div className="container px-4">
            <div className="mx-auto max-w-xl">
              <PropertySearch />
            </div>
          </div>
        </section>

        {/* Options */}
        <section className="bg-secondary py-16">
          <div className="container px-4">
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="text-center">
                <CardHeader>
                  <Home className="mx-auto mb-2 h-12 w-12 text-primary" />
                  <CardTitle className="text-2xl">Imóveis Disponíveis</CardTitle>
                  <CardDescription>
                    Encontre casas e apartamentos para compra ou aluguel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="whatsapp" size="lg" asChild>
                    <a 
                      href="https://chat.whatsapp.com/DGIxINfCoLw8rAt2BKMuoj" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Grupo de Imóveis
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Key className="mx-auto mb-2 h-12 w-12 text-primary" />
                  <CardTitle className="text-2xl">Cadastre seu Imóvel</CardTitle>
                  <CardDescription>
                    Anuncie gratuitamente seu imóvel para venda ou aluguel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button size="lg" asChild>
                    <a 
                      href="https://wa.me/5561981537063?text=Olá! Quero cadastrar meu imóvel no site" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Cadastrar Imóvel
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

export default Imoveis;
