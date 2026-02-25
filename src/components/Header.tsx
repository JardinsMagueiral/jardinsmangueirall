import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Menu, Home, Users, Building, Handshake, MessageCircle, Phone, Calendar, User, LogIn, Calculator, Tag, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/contexts/AuthContext";

const quadras = Array.from({ length: 15 }, (_, i) => ({
  numero: i + 1,
  label: `Quadra ${String(i + 1).padStart(2, "0")}`,
  href: `/quadra/${i + 1}`,
}));

const menuItems = [{
  label: "Quem Somos",
  shortLabel: "Quem Somos",
  href: "/quem-somos",
  icon: Users
}, {
  label: "Morar & Viver",
  shortLabel: "Morar & Viver",
  href: "/imoveis",
  icon: Building
}, {
  label: "Comunidade",
  shortLabel: "Comunidade",
  href: "/comunidade",
  icon: Users
}, {
  label: "Parceiros e Indicações",
  shortLabel: "Parceiros",
  href: "/parceiros",
  icon: Handshake
}, {
  label: "Grupos WhatsApp",
  shortLabel: "Grupos",
  href: "/grupos",
  icon: MessageCircle
}, {
  label: "Eventos",
  shortLabel: "Eventos",
  href: "/eventos",
  icon: Calendar
}, {
  label: "Calculadoras",
  shortLabel: "Calculadoras",
  href: "/calculadoras",
  icon: Calculator
}, {
  label: "Trocas e Vendas",
  shortLabel: "Trocas e Vendas",
  href: "/classificados",
  icon: Tag
}, {
  label: "Contato",
  shortLabel: "Contato",
  href: "/contato",
  icon: Phone
}];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [quadrasOpen, setQuadrasOpen] = useState(false);
  const { user, profile, loading } = useAuth();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftRef = useRef(0);

  const hasDragged = useRef(false);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.clientX;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
    scrollRef.current.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 3) hasDragged.current = true;
    scrollRef.current.scrollLeft = scrollLeftRef.current - dx;
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    isDragging.current = false;
    scrollRef.current?.releasePointerCapture(e.pointerId);
  }, []);

  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (hasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);
  
  return <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img alt="Jardins Mangueiral" className="h-12 w-12 object-contain" src="/lovable-uploads/5288ff73-1738-4c5f-9783-38b14fcf30d4.png" />
          <span className="hidden font-serif text-lg font-semibold text-primary sm:inline-block">
            Jardins Mangueiral
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 xl:flex">
          {/* Início Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-primary outline-none">
              <Home className="h-3.5 w-3.5" />
              Início
              <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-50 rounded-xl border-primary/20 bg-card shadow-xl p-0" align="start">
              <div ref={scrollRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onClickCapture={onClickCapture} className="flex flex-row items-center gap-1 bg-primary/10 rounded-xl m-1 p-2 overflow-x-auto cursor-grab active:cursor-grabbing select-none max-w-[80vw]" style={{ scrollbarWidth: 'none' }}>
                <DropdownMenuItem asChild className="shrink-0 rounded-lg px-3 py-2 font-medium focus:bg-primary/20 focus:text-primary">
                  <Link to="/" className="cursor-pointer flex items-center gap-1.5">
                    <Home className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium whitespace-nowrap">Início</span>
                  </Link>
                </DropdownMenuItem>
                {quadras.map((q) => (
                  <DropdownMenuItem key={q.numero} asChild className="shrink-0 rounded-lg px-2.5 py-2 focus:bg-primary/20 focus:text-primary">
                    <Link to={q.href} className="cursor-pointer flex items-center gap-1.5 whitespace-nowrap">
                      <span className="text-sm font-medium">Quadra</span>
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/20 text-xs font-bold text-primary">
                        {String(q.numero).padStart(2, "0")}
                      </span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {menuItems.map(item => <Link key={item.href} to={item.href} className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-primary">
              {item.shortLabel}
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
            <SheetTrigger asChild className="xl:hidden">
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
                  {/* Início Collapsible */}
                  <Collapsible open={quadrasOpen} onOpenChange={setQuadrasOpen}>
                    <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-foreground/80 transition-colors hover:bg-secondary hover:text-primary">
                      <span className="flex items-center gap-3">
                        <Home className="h-5 w-5" />
                        Início
                      </span>
                      <ChevronRight className={`h-4 w-4 transition-transform ${quadrasOpen ? "rotate-90" : ""}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-8 space-y-1 bg-primary/10 rounded-lg p-2 mt-1">
                      <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-primary/20 hover:text-primary">
                        Página Inicial
                      </Link>
                      {quadras.map((q) => (
                        <Link key={q.numero} to={q.href} onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-primary/20 hover:text-primary">
                          {q.label}
                        </Link>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>

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