import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PropertySearch } from "./PropertySearch";
import { Button } from "@/components/ui/button";
import { Building, MessageCircle } from "lucide-react";
import heroBg1 from "@/assets/hero-bg.jpg";
import heroBg2 from "@/assets/hero-bg-2.jpg";
import heroBg3 from "@/assets/hero-bg-3.png";

const heroImages = [heroBg1, heroBg2, heroBg3];

export function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 8000); // 8 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[90vh] overflow-hidden">
      {/* Background Images with transition */}
      {heroImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            index === currentImage ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${image})` }}
        />
      ))}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/40 to-background" />

      {/* Content */}
      <div className="container relative z-10 px-4 py-16 md:py-24">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left Side - Text */}
          <div className="text-center lg:text-left">
            <h1 className="font-serif text-4xl font-bold text-primary-foreground md:text-5xl lg:text-6xl">
              Bem-vindo ao
              <span className="block text-accent-foreground">Jardins Mangueiral</span>
            </h1>
            <p className="mt-6 text-lg text-primary-foreground/90 md:text-xl">
              Sua comunidade no coração de Brasília. Conectamos vizinhos, 
              fortalecemos laços e construímos um bairro melhor juntos.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/minha-conta/novo-imovel">
                  <Building className="mr-2 h-5 w-5" />
                  Cadastre seu Imóvel
                </Link>
              </Button>
              <Button size="lg" variant="whatsapp" asChild>
                <a href="https://wa.me/5561991647984" target="_blank">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Fale Conosco
                </a>
              </Button>
            </div>
          </div>

          {/* Right Side - Search Form */}
          <div className="mx-auto w-full max-w-md lg:max-w-none">
            <PropertySearch />
          </div>
        </div>
      </div>
    </section>
  );
}
