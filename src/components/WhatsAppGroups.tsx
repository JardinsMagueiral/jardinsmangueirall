import { useState, useEffect } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface WhatsAppGrupo {
  id: string;
  titulo: string;
  descricao: string | null;
  link: string;
  ordem: number;
}

export function WhatsAppGroups() {
  const [groups, setGroups] = useState<WhatsAppGrupo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      const { data, error } = await supabase
        .from("whatsapp_grupos")
        .select("*")
        .eq("ativo", true)
        .order("ordem");

      if (!error && data) setGroups(data as WhatsAppGrupo[]);
      setLoading(false);
    };
    fetchGroups();
  }, []);

  if (loading) {
    return (
      <section className="py-16">
        <div className="container px-4 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container px-4">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Entre para a Comunidade
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Conecte-se com seus vizinhos nos nossos grupos do WhatsApp
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {groups.map((group) => (
            <Card key={group.id} className="group transition-all hover:shadow-lg hover:-translate-y-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{group.titulo}</CardTitle>
                <CardDescription>{group.descricao}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="whatsapp" className="w-full" asChild>
                  <a href={group.link} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Entrar no Grupo
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
