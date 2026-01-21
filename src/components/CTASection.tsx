import { Building, MessageCircle, Megaphone, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

const ctas = [
  {
    icon: MessageCircle,
    title: "Entre para a Comunidade",
    description: "Junte-se aos nossos grupos de WhatsApp",
    link: "https://chat.whatsapp.com/GH1XuLDJfKP4be24ullSCD",
    variant: "whatsapp" as const,
  },
  {
    icon: Building,
    title: "Cadastre seu Imóvel",
    description: "Anuncie gratuitamente seu imóvel",
    link: "https://wa.me/5561981537063?text=Olá! Quero cadastrar meu imóvel no site",
    variant: "default" as const,
  },
  {
    icon: Megaphone,
    title: "Divulgue seu Negócio",
    description: "Seja um parceiro local",
    link: "https://wa.me/5561981537063?text=Olá! Quero divulgar meu negócio local",
    variant: "secondary" as const,
  },
  {
    icon: ShoppingBag,
    title: "Anuncie nos Classificados",
    description: "Anuncie gratuitamente",
    link: "https://chat.whatsapp.com/LtNPTADfoSK24EjGsFubsp",
    variant: "outline" as const,
  },
];

export function CTASection() {
  return (
    <section className="bg-secondary py-16">
      <div className="container px-4">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ctas.map((cta) => (
            <div
              key={cta.title}
              className="group rounded-2xl bg-card p-6 text-center shadow-md transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <cta.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">{cta.title}</h3>
              <p className="mb-4 text-sm text-muted-foreground">{cta.description}</p>
              <Button variant={cta.variant} className="w-full" asChild>
                <a href={cta.link} target="_blank" rel="noopener noreferrer">
                  Acessar
                </a>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
