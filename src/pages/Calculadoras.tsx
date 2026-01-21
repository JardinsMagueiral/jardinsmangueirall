import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calculator,
  Wallet,
  Receipt,
  PiggyBank,
  Home,
  Key,
  TrendingUp,
} from "lucide-react";
import { SimuladorFinanciamento } from "@/components/calculadoras/SimuladorFinanciamento";
import { QuantoPossoFinanciar } from "@/components/calculadoras/QuantoPossoFinanciar";
import { CustoTotalCompra } from "@/components/calculadoras/CustoTotalCompra";
import { EntradaIdeal } from "@/components/calculadoras/EntradaIdeal";
import { ComprarOuAlugar } from "@/components/calculadoras/ComprarOuAlugar";
import { ValorizacaoImovel } from "@/components/calculadoras/ValorizacaoImovel";

const calculadoras = [
  {
    id: "financiamento",
    titulo: "Simulador de Financiamento",
    descricao: "Calcule parcelas, juros e evolução do financiamento",
    icon: Calculator,
  },
  {
    id: "quanto-posso",
    titulo: "Quanto Posso Financiar?",
    descricao: "Descubra seu potencial de financiamento",
    icon: Wallet,
  },
  {
    id: "custo-total",
    titulo: "Custo Total de Compra",
    descricao: "Calcule todos os custos além do preço do imóvel",
    icon: Receipt,
  },
  {
    id: "entrada",
    titulo: "Simulador de Entrada",
    descricao: "Analise a entrada ideal para seu financiamento",
    icon: PiggyBank,
  },
  {
    id: "comprar-alugar",
    titulo: "Comprar ou Alugar?",
    descricao: "Compare as duas opções financeiramente",
    icon: Key,
  },
  {
    id: "valorizacao",
    titulo: "Valorização do Imóvel",
    descricao: "Projete o valor futuro do seu imóvel",
    icon: TrendingUp,
  },
];

export default function Calculadoras() {
  return (
    <>
      <Helmet>
        <title>Calculadoras Financeiras | Jardins Mangueiral</title>
        <meta
          name="description"
          content="Calculadoras financeiras para ajudar você a planejar a compra do seu imóvel. Simule financiamento, custos e mais."
        />
      </Helmet>
      <Header />

      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-secondary/30 to-background py-12">
          <div className="container px-4">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
                <Calculator className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
                Calculadoras Financeiras
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Ferramentas práticas para ajudar você a planejar a compra do seu imóvel
                com segurança e tranquilidade.
              </p>
            </div>
          </div>
        </section>

        {/* Calculadoras */}
        <section className="py-12">
          <div className="container px-4">
            <Tabs defaultValue="financiamento" className="space-y-8">
              {/* Tabs List - Desktop */}
              <div className="hidden lg:block">
                <TabsList className="grid w-full grid-cols-6 h-auto p-1">
                  {calculadoras.map((calc) => (
                    <TabsTrigger
                      key={calc.id}
                      value={calc.id}
                      className="flex flex-col gap-1 py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <calc.icon className="h-5 w-5" />
                      <span className="text-xs font-medium leading-tight text-center">
                        {calc.titulo}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Tabs List - Mobile/Tablet */}
              <div className="lg:hidden">
                <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
                  {calculadoras.map((calc) => (
                    <TabsTrigger
                      key={calc.id}
                      value={calc.id}
                      className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary"
                    >
                      <calc.icon className="h-4 w-4" />
                      <span className="text-sm">{calc.titulo.split(" ")[0]}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Tab Contents */}
              <TabsContent value="financiamento" className="mt-8">
                <Card className="border-none shadow-none bg-transparent">
                  <CardHeader className="px-0">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Calculator className="h-6 w-6 text-primary" />
                      Simulador de Financiamento Imobiliário
                    </CardTitle>
                    <CardDescription>
                      Calcule as parcelas do seu financiamento pelos sistemas SAC e PRICE,
                      veja a evolução das parcelas e o total de juros.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    <SimuladorFinanciamento />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="quanto-posso" className="mt-8">
                <Card className="border-none shadow-none bg-transparent">
                  <CardHeader className="px-0">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Wallet className="h-6 w-6 text-primary" />
                      Quanto Posso Financiar?
                    </CardTitle>
                    <CardDescription>
                      Descubra qual valor de imóvel você pode financiar com base na sua
                      renda mensal familiar.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    <QuantoPossoFinanciar />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="custo-total" className="mt-8">
                <Card className="border-none shadow-none bg-transparent">
                  <CardHeader className="px-0">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Receipt className="h-6 w-6 text-primary" />
                      Custo Total de Compra do Imóvel
                    </CardTitle>
                    <CardDescription>
                      Calcule todos os custos envolvidos na compra além do preço do imóvel:
                      ITBI, escritura, registro e corretagem.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    <CustoTotalCompra />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="entrada" className="mt-8">
                <Card className="border-none shadow-none bg-transparent">
                  <CardHeader className="px-0">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <PiggyBank className="h-6 w-6 text-primary" />
                      Simulador de Entrada Ideal
                    </CardTitle>
                    <CardDescription>
                      Verifique se você tem entrada suficiente e veja como diferentes
                      valores de entrada impactam na parcela.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    <EntradaIdeal />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comprar-alugar" className="mt-8">
                <Card className="border-none shadow-none bg-transparent">
                  <CardHeader className="px-0">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Home className="h-6 w-6 text-primary" />
                      Comprar ou Alugar?
                    </CardTitle>
                    <CardDescription>
                      Compare financeiramente as duas opções e descubra qual é mais
                      vantajosa para o seu caso.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    <ComprarOuAlugar />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="valorizacao" className="mt-8">
                <Card className="border-none shadow-none bg-transparent">
                  <CardHeader className="px-0">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <TrendingUp className="h-6 w-6 text-primary" />
                      Simulador de Valorização do Imóvel
                    </CardTitle>
                    <CardDescription>
                      Projete quanto seu imóvel pode valorizar ao longo dos anos com base
                      em uma taxa de valorização estimada.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    <ValorizacaoImovel />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
