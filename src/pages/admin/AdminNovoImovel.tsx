import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ImovelForm } from "@/components/imoveis/ImovelForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AdminNovoImovel() {
  return (
    <>
      <Helmet>
        <title>Cadastrar Imóvel - Admin</title>
      </Helmet>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 py-8">
          <div className="container max-w-3xl px-4">
            <div className="mb-6">
              <Button variant="ghost" asChild>
                <Link to="/admin">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Link>
              </Button>
            </div>
            <div className="mb-8">
              <h1 className="font-serif text-3xl font-bold">Cadastrar Imóvel</h1>
              <p className="text-muted-foreground">
                Imóveis cadastrados pelo admin vão diretamente para a listagem pública.
              </p>
            </div>
            <ImovelForm isAdmin />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
