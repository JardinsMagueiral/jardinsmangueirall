import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Users, Heart, Target, Sparkles } from "lucide-react";
import logo from "@/assets/logo.png";

const QuemSomos = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary py-20 text-primary-foreground">
          <div className="container px-4 text-center">
            <img src={logo} alt="Jardins Mangueiral" className="mx-auto mb-6 h-24 w-24" />
            <h1 className="font-serif text-4xl font-bold md:text-5xl">Quem Somos</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg opacity-90">
              Nossa história, propósito e por que essa comunidade existe
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="container max-w-4xl px-4">
            <div className="prose prose-lg mx-auto">
              <p className="text-xl text-muted-foreground leading-relaxed">
                O <strong>Jardins Mangueiral</strong> é mais do que um bairro em Brasília - é uma 
                comunidade vibrante onde vizinhos se tornam amigos e juntos construímos um lugar 
                melhor para viver.
              </p>

              <div className="mt-12 grid gap-8 md:grid-cols-2">
                <div className="rounded-2xl bg-secondary p-6">
                  <Heart className="mb-4 h-10 w-10 text-primary" />
                  <h3 className="font-serif text-xl font-semibold">Nossa Missão</h3>
                  <p className="mt-2 text-muted-foreground">
                    Conectar moradores, fortalecer vínculos e criar uma rede de apoio mútuo 
                    que transforma vizinhos em uma verdadeira família.
                  </p>
                </div>

                <div className="rounded-2xl bg-secondary p-6">
                  <Target className="mb-4 h-10 w-10 text-primary" />
                  <h3 className="font-serif text-xl font-semibold">Nossa Visão</h3>
                  <p className="mt-2 text-muted-foreground">
                    Ser a principal plataforma de conexão comunitária do Jardins Mangueiral, 
                    facilitando a vida de todos os moradores.
                  </p>
                </div>

                <div className="rounded-2xl bg-secondary p-6">
                  <Users className="mb-4 h-10 w-10 text-primary" />
                  <h3 className="font-serif text-xl font-semibold">Comunidade</h3>
                  <p className="mt-2 text-muted-foreground">
                    Milhares de moradores conectados através de grupos de WhatsApp, eventos 
                    locais e iniciativas comunitárias.
                  </p>
                </div>

                <div className="rounded-2xl bg-secondary p-6">
                  <Sparkles className="mb-4 h-10 w-10 text-primary" />
                  <h3 className="font-serif text-xl font-semibold">Iniciativa</h3>
                  <p className="mt-2 text-muted-foreground">
                    Projeto idealizado por <strong>Luciana Nepomuceno</strong>, moradora 
                    apaixonada pelo bairro e dedicada à comunidade.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default QuemSomos;
