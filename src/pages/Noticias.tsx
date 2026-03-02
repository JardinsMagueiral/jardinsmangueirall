import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Newspaper, Send, ExternalLink, MessageCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Noticia {
  id: string;
  titulo: string;
  descricao: string | null;
  link: string | null;
  status: string;
  created_at: string;
}

const NOTICIAS_EXTERNAS = [
  {
    titulo: "Ibaneis inaugura escola no Jardins Mangueiral",
    fonte: "Metrópoles",
    link: "https://www.metropoles.com/distrito-federal/ibaneis-inaugura-escola-no-jardins-mangueiral",
  },
  {
    titulo: "Jardim Mangueiral ganha nova escola pública com capacidade para 1.000 alunos",
    fonte: "R7",
    link: "https://noticias.r7.com/brasilia/jardim-mangueiral-ganha-nova-escola-publica-com-capacidade-para-1000-alunos",
  },
  {
    titulo: "GDF inaugura escola nos Jardins Mangueiral com capacidade para 700 alunos por turno",
    fonte: "R7",
    link: "https://noticias.r7.com/brasilia/gdf-inaugura-escola-nos-jardins-mangueiral",
  },
  {
    titulo: "Jardins Mangueiral, um bairro em transformação",
    fonte: "Instagram",
    link: "https://www.instagram.com/aderivaldo_cardoso/",
  },
  {
    titulo: "Novidades para o Jardim Botânico e Jardins Mangueiral",
    fonte: "Facebook",
    link: "https://www.facebook.com/saosebastiaonoticias/",
  },
  {
    titulo: "CEF 01 do Jardins Mangueiral inaugurado",
    fonte: "Instagram",
    link: "https://www.instagram.com/cre_sao_sebastiao/",
  },
  {
    titulo: "Nova escola do loteamento Breno Garcia",
    fonte: "Instagram",
    link: "https://www.instagram.com/sop_rs/",
  },
  {
    titulo: "Gangue de pichação volta a agir no Mangueiral",
    fonte: "Facebook",
    link: "https://www.facebook.com/jornalmangueiral/",
  },
];

export default function Noticias() {
  const { user } = useAuth();
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [link, setLink] = useState("");

  useEffect(() => {
    fetchNoticias();
  }, []);

  const fetchNoticias = async () => {
    try {
      const { data, error } = await supabase
        .from("noticias")
        .select("*")
        .eq("status", "aprovado")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNoticias(data || []);
    } catch (error) {
      console.error("Error fetching noticias:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const trimmedTitulo = titulo.trim();
    const trimmedDescricao = descricao.trim();
    if (!trimmedTitulo) {
      toast.error("Informe o título da notícia.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("noticias").insert({
        user_id: user.id,
        titulo: trimmedTitulo,
        descricao: trimmedDescricao || null,
        link: link.trim() || null,
      });
      if (error) throw error;
      toast.success("Notícia enviada! Aguarde aprovação do administrador.");
      setTitulo("");
      setDescricao("");
      setLink("");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar notícia.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Notícias - Jardins Mangueiral</title>
        <meta name="description" content="Notícias e novidades da comunidade Jardins Mangueiral. Fique por dentro de tudo." />
      </Helmet>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          {/* Hero */}
          <section className="bg-primary py-16 text-primary-foreground">
            <div className="container px-4 text-center">
              <Newspaper className="mx-auto mb-4 h-12 w-12" />
              <h1 className="font-serif text-4xl font-bold md:text-5xl">Notícias</h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg opacity-90">
                Novidades e informações da comunidade Jardins Mangueiral
              </p>
            </div>
          </section>

          {/* Submit Form */}
          <section className="border-b py-8">
            <div className="container px-4">
              {user ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Send className="h-5 w-5" />
                      Enviar uma Notícia
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="titulo">Título *</Label>
                        <Input
                          id="titulo"
                          value={titulo}
                          onChange={(e) => setTitulo(e.target.value)}
                          placeholder="Título da notícia"
                          maxLength={200}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="descricao">Descrição</Label>
                        <Textarea
                          id="descricao"
                          value={descricao}
                          onChange={(e) => setDescricao(e.target.value)}
                          placeholder="Detalhes da notícia..."
                          maxLength={1000}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="link">Link (opcional)</Label>
                        <Input
                          id="link"
                          value={link}
                          onChange={(e) => setLink(e.target.value)}
                          placeholder="https://..."
                          type="url"
                        />
                      </div>
                      <Button type="submit" disabled={submitting}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enviar para Aprovação
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground">
                    <Link to="/login" className="text-primary hover:underline font-medium">
                      Faça login
                    </Link>{" "}
                    para enviar uma notícia para a comunidade.
                  </p>
                </Card>
              )}
            </div>
          </section>

          {/* Approved Community News */}
          <section className="py-8">
            <div className="container px-4">
              <h2 className="font-serif text-2xl font-bold mb-6">Notícias da Comunidade</h2>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : noticias.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma notícia aprovada ainda. Seja o primeiro a contribuir!
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {noticias.map((n) => (
                    <Card key={n.id}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{n.titulo}</h3>
                        {n.descricao && (
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                            {n.descricao}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          {n.link && (
                            <a
                              href={n.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Ver mais
                            </a>
                          )}
                          <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                            <Clock className="h-3 w-3" />
                            {new Date(n.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* External News */}
          <section className="bg-secondary/50 py-12">
            <div className="container px-4">
              <h2 className="font-serif text-2xl font-bold mb-6">Notícias da Região</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {NOTICIAS_EXTERNAS.map((n, i) => (
                  <a
                    key={i}
                    href={n.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Card className="h-full transition-shadow hover:shadow-lg">
                      <CardContent className="p-4 flex flex-col justify-between h-full">
                        <h3 className="font-medium text-sm leading-snug line-clamp-3">
                          {n.titulo}
                        </h3>
                        <div className="mt-3 flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">{n.fonte}</Badge>
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* WhatsApp Group */}
          <section className="py-12">
            <div className="container px-4 text-center">
              <h2 className="font-serif text-2xl font-bold mb-4">Fique Conectado</h2>
              <p className="text-muted-foreground mb-6">
                Entre no grupo geral do WhatsApp para receber notícias em tempo real
              </p>
              <Button variant="whatsapp" size="lg" asChild>
                <a
                  href="https://chat.whatsapp.com/GH1XuLDJfKP4be24ullSCD"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Grupo Geral do WhatsApp
                </a>
              </Button>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
