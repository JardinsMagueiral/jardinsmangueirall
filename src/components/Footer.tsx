import { Link } from "react-router-dom";
import { MessageCircle, Phone, MapPin, Heart, Mail, Instagram } from "lucide-react";
import logo from "@/assets/logo.png";
export function Footer() {
  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="container px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <img
                alt="Jardins Mangueiral"
                className="h-14 w-14 rounded-full bg-card p-1"
                src="/lovable-uploads/d862c185-3b4c-4fcf-9c6f-e06b2d7f734b.png"
              />
              <div>
                <span className="font-serif text-lg font-semibold">Jardins Mangueiral</span>
                <p className="text-sm opacity-80">Luciana Nepomuceno</p>
              </div>
            </Link>
            <p className="mt-4 text-sm opacity-80">Conectando vizinhos, fortalecendo comunidades.</p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Links Rápidos</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <Link to="/quem-somos" className="hover:opacity-100">
                  Quem Somos
                </Link>
              </li>
              <li>
                <Link to="/imoveis" className="hover:opacity-100">
                  Morar & Viver
                </Link>
              </li>
              <li>
                <Link to="/comunidade" className="hover:opacity-100">
                  Comunidade
                </Link>
              </li>
              <li>
                <Link to="/parceiros" className="hover:opacity-100">
                  Parceiros
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Grupos WhatsApp</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <a
                  href="https://chat.whatsapp.com/GH1XuLDJfKP4be24ullSCD"
                  target="_blank"
                  className="hover:opacity-100"
                >
                  Geral 🔊
                </a>
              </li>
              <li>
                <a
                  href="https://chat.whatsapp.com/BoCnDmejx5wGLgTweIk782"
                  target="_blank"
                  className="hover:opacity-100"
                >
                  Carona 🚕
                </a>
              </li>
              <li>
                <a
                  href="https://chat.whatsapp.com/DGIxINfCoLw8rAt2BKMuoj"
                  target="_blank"
                  className="hover:opacity-100"
                >
                  Imóveis 🏡
                </a>
              </li>
              <li>
                <a
                  href="https://chat.whatsapp.com/LtNPTADfoSK24EjGsFubsp"
                  target="_blank"
                  className="hover:opacity-100"
                >
                  Desapego 🛍️
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Contato</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 opacity-80">
                <Phone className="h-4 w-4" />
                <a href="https://wa.me/5561991647984" target="_blank" className="hover:opacity-100">
                  (61) 99164-7984
                </a>
              </li>
              <li className="flex items-center gap-2 opacity-80">
                <Mail className="h-4 w-4" />
                <a href="mailto:luciananepomuceno@jardinsmangueiral.com" className="hover:opacity-100">
                  luciananepomuceno@jardinsmangueiral.com
                </a>
              </li>
              <li className="flex items-center gap-2 opacity-80">
                <Instagram className="h-4 w-4" />
                <a href="https://instagram.com/jardinsmangueiral" target="_blank" className="hover:opacity-100">
                  @jardinsmangueiral
                </a>
              </li>
              <li className="flex items-center gap-2 opacity-80">
                <MapPin className="h-4 w-4" />
                <span>Jardins Mangueiral, DF</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/20 pt-8 text-sm opacity-80 sm:flex-row">
          <p>© 2024 Jardins Mangueiral - Todos os direitos reservados</p>
          <p className="flex items-center gap-1">
            Feito com <Heart className="h-4 w-4 fill-current" /> por Luciana Nepomuceno
          </p>
        </div>
      </div>
    </footer>
  );
}
