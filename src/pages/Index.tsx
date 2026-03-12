import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { FeaturedProperties } from "@/components/FeaturedProperties";
import { WhatsAppGroups } from "@/components/WhatsAppGroups";
import { CTASection } from "@/components/CTASection";
import { EventsCalendar } from "@/components/EventsCalendar";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Jardins Mangueiral - Comunidade, Imóveis e Serviços em Brasília</title>
        <meta 
          name="description" 
          content="Portal da comunidade Jardins Mangueiral em Brasília. Encontre imóveis para venda e aluguel, eventos, parceiros, notícias e grupos de WhatsApp do condomínio." 
        />
        <meta name="keywords" content="Jardins Mangueiral, imóveis Jardins Mangueiral, comunidade Jardins Mangueiral, Brasília, aluguel, venda, condomínio" />
        <link rel="canonical" href="https://jardinsmangueiral.com/" />
      </Helmet>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <HeroSection />
          <FeaturedProperties />
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
