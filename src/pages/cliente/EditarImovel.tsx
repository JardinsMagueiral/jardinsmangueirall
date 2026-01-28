import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ImovelForm } from "@/components/imoveis/ImovelForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";

interface Imovel {
  id: string;
  tipo: "casa" | "apartamento" | "terreno" | "comercial";
  operacao: "venda" | "aluguel";
  endereco: string;
  numero: string | null;
  complemento: string | null;
  bairro: string;
  cep: string | null;
  quartos: number;
  banheiros: number;
  vagas: number;
  area_m2: number | null;
  preco: number;
  condominio: number | null;
  iptu: number | null;
  descricao: string | null;
  mobiliado: boolean;
  aceita_pets: boolean;
  status: string;
  user_id: string;
}

interface Foto {
  id: string;
  url: string;
  ordem: number;
}

export default function EditarImovel() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id && user) {
      fetchImovel();
    }
  }, [id, user]);

  const fetchImovel = async () => {
    try {
      // Buscar imóvel que pertence ao usuário logado
      const { data, error } = await supabase
        .from("imoveis")
        .select("*")
        .eq("id", id)
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        setNotFound(true);
        return;
      }

      setImovel(data as Imovel);

      // Buscar fotos do imóvel
      const { data: fotosData } = await supabase
        .from("imovel_fotos")
        .select("*")
        .eq("imovel_id", id)
        .order("ordem");

      setFotos((fotosData as Foto[]) || []);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const canEdit = imovel && imovel.status !== "aprovado";

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center p-4">
          <AlertCircle className="mb-4 h-16 w-16 text-destructive" />
          <h1 className="mb-2 text-xl font-semibold">Imóvel não encontrado</h1>
          <p className="mb-4 text-muted-foreground">
            O imóvel não existe ou você não tem permissão para acessá-lo.
          </p>
          <Button asChild>
            <Link to="/minha-conta">Voltar para Minha Conta</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  // Imóvel aprovado - não pode editar
  if (!canEdit) {
    return (
      <>
        <Helmet>
          <title>Imóvel Aprovado - Jardins Mangueiral</title>
        </Helmet>
        <div className="flex min-h-screen flex-col bg-background">
          <Header />
          <main className="flex flex-1 items-center justify-center p-4">
            <Card className="max-w-md">
              <CardContent className="p-6 text-center">
                <CheckCircle className="mx-auto mb-4 h-16 w-16 text-primary" />
                <h1 className="mb-2 text-xl font-semibold">
                  Imóvel Aprovado
                </h1>
                <p className="mb-4 text-muted-foreground">
                  Este imóvel já foi aprovado e está publicado. Após a aprovação, 
                  apenas a administração pode fazer alterações.
                </p>
                <p className="mb-6 text-sm text-muted-foreground">
                  Entre em contato conosco pelo WhatsApp se precisar de alterações.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <Button variant="outline" asChild>
                    <Link to="/minha-conta">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Voltar
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link to={`/imoveis/${id}`}>Ver Imóvel</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Editar Imóvel - Jardins Mangueiral</title>
      </Helmet>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 py-8">
          <div className="container px-4">
            <div className="mb-6">
              <Button variant="ghost" asChild>
                <Link to="/minha-conta">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Minha Conta
                </Link>
              </Button>
            </div>

            <div className="mb-6">
              <h1 className="font-serif text-3xl font-bold">Editar Imóvel</h1>
              <p className="text-muted-foreground">
                Atualize as informações do seu imóvel. Ele será revisado novamente após as alterações.
              </p>
            </div>

            <ImovelForm 
              initialData={imovel} 
              existingPhotos={fotos}
            />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
