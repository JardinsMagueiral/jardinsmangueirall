import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, TrendingDown, DollarSign, Percent } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import {
  calcularParcelasSAC,
  calcularParcelasPRICE,
  formatarMoeda,
} from "@/lib/calculadoras";

export function SimuladorFinanciamento() {
  const [valorImovel, setValorImovel] = useState<string>("500000");
  const [valorEntrada, setValorEntrada] = useState<string>("100000");
  const [taxaJuros, setTaxaJuros] = useState<string>("10.5");
  const [prazoAnos, setPrazoAnos] = useState<number[]>([30]);
  const [sistema, setSistema] = useState<"SAC" | "PRICE">("SAC");

  const resultados = useMemo(() => {
    const imovel = parseFloat(valorImovel) || 0;
    const entrada = parseFloat(valorEntrada) || 0;
    const taxa = parseFloat(taxaJuros) || 0;
    const prazoMeses = prazoAnos[0] * 12;
    const valorFinanciado = Math.max(0, imovel - entrada);

    if (valorFinanciado <= 0 || prazoMeses <= 0) {
      return null;
    }

    const parcelas =
      sistema === "SAC"
        ? calcularParcelasSAC(valorFinanciado, taxa, prazoMeses)
        : calcularParcelasPRICE(valorFinanciado, taxa, prazoMeses);

    const parcelaInicial = parcelas[0]?.parcela || 0;
    const parcelaFinal = parcelas[parcelas.length - 1]?.parcela || 0;
    const totalPago = parcelas.reduce((sum, p) => sum + p.parcela, 0) + entrada;
    const totalJuros = parcelas.reduce((sum, p) => sum + p.juros, 0);

    // Dados para o gráfico (amostragem para performance)
    const intervalo = Math.max(1, Math.floor(prazoMeses / 36));
    const dadosGrafico = parcelas
      .filter((_, i) => i % intervalo === 0 || i === prazoMeses - 1)
      .map((p) => ({
        mes: p.mes,
        ano: Math.ceil(p.mes / 12),
        parcela: Math.round(p.parcela),
        juros: Math.round(p.juros),
        amortizacao: Math.round(p.amortizacao),
      }));

    return {
      valorFinanciado,
      parcelaInicial,
      parcelaFinal,
      totalPago,
      totalJuros,
      dadosGrafico,
    };
  }, [valorImovel, valorEntrada, taxaJuros, prazoAnos, sistema]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados do Financiamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <Label htmlFor="valorEntrada">Valor de Entrada (R$)</Label>
              <Input
                id="valorEntrada"
                type="number"
                value={valorEntrada}
                onChange={(e) => setValorEntrada(e.target.value)}
                placeholder="100000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxaJuros">Taxa de Juros (% ao ano)</Label>
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
              <Label>Prazo: {prazoAnos[0]} anos ({prazoAnos[0] * 12} meses)</Label>
              <Slider
                value={prazoAnos}
                onValueChange={setPrazoAnos}
                min={1}
                max={35}
                step={1}
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <Label>Sistema de Amortização</Label>
              <RadioGroup
                value={sistema}
                onValueChange={(v) => setSistema(v as "SAC" | "PRICE")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="SAC" id="sac" />
                  <Label htmlFor="sac" className="font-normal cursor-pointer">
                    SAC (parcelas decrescentes)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="PRICE" id="price" />
                  <Label htmlFor="price" className="font-normal cursor-pointer">
                    PRICE (parcelas fixas)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resultados da Simulação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {resultados ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-primary/10 p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      Parcela Inicial
                    </div>
                    <div className="mt-1 text-xl font-bold text-primary">
                      {formatarMoeda(resultados.parcelaInicial)}
                    </div>
                  </div>

                  <div className="rounded-lg bg-secondary p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingDown className="h-4 w-4" />
                      Parcela Final
                    </div>
                    <div className="mt-1 text-xl font-bold">
                      {formatarMoeda(resultados.parcelaFinal)}
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted p-4">
                    <div className="text-sm text-muted-foreground">Valor Financiado</div>
                    <div className="mt-1 text-lg font-semibold">
                      {formatarMoeda(resultados.valorFinanciado)}
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted p-4">
                    <div className="text-sm text-muted-foreground">Total Pago</div>
                    <div className="mt-1 text-lg font-semibold">
                      {formatarMoeda(resultados.totalPago)}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <Percent className="h-4 w-4" />
                    Total de Juros Pagos
                  </div>
                  <div className="mt-1 text-xl font-bold text-destructive">
                    {formatarMoeda(resultados.totalJuros)}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground">
                Preencha os campos para ver a simulação
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      {resultados && resultados.dadosGrafico.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Evolução das Parcelas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={resultados.dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="ano"
                    label={{ value: "Anos", position: "bottom", offset: -5 }}
                  />
                  <YAxis
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => formatarMoeda(value)}
                    labelFormatter={(label) => `Ano ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="parcela"
                    name="Parcela"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="juros"
                    name="Juros"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="amortizacao"
                    name="Amortização"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    dot={false}
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
          Esta é uma simulação estimada para fins de planejamento. Os valores reais podem
          variar de acordo com a instituição financeira, análise de crédito e condições de mercado.
        </AlertDescription>
      </Alert>
    </div>
  );
}
