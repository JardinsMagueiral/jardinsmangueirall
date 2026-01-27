import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ImovelForm } from "@/components/imoveis/ImovelForm";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

interface ExistingPhoto {
  id: string;
  url: string;
}

interface ImovelData {
  id: string;
  tipo: "casa" | "apartamento" | "terreno" | "comercial";
  operacao: "venda" | "aluguel";
  endereco: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  cep?: string;
  quartos: number;
  banheiros: number;
  vagas: number;
  area_m2?: number;
  preco: number;
  condominio?: number;
  iptu?: number;
  descricao?: string;
  mobiliado: boolean;
  aceita_pets: boolean;
}

export default function AdminEditarImovel() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [imovelData, setImovelData] = useState<ImovelData | null>(null);
  const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>([]);

  useEffect(() => {
    if (id) {
      fetchImovelData();
    }
  }, [id]);

  const fetchImovelData = async () => {
    try {
      // Fetch property data
      const { data: imovel, error: imovelError } = await supabase
        .from("imoveis")
        .select("*")
        .eq("id", id)
        .single();

      if (imovelError) throw imovelError;

      // Fetch existing photos
      const { data: fotos, error: fotosError } = await supabase
        .from("imovel_fotos")
        .select("id, url")
        .eq("imovel_id", id)
        .order("ordem");

      if (fotosError) throw fotosError;

      setImovelData({
        id: imovel.id,
        tipo: imovel.tipo as ImovelData["tipo"],
        operacao: imovel.operacao as ImovelData["operacao"],
        endereco: imovel.endereco,
        numero: imovel.numero || undefined,
        complemento: imovel.complemento || undefined,
        bairro: imovel.bairro || "Jardins Mangueiral",
        cep: imovel.cep || undefined,
        quartos: imovel.quartos || 0,
        banheiros: imovel.banheiros || 0,
        vagas: imovel.vagas || 0,
        area_m2: imovel.area_m2 || undefined,
        preco: imovel.preco,
        condominio: imovel.condominio || undefined,
        iptu: imovel.iptu || undefined,
        descricao: imovel.descricao || undefined,
        mobiliado: imovel.mobiliado || false,
        aceita_pets: imovel.aceita_pets || false,
      });

      setExistingPhotos(fotos || []);
    } catch {
      navigate("/admin/imoveis");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    navigate("/admin/imoveis");
  };

  return (
    <>
      <Helmet>
        <title>Editar Imóvel - Admin</title>
      </Helmet>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 py-8">
          <div className="container max-w-4xl px-4">
            <div className="mb-6">
              <Button variant="ghost" asChild>
                <Link to="/admin/imoveis">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Link>
              </Button>
            </div>

            <h1 className="mb-8 font-serif text-3xl font-bold">Editar Imóvel</h1>

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : imovelData ? (
              <ImovelForm
                isAdmin
                initialData={imovelData}
                existingPhotos={existingPhotos}
                onSuccess={handleSuccess}
              />
            ) : (
              <p className="text-center text-muted-foreground">
                Imóvel não encontrado
              </p>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
