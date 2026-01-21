import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Info, CheckCircle2, XCircle, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { calcularParcelaPRICE, formatarMoeda } from "@/lib/calculadoras";

export function EntradaIdeal() {
  const [valorImovel, setValorImovel] = useState<string>("500000");
  const [valorDisponivel, setValorDisponivel] = useState<string>("80000");
  const [percentualMinimo, setPercentualMinimo] = useState<string>("20");
  const [taxaJuros, setTaxaJuros] = useState<string>("10.5");
  const [prazoAnos, setPrazoAnos] = useState<string>("30");

  const resultados = useMemo(() => {
    const imovel = parseFloat(valorImovel) || 0;
    const disponivel = parseFloat(valorDisponivel) || 0;
    const minimo = parseFloat(percentualMinimo) || 0;
    const taxa = parseFloat(taxaJuros) || 0;
    const prazo = (parseFloat(prazoAnos) || 0) * 12;

    if (imovel <= 0 || prazo <= 0) return null;

    const entradaMinima = (imovel * minimo) / 100;
    const diferenca = entradaMinima - disponivel;
    const suficiente = disponivel >= entradaMinima;

    // Calcular parcelas para diferentes cenários de entrada
    const cenarios = [
      { label: "Entrada Mínima", entrada: entradaMinima, percentual: minimo },
      { label: "Entrada 25%", entrada: imovel * 0.25, percentual: 25 },
      { label: "Entrada 30%", entrada: imovel * 0.30, percentual: 30 },
      { label: "Sua Entrada", entrada: disponivel, percentual: (disponivel / imovel) * 100 },
    ].map((c) => ({
      ...c,
      financiado: Math.max(0, imovel - c.entrada),
      parcela: calcularParcelaPRICE(Math.max(0, imovel - c.entrada), taxa, prazo),
    }));

    return {
      entradaMinima,
      diferenca,
      suficiente,
      percentualDisponivel: (disponivel / imovel) * 100,
      cenarios,
    };
  }, [valorImovel, valorDisponivel, percentualMinimo, taxaJuros, prazoAnos]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados para Simulação</CardTitle>
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
              <Label htmlFor="valorDisponivel">Valor Disponível Hoje (R$)</Label>
              <Input
                id="valorDisponivel"
                type="number"
                value={valorDisponivel}
                onChange={(e) => setValorDisponivel(e.target.value)}
                placeholder="80000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="percentualMinimo">Percentual Mínimo Exigido</Label>
              <Select value={percentualMinimo} onValueChange={setPercentualMinimo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10% - Programas habitacionais</SelectItem>
                  <SelectItem value="20">20% - Padrão de mercado</SelectItem>
                  <SelectItem value="30">30% - Conservador</SelectItem>
                </SelectContent>
              </Select>
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
              <Label htmlFor="prazoAnos">Prazo (anos)</Label>
              <Select value={prazoAnos} onValueChange={setPrazoAnos}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 anos</SelectItem>
                  <SelectItem value="20">20 anos</SelectItem>
                  <SelectItem value="25">25 anos</SelectItem>
                  <SelectItem value="30">30 anos</SelectItem>
                  <SelectItem value="35">35 anos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Análise da Entrada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {resultados ? (
              <>
                <div className="rounded-lg bg-muted p-4">
                  <div className="text-sm text-muted-foreground">Entrada Mínima Necessária</div>
                  <div className="mt-1 text-2xl font-bold">
                    {formatarMoeda(resultados.entradaMinima)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ({percentualMinimo}% do valor do imóvel)
                  </p>
                </div>

                <div className={`rounded-lg p-4 ${
                  resultados.suficiente 
                    ? "bg-green-500/10 border border-green-500/30" 
                    : "bg-destructive/10 border border-destructive/30"
                }`}>
                  <div className="flex items-center gap-2">
                    {resultados.suficiente ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <span className={`font-semibold ${
                      resultados.suficiente ? "text-green-600" : "text-destructive"
                    }`}>
                      {resultados.suficiente 
                        ? "Você tem entrada suficiente!" 
                        : "Entrada insuficiente"}
                    </span>
                  </div>
                  {!resultados.suficiente && (
                    <p className="mt-2 text-sm">
                      Faltam <strong>{formatarMoeda(resultados.diferenca)}</strong> para
                      atingir a entrada mínima.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Sua entrada representa:</Label>
                  <Progress 
                    value={Math.min(resultados.percentualDisponivel, 100)} 
                    className="h-3" 
                  />
                  <p className="text-sm text-muted-foreground">
                    {resultados.percentualDisponivel.toFixed(1)}% do valor do imóvel
                  </p>
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground">
                Preencha os campos para ver a análise
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Comparativo */}
      {resultados && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingDown className="h-5 w-5" />
              Impacto da Entrada na Parcela
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resultados.cenarios} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis dataKey="label" type="category" width={120} />
                  <Tooltip
                    formatter={(value: number) => formatarMoeda(value)}
                    labelFormatter={(label) => label}
                  />
                  <Bar dataKey="parcela" name="Parcela Mensal" radius={[0, 4, 4, 0]}>
                    {resultados.cenarios.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.label === "Sua Entrada"
                            ? "hsl(var(--primary))"
                            : "hsl(var(--muted-foreground))"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Quanto maior a entrada, menor será sua parcela mensal
            </p>
          </CardContent>
        </Card>
      )}

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          A entrada mínima varia conforme o programa de financiamento e a instituição financeira.
          Programas como Casa Verde e Amarela podem aceitar entradas menores.
        </AlertDescription>
      </Alert>
    </div>
  );
}
