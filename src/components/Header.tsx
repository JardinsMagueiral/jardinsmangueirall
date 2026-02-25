import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Home, Users, Building, Handshake, MessageCircle, Phone, Calendar, User, LogIn, Calculator, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
const menuItems = [{
  label: "Início",
  href: "/",
  icon: Home
}, {
  label: "Quem Somos",
  href: "/quem-somos",
  icon: Users
}, {
  label: "Morar & Viver",
  href: "/imoveis",
  icon: Building
}, {
  label: "Comunidade",
  href: "/comunidade",
  icon: Users
}, {
  label: "Parceiros e Indicações",
  href: "/parceiros",
  icon: Handshake
}, {
  label: "Grupos WhatsApp",
  href: "/grupos",
  icon: MessageCircle
}, {
  label: "Eventos",
  href: "/eventos",
  icon: Calendar
}, {
  label: "Calculadoras",
  href: "/calculadoras",
  icon: Calculator
}, {
  label: "Trocas e Vendas",
  href: "/classificados",
  icon: Tag
}, {
  label: "Contato",
  href: "/contato",
  icon: Phone
}];
export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, loading } = useAuth();
  
  return <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img alt="Jardins Mangueiral" className="h-12 w-12 object-contain" src="/lovable-uploads/5288ff73-1738-4c5f-9783-38b14fcf30d4.png" />
          <span className="hidden font-serif text-lg font-semibold text-primary sm:inline-block">
            Jardins Mangueiral
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {menuItems.map(item => <Link key={item.href} to={item.href} className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-primary">
              {item.label}
            </Link>)}
        </nav>

        <div className="flex items-center gap-2">
          {!loading && (
            user ? (
              <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
                <Link to="/minha-conta">
                  <User className="mr-2 h-4 w-4" />
                  {profile?.nome?.split(' ')[0] || "Minha Conta"}
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
                <Link to="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Entrar
                </Link>
              </Button>
            )
          )}
          <Button variant="whatsapp" size="sm" className="hidden sm:flex" asChild>
            <a href="https://wa.me/5561991647984" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" />
              Fale Conosco
            </a>
          </Button>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <ScrollArea className="h-full px-6">
                <div className="flex flex-col gap-4 pt-8 pb-8">
                  <Link to="/" className="flex items-center gap-2 pb-4" onClick={() => setIsOpen(false)}>
                    <img alt="Jardins Mangueiral" className="h-10 w-10 object-contain" src="/lovable-uploads/adaf769f-f696-4e5f-a43f-518d301799d2.png" />
                    <span className="font-serif text-lg font-semibold text-primary">
                      Jardins Mangueiral
                    </span>
                  </Link>
                  {menuItems.map(item => <Link key={item.href} to={item.href} onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground/80 transition-colors hover:bg-secondary hover:text-primary">
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>)}
                  {!loading && (
                    user ? (
                      <Button variant="outline" className="mt-4" asChild>
                        <Link to="/minha-conta" onClick={() => setIsOpen(false)}>
                          <User className="mr-2 h-4 w-4" />
                          {profile?.nome?.split(' ')[0] || "Minha Conta"}
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="outline" className="mt-4" asChild>
                        <Link to="/login" onClick={() => setIsOpen(false)}>
                          <LogIn className="mr-2 h-4 w-4" />
                          Entrar
                        </Link>
                      </Button>
                    )
                  )}
                  <Button variant="whatsapp" className="mt-2" asChild>
                    <a href="https://wa.me/5561991647984" target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Fale Conosco
                    </a>
                  </Button>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>;
}