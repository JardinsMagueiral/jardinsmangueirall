import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, ArrowLeft, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  created_at: string;
  imoveis_count: number;
}

export default function AdminClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      // Buscar todos os profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      if (!profiles || profiles.length === 0) {
        setClientes([]);
        return;
      }

      // Buscar contagem de imóveis por usuário
      const { data: imoveis } = await supabase
        .from("imoveis")
        .select("user_id");

      // Combinar dados
      const clientesComContagem = profiles.map((profile) => ({
        id: profile.id,
        nome: profile.nome,
        email: profile.email,
        telefone: profile.telefone,
        created_at: profile.created_at,
        imoveis_count: imoveis?.filter((i) => i.user_id === profile.id).length || 0,
      }));

      setClientes(clientesComContagem);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Clientes Cadastrados - Admin</title>
      </Helmet>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 py-8">
          <div className="container px-4">
            <div className="mb-6">
              <Button variant="ghost" asChild>
                <Link to="/admin">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Link>
              </Button>
            </div>

            <div className="mb-8">
              <h1 className="flex items-center gap-2 font-serif text-3xl font-bold">
                <Users className="h-8 w-8" />
                Clientes Cadastrados
              </h1>
              <p className="text-muted-foreground">
                {clientes.length} cliente{clientes.length !== 1 ? "s" : ""} encontrado{clientes.length !== 1 ? "s" : ""}
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : clientes.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">Nenhum cliente cadastrado</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead className="text-center">Imóveis</TableHead>
                        <TableHead>Cadastro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientes.map((cliente) => (
                        <TableRow key={cliente.id}>
                          <TableCell className="font-medium">{cliente.nome}</TableCell>
                          <TableCell>{cliente.email}</TableCell>
                          <TableCell>{cliente.telefone}</TableCell>
                          <TableCell className="text-center">{cliente.imoveis_count}</TableCell>
                          <TableCell>
                            {cliente.created_at
                              ? format(new Date(cliente.created_at), "dd/MM/yyyy", { locale: ptBR })
                              : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
