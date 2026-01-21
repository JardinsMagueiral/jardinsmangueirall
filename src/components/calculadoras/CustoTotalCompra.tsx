import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Info, Receipt, AlertTriangle } from "lucide-react";
import { formatarMoeda } from "@/lib/calculadoras";

export function CustoTotalCompra() {
  const [valorImovel, setValorImovel] = useState<string>("500000");
  const [itbi, setItbi] = useState<string>("3");
  const [escritura, setEscritura] = useState<string>("1");
  const [registro, setRegistro] = useState<string>("2000");
  const [corretagem, setCorretagem] = useState<string>("6");
  const [incluirCorretagem, setIncluirCorretagem] = useState<boolean>(false);

  const resultados = useMemo(() => {
    const imovel = parseFloat(valorImovel) || 0;
    const itbiPercent = parseFloat(itbi) || 0;
    const escrituraPercent = parseFloat(escritura) || 0;
    const registroValor = parseFloat(registro) || 0;
    const corretagemPercent = parseFloat(corretagem) || 0;

    if (imovel <= 0) return null;

    const custoItbi = (imovel * itbiPercent) / 100;
    const custoEscritura = (imovel * escrituraPercent) / 100;
    const custoCorretagem = incluirCorretagem ? (imovel * corretagemPercent) / 100 : 0;
    
    const totalCustosExtras = custoItbi + custoEscritura + registroValor + custoCorretagem;
    const totalNecessario = imovel + totalCustosExtras;
    const percentualExtras = (totalCustosExtras / imovel) * 100;

    return {
      custoItbi,
      custoEscritura,
      custoRegistro: registroValor,
      custoCorretagem,
      totalCustosExtras,
      totalNecessario,
      percentualExtras,
    };
  }, [valorImovel, itbi, escritura, registro, corretagem, incluirCorretagem]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados do Imóvel e Custos</CardTitle>
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
              <Label htmlFor="itbi">ITBI (%)</Label>
              <Input
                id="itbi"
                type="number"
                step="0.1"
                value={itbi}
                onChange={(e) => setItbi(e.target.value)}
                placeholder="3"
              />
              <p className="text-xs text-muted-foreground">
                Imposto de Transmissão de Bens Imóveis (varia por município)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="escritura">Escritura (%)</Label>
              <Input
                id="escritura"
                type="number"
                step="0.1"
                value={escritura}
                onChange={(e) => setEscritura(e.target.value)}
                placeholder="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registro">Registro (R$)</Label>
              <Input
                id="registro"
                type="number"
                value={registro}
                onChange={(e) => setRegistro(e.target.value)}
                placeholder="2000"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="incluirCorretagem"
                  checked={incluirCorretagem}
                  onChange={(e) => setIncluirCorretagem(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="incluirCorretagem" className="cursor-pointer">
                  Incluir corretagem (paga pelo comprador)
                </Label>
              </div>
              {incluirCorretagem && (
                <Input
                  type="number"
                  step="0.1"
                  value={corretagem}
                  onChange={(e) => setCorretagem(e.target.value)}
                  placeholder="6"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Custos Detalhados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {resultados ? (
              <>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ITBI</span>
                    <span className="font-medium">{formatarMoeda(resultados.custoItbi)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Escritura</span>
                    <span className="font-medium">{formatarMoeda(resultados.custoEscritura)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registro</span>
                    <span className="font-medium">{formatarMoeda(resultados.custoRegistro)}</span>
                  </div>
                  {incluirCorretagem && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Corretagem</span>
                      <span className="font-medium">{formatarMoeda(resultados.custoCorretagem)}</span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Total de Custos Extras</span>
                      <span className="font-bold text-destructive">
                        {formatarMoeda(resultados.totalCustosExtras)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Proporção dos Custos Extras</Label>
                  <Progress value={Math.min(resultados.percentualExtras, 100)} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {resultados.percentualExtras.toFixed(1)}% do valor do imóvel
                  </p>
                </div>

                <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-4">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-semibold">Atenção!</span>
                  </div>
                  <p className="mt-2 text-sm">
                    Você precisará de{" "}
                    <strong>{formatarMoeda(resultados.totalCustosExtras)}</strong> além do
                    preço do imóvel.
                  </p>
                </div>

                <div className="rounded-lg bg-primary/10 p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Receipt className="h-4 w-4" />
                    Total Necessário para Compra
                  </div>
                  <div className="mt-1 text-2xl font-bold text-primary">
                    {formatarMoeda(resultados.totalNecessario)}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground">
                Preencha o valor do imóvel para ver os custos
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Os valores de ITBI variam por município. Em Brasília/DF, a alíquota é de 3%.
          Consulte a prefeitura local para valores precisos.
        </AlertDescription>
      </Alert>
    </div>
  );
}
