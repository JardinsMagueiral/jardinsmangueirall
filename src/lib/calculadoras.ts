// Funções auxiliares para cálculos financeiros imobiliários

export interface ParcelaSAC {
  mes: number;
  parcela: number;
  amortizacao: number;
  juros: number;
  saldoDevedor: number;
}

// Calcular parcela pelo sistema PRICE (parcelas fixas)
export function calcularParcelaPRICE(
  valorFinanciado: number,
  taxaAnual: number,
  prazoMeses: number
): number {
  const taxaMensal = taxaAnual / 100 / 12;
  if (taxaMensal === 0) return valorFinanciado / prazoMeses;
  
  const parcela =
    valorFinanciado *
    (taxaMensal * Math.pow(1 + taxaMensal, prazoMeses)) /
    (Math.pow(1 + taxaMensal, prazoMeses) - 1);
  
  return parcela;
}

// Calcular evolução das parcelas pelo sistema SAC
export function calcularParcelasSAC(
  valorFinanciado: number,
  taxaAnual: number,
  prazoMeses: number
): ParcelaSAC[] {
  const taxaMensal = taxaAnual / 100 / 12;
  const amortizacao = valorFinanciado / prazoMeses;
  const parcelas: ParcelaSAC[] = [];
  let saldoDevedor = valorFinanciado;

  for (let mes = 1; mes <= prazoMeses; mes++) {
    const juros = saldoDevedor * taxaMensal;
    const parcela = amortizacao + juros;
    
    parcelas.push({
      mes,
      parcela,
      amortizacao,
      juros,
      saldoDevedor,
    });
    
    saldoDevedor -= amortizacao;
  }

  return parcelas;
}

// Calcular evolução das parcelas pelo sistema PRICE
export function calcularParcelasPRICE(
  valorFinanciado: number,
  taxaAnual: number,
  prazoMeses: number
): ParcelaSAC[] {
  const taxaMensal = taxaAnual / 100 / 12;
  const parcelaFixa = calcularParcelaPRICE(valorFinanciado, taxaAnual, prazoMeses);
  const parcelas: ParcelaSAC[] = [];
  let saldoDevedor = valorFinanciado;

  for (let mes = 1; mes <= prazoMeses; mes++) {
    const juros = saldoDevedor * taxaMensal;
    const amortizacao = parcelaFixa - juros;
    
    parcelas.push({
      mes,
      parcela: parcelaFixa,
      amortizacao,
      juros,
      saldoDevedor,
    });
    
    saldoDevedor -= amortizacao;
  }

  return parcelas;
}

// Calcular valor futuro com juros compostos
export function calcularValorFuturo(
  valorPresente: number,
  taxaAnual: number,
  anos: number
): number {
  return valorPresente * Math.pow(1 + taxaAnual / 100, anos);
}

// Calcular valor máximo de financiamento baseado na parcela
export function calcularValorMaximoFinanciamento(
  parcelaMaxima: number,
  taxaAnual: number,
  prazoMeses: number
): number {
  const taxaMensal = taxaAnual / 100 / 12;
  if (taxaMensal === 0) return parcelaMaxima * prazoMeses;
  
  const valorFinanciado =
    parcelaMaxima *
    (Math.pow(1 + taxaMensal, prazoMeses) - 1) /
    (taxaMensal * Math.pow(1 + taxaMensal, prazoMeses));
  
  return valorFinanciado;
}

// Formatar valor para moeda brasileira
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

// Formatar número com separadores de milhar
export function formatarNumero(valor: number): string {
  return new Intl.NumberFormat('pt-BR').format(valor);
}

// Parse valor de input monetário
export function parseMoeda(valor: string): number {
  const cleaned = valor.replace(/[^\d,]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}
