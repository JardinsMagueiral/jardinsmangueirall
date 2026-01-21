import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { WhatsAppGroups } from "@/components/WhatsAppGroups";
import { CTASection } from "@/components/CTASection";
import { EventsCalendar } from "@/components/EventsCalendar";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Jardins Mangueiral - Sua Comunidade em Brasília</title>
        <meta 
          name="description" 
          content="Conectando vizinhos e fortalecendo comunidades no Jardins Mangueiral. Encontre imóveis, eventos e serviços locais." 
        />
      </Helmet>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <HeroSection />
          <WhatsAppGroups />
          <CTASection />
          <EventsCalendar />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
