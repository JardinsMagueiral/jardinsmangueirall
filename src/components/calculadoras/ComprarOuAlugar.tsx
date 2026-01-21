import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, Home, Key, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { calcularParcelaPRICE, calcularValorFuturo, formatarMoeda } from "@/lib/calculadoras";

export function ComprarOuAlugar() {
  const [valorAluguel, setValorAluguel] = useState<string>("2500");
  const [valorImovel, setValorImovel] = useState<string>("500000");
  const [taxaJuros, setTaxaJuros] = useState<string>("10.5");
  const [valorizacao, setValorizacao] = useState<number[]>([5]);
  const [prazoAnalise, setPrazoAnalise] = useState<number[]>([10]);

  const resultados = useMemo(() => {
    const aluguel = parseFloat(valorAluguel) || 0;
    const imovel = parseFloat(valorImovel) || 0;
    const taxa = parseFloat(taxaJuros) || 0;
    const valoriz = valorizacao[0];
    const anos = prazoAnalise[0];

    if (aluguel <= 0 || imovel <= 0 || anos <= 0) return null;

    const entrada = imovel * 0.2;
    const financiado = imovel * 0.8;
    const parcela = calcularParcelaPRICE(financiado, taxa, 360);

    // Evolução ano a ano
    const dadosGrafico = [];
    let custoAluguelAcumulado = 0;
    let custoCompraAcumulado = entrada;
    let patrimonioCompra = 0;

    for (let ano = 0; ano <= anos; ano++) {
      if (ano === 0) {
        dadosGrafico.push({
          ano,
          custoAluguel: 0,
          custoCompra: entrada,
          patrimonioCompra: 0,
          patrimonioAluguel: entrada, // Se investisse a entrada
        });
        continue;
      }

      // Custo do aluguel (reajuste anual de 5%)
      const aluguelAnual = aluguel * 12 * Math.pow(1.05, ano - 1);
      custoAluguelAcumulado += aluguelAnual;

      // Custo da compra (parcelas)
      custoCompraAcumulado += parcela * 12;

      // Patrimônio da compra (valor do imóvel valorizado)
      patrimonioCompra = calcularValorFuturo(imovel, valoriz, ano);

      // Patrimônio do aluguel (entrada investida a 8% a.a.)
      const patrimonioAluguel = calcularValorFuturo(entrada, 8, ano);

      dadosGrafico.push({
        ano,
        custoAluguel: Math.round(custoAluguelAcumulado),
        custoCompra: Math.round(custoCompraAcumulado),
        patrimonioCompra: Math.round(patrimonioCompra),
        patrimonioAluguel: Math.round(patrimonioAluguel),
      });
    }

    const custoTotalAluguel = custoAluguelAcumulado;
    const custoTotalCompra = custoCompraAcumulado;
    const patrimonioFinalCompra = patrimonioCompra;
    const patrimonioFinalAluguel = calcularValorFuturo(entrada, 8, anos);

    // Saldo líquido = Patrimônio - Custo
    const saldoCompra = patrimonioFinalCompra - custoTotalCompra;
    const saldoAluguel = patrimonioFinalAluguel - custoTotalAluguel;

    const melhorOpcao = saldoCompra > saldoAluguel ? "comprar" : "alugar";

    return {
      entrada,
      parcela,
      custoTotalAluguel,
      custoTotalCompra,
      patrimonioFinalCompra,
      patrimonioFinalAluguel,
      saldoCompra,
      saldoAluguel,
      melhorOpcao,
      dadosGrafico,
    };
  }, [valorAluguel, valorImovel, taxaJuros, valorizacao, prazoAnalise]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados para Comparação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="valorAluguel">Valor do Aluguel Mensal (R$)</Label>
              <Input
                id="valorAluguel"
                type="number"
                value={valorAluguel}
                onChange={(e) => setValorAluguel(e.target.value)}
                placeholder="2500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorImovel">Valor do Imóvel (R$)</Label>
              <Input
                id="valorImovel"
                type="number"
                value={valorImovel}
                onChange={(e) => setValorImovel(e.target.value)}
                placeholder="500000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxaJuros">Taxa de Juros Financiamento (% ao ano)</Label>
              <Input
                id="taxaJuros"
                type="number"
                step="0.1"
                value={taxaJuros}
                onChange={(e) => setTaxaJuros(e.target.value)}
                placeholder="10.5"
              />
            </div>

            <div className="space-y-2">
              <Label>Valorização Anual Estimada: {valorizacao[0]}%</Label>
              <Slider
                value={valorizacao}
                onValueChange={setValorizacao}
                min={0}
                max={15}
                step={0.5}
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <Label>Prazo de Análise: {prazoAnalise[0]} anos</Label>
              <Slider
                value={prazoAnalise}
                onValueChange={setPrazoAnalise}
                min={1}
                max={30}
                step={1}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resultado da Análise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {resultados ? (
              <>
                <div className={`rounded-lg p-4 text-center ${
                  resultados.melhorOpcao === "comprar" 
                    ? "bg-green-500/10 border border-green-500/30" 
                    : "bg-blue-500/10 border border-blue-500/30"
                }`}>
                  <Badge className={`text-lg py-1 px-4 ${
                    resultados.melhorOpcao === "comprar" 
                      ? "bg-green-600" 
                      : "bg-blue-600"
                  }`}>
                    {resultados.melhorOpcao === "comprar" ? (
                      <><Home className="mr-2 h-4 w-4" /> Comprar é mais vantajoso</>
                    ) : (
                      <><Key className="mr-2 h-4 w-4" /> Alugar é mais vantajoso</>
                    )}
                  </Badge>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Em {prazoAnalise[0]} anos de análise
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-green-500/10 p-3">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <Home className="h-4 w-4" />
                      Comprar
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Custo total: {formatarMoeda(resultados.custoTotalCompra)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Patrimônio: {formatarMoeda(resultados.patrimonioFinalCompra)}
                    </div>
                    <div className="mt-1 font-bold text-green-700">
                      Saldo: {formatarMoeda(resultados.saldoCompra)}
                    </div>
                  </div>

                  <div className="rounded-lg bg-blue-500/10 p-3">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <Key className="h-4 w-4" />
                      Alugar
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Custo total: {formatarMoeda(resultados.custoTotalAluguel)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Investimento: {formatarMoeda(resultados.patrimonioFinalAluguel)}
                    </div>
                    <div className="mt-1 font-bold text-blue-700">
                      Saldo: {formatarMoeda(resultados.saldoAluguel)}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-3">
                  <h4 className="text-sm font-medium">Premissas da simulação:</h4>
                  <ul className="mt-1 text-xs text-muted-foreground space-y-1">
                    <li>• Entrada de 20%: {formatarMoeda(resultados.entrada)}</li>
                    <li>• Parcela mensal: {formatarMoeda(resultados.parcela)}</li>
                    <li>• Reajuste do aluguel: 5% a.a.</li>
                    <li>• Rendimento do investimento: 8% a.a.</li>
                  </ul>
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground">
                Preencha os campos para ver a comparação
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      {resultados && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Evolução Patrimonial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={resultados.dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ano" label={{ value: "Anos", position: "bottom", offset: -5 }} />
                  <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value: number) => formatarMoeda(value)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="patrimonioCompra"
                    name="Patrimônio (Compra)"
                    stroke="hsl(142, 76%, 36%)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="custoCompra"
                    name="Custo (Compra)"
                    stroke="hsl(142, 76%, 36%)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="patrimonioAluguel"
                    name="Investimento (Aluguel)"
                    stroke="hsl(217, 91%, 60%)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="custoAluguel"
                    name="Custo (Aluguel)"
                    stroke="hsl(217, 91%, 60%)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Esta análise considera cenários simplificados. Fatores como custos de manutenção,
          condomínio, IPTU e oportunidades de investimento podem alterar significativamente o resultado.
        </AlertDescription>
      </Alert>
    </div>
  );
}
