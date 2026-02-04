import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, DollarSign, Bed, Bath, Home, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function PropertySearch() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState("");
  const [operacao, setOperacao] = useState("");
  const [precoMin, setPrecoMin] = useState("");
  const [precoMax, setPrecoMax] = useState("");
  const [quartos, setQuartos] = useState("");
  const [banheiros, setBanheiros] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (tipo && tipo !== "all") params.set("tipo", tipo);
    if (operacao && operacao !== "all") params.set("operacao", operacao);
    if (precoMin) params.set("precoMin", precoMin);
    if (precoMax) params.set("precoMax", precoMax);
    if (quartos && quartos !== "all") params.set("quartos", quartos);
    if (banheiros && banheiros !== "all") params.set("banheiros", banheiros);
    
    navigate(`/imoveis?${params.toString()}`);
  };

  return (
    <div className="rounded-2xl bg-card p-6 shadow-2xl md:p-8">
      <h2 className="mb-6 text-center font-serif text-2xl font-bold text-foreground md:text-3xl">
        Encontre O Seu Sonho
      </h2>
      
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Localização"
            className="pl-10"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger>
              <Home className="mr-2 h-5 w-5 text-muted-foreground" />
              <SelectValue placeholder="Tipo de Imóvel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="casa">Casa</SelectItem>
              <SelectItem value="apartamento">Apartamento</SelectItem>
              <SelectItem value="terreno">Terreno</SelectItem>
              <SelectItem value="comercial">Loja</SelectItem>
            </SelectContent>
          </Select>

          <Select value={operacao} onValueChange={setOperacao}>
            <SelectTrigger>
              <Key className="mr-2 h-5 w-5 text-muted-foreground" />
              <SelectValue placeholder="Operação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="venda">Venda</SelectItem>
              <SelectItem value="aluguel">Aluguel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Valor mínimo" 
              className="pl-10" 
              type="number" 
              value={precoMin}
              onChange={(e) => setPrecoMin(e.target.value)}
            />
          </div>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Valor máximo" 
              className="pl-10" 
              type="number"
              value={precoMax}
              onChange={(e) => setPrecoMax(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select value={quartos} onValueChange={setQuartos}>
            <SelectTrigger>
              <Bed className="mr-2 h-5 w-5 text-muted-foreground" />
              <SelectValue placeholder="Quartos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="1">1 Quarto</SelectItem>
              <SelectItem value="2">2 Quartos</SelectItem>
              <SelectItem value="3">3 Quartos</SelectItem>
              <SelectItem value="4">4+ Quartos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={banheiros} onValueChange={setBanheiros}>
            <SelectTrigger>
              <Bath className="mr-2 h-5 w-5 text-muted-foreground" />
              <SelectValue placeholder="Banheiros" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="1">1 Banheiro</SelectItem>
              <SelectItem value="2">2 Banheiros</SelectItem>
              <SelectItem value="3">3+ Banheiros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSearch} className="w-full" size="lg">
          <Search className="mr-2 h-5 w-5" />
          Buscar Imóveis
        </Button>
      </div>
    </div>
  );
}
