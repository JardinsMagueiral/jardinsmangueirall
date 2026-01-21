import { useState } from "react";
import { Search, DollarSign, Bed, Bath, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function PropertySearch() {
  const [search, setSearch] = useState("Jardins Mangueiral");

  const handleSearch = () => {
    window.open("https://wa.me/5561981537063?text=" + encodeURIComponent(`Olá! Estou buscando um imóvel em ${search}. Pode me ajudar?`), "_blank");
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
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Valor mínimo" className="pl-10" type="number" />
          </div>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Valor máximo" className="pl-10" type="number" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select>
            <SelectTrigger>
              <Bed className="mr-2 h-5 w-5 text-muted-foreground" />
              <SelectValue placeholder="Quartos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Quarto</SelectItem>
              <SelectItem value="2">2 Quartos</SelectItem>
              <SelectItem value="3">3 Quartos</SelectItem>
              <SelectItem value="4">4+ Quartos</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger>
              <Bath className="mr-2 h-5 w-5 text-muted-foreground" />
              <SelectValue placeholder="Banheiros" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Banheiro</SelectItem>
              <SelectItem value="2">2 Banheiros</SelectItem>
              <SelectItem value="3">3+ Banheiros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input defaultValue="Brasília - DF" className="pl-10" disabled />
        </div>

        <Button onClick={handleSearch} className="w-full" size="lg" variant="whatsapp">
          Encontrar
        </Button>
      </div>
    </div>
  );
}
