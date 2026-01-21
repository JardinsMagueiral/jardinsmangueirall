import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const groups = [
  {
    title: "Geral 🔊",
    description: "Grupo principal da comunidade",
    link: "https://chat.whatsapp.com/GH1XuLDJfKP4be24ullSCD",
  },
  {
    title: "Geral 2 🔊",
    description: "Segundo grupo geral",
    link: "https://chat.whatsapp.com/DrIx3XxBW8h2CuqQSj0q1F",
  },
  {
    title: "Carona 🚕",
    description: "Encontre ou ofereça caronas",
    link: "https://chat.whatsapp.com/BoCnDmejx5wGLgTweIk782",
  },
  {
    title: "Imóveis 🏡",
    description: "Compra, venda e aluguel",
    link: "https://chat.whatsapp.com/DGIxINfCoLw8rAt2BKMuoj",
  },
  {
    title: "Desapego 🛍️",
    description: "Classificados da comunidade",
    link: "https://chat.whatsapp.com/LtNPTADfoSK24EjGsFubsp",
  },
];

export function WhatsAppGroups() {
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
            <Card key={group.link} className="group transition-all hover:shadow-lg hover:-translate-y-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{group.title}</CardTitle>
                <CardDescription>{group.description}</CardDescription>
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
