import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Wallet, Home, DollarSign } from "lucide-react";
import {
  calcularValorMaximoFinanciamento,
  formatarMoeda,
} from "@/lib/calculadoras";

export function QuantoPossoFinanciar() {
  const [rendaMensal, setRendaMensal] = useState<string>("10000");
  const [percentualComprometido, setPercentualComprometido] = useState<number[]>([30]);
  const [taxaJuros, setTaxaJuros] = useState<string>("10.5");
  const [prazoAnos, setPrazoAnos] = useState<number[]>([30]);

  const resultados = useMemo(() => {
    const renda = parseFloat(rendaMensal) || 0;
    const percentual = percentualComprometido[0];
    const taxa = parseFloat(taxaJuros) || 0;
    const prazoMeses = prazoAnos[0] * 12;

    if (renda <= 0 || prazoMeses <= 0) {
      return null;
    }

    const parcelaMaxima = (renda * percentual) / 100;
    const valorMaximoFinanciamento = calcularValorMaximoFinanciamento(
      parcelaMaxima,
      taxa,
      prazoMeses
    );
    // Considerando entrada de 20%
    const valorImovelEstimado = valorMaximoFinanciamento / 0.8;

    return {
      parcelaMaxima,
      valorMaximoFinanciamento,
      valorImovelEstimado,
    };
  }, [rendaMensal, percentualComprometido, taxaJuros, prazoAnos]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sua Situação Financeira</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rendaMensal">Renda Mensal Familiar (R$)</Label>
              <Input
                id="rendaMensal"
                type="number"
                value={rendaMensal}
                onChange={(e) => setRendaMensal(e.target.value)}
                placeholder="10000"
              />
            </div>

            <div className="space-y-2">
              <Label>
                Percentual Máximo Comprometido: {percentualComprometido[0]}%
              </Label>
              <Slider
                value={percentualComprometido}
                onValueChange={setPercentualComprometido}
                min={20}
                max={35}
                step={1}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground">
                Recomendação: não comprometer mais de 30% da renda com financiamento
              </p>
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
              <Label>Prazo: {prazoAnos[0]} anos</Label>
              <Slider
                value={prazoAnos}
                onValueChange={setPrazoAnos}
                min={5}
                max={35}
                step={1}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Capacidade de Financiamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {resultados ? (
              <>
                <div className="rounded-lg bg-secondary p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Wallet className="h-4 w-4" />
                    Parcela Máxima Recomendada
                  </div>
                  <div className="mt-1 text-2xl font-bold">
                    {formatarMoeda(resultados.parcelaMaxima)}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {percentualComprometido[0]}% da sua renda mensal
                  </p>
                </div>

                <div className="rounded-lg bg-primary/10 p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    Valor Máximo de Financiamento
                  </div>
                  <div className="mt-1 text-2xl font-bold text-primary">
                    {formatarMoeda(resultados.valorMaximoFinanciamento)}
                  </div>
                </div>

                <div className="rounded-lg bg-accent p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Home className="h-4 w-4" />
                    Valor Aproximado do Imóvel
                  </div>
                  <div className="mt-1 text-2xl font-bold text-accent-foreground">
                    {formatarMoeda(resultados.valorImovelEstimado)}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Considerando entrada de 20%
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <h4 className="font-medium">Resumo</h4>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>• Entrada estimada: {formatarMoeda(resultados.valorImovelEstimado * 0.2)}</li>
                    <li>• Financiamento: {formatarMoeda(resultados.valorMaximoFinanciamento)}</li>
                    <li>• Prazo: {prazoAnos[0]} anos ({prazoAnos[0] * 12} parcelas)</li>
                  </ul>
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground">
                Preencha os campos para ver sua capacidade de financiamento
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Esta é uma estimativa baseada na sua renda declarada. A aprovação final do
          financiamento depende da análise de crédito da instituição financeira.
        </AlertDescription>
      </Alert>
    </div>
  );
}
