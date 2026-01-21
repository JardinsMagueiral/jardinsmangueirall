import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ImovelForm } from "@/components/imoveis/ImovelForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NovoImovel() {
  return (
    <>
      <Helmet>
        <title>Cadastrar Imóvel - Jardins Mangueiral</title>
      </Helmet>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 py-8">
          <div className="container max-w-3xl px-4">
            <div className="mb-6">
              <Button variant="ghost" asChild>
                <Link to="/minha-conta">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Link>
              </Button>
            </div>
            <div className="mb-8">
              <h1 className="font-serif text-3xl font-bold">Cadastrar Imóvel</h1>
              <p className="text-muted-foreground">
                Preencha os dados do imóvel. Após o cadastro, você será direcionado ao WhatsApp para manter contato.
              </p>
            </div>
            <ImovelForm />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
