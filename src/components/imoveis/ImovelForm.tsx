import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X, MessageCircle, CheckCircle } from "lucide-react";

const imovelSchema = z.object({
  tipo: z.enum(["casa", "apartamento", "terreno", "comercial"]),
  operacao: z.enum(["venda", "aluguel"]),
  endereco: z.string().min(5, "Endereço obrigatório").max(200),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().default("Jardins Mangueiral"),
  cep: z.string().optional(),
  quartos: z.coerce.number().min(0).max(20),
  banheiros: z.coerce.number().min(0).max(20),
  vagas: z.coerce.number().min(0).max(20),
  area_m2: z.coerce.number().min(0).optional(),
  preco: z.coerce.number().min(1, "Preço obrigatório"),
  condominio: z.coerce.number().min(0).optional(),
  iptu: z.coerce.number().min(0).optional(),
  descricao: z.string().max(2000).optional(),
  mobiliado: z.boolean().default(false),
  aceita_pets: z.boolean().default(false),
});

type ImovelFormData = z.infer<typeof imovelSchema>;

interface ImovelFormProps {
  isAdmin?: boolean;
  initialData?: Partial<ImovelFormData> & { id?: string };
  onSuccess?: () => void;
}

export function ImovelForm({ isAdmin = false, initialData, onSuccess }: ImovelFormProps) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [savedImovelData, setSavedImovelData] = useState<ImovelFormData | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const isEditing = !!initialData?.id;

  const handleWhatsAppRedirect = () => {
    if (savedImovelData) {
      const whatsappMessage = encodeURIComponent(
        `Olá! Acabei de cadastrar um imóvel (${savedImovelData.tipo} para ${savedImovelData.operacao}) no site Jardins Mangueiral. ` +
        `Endereço: ${savedImovelData.endereco}, ${savedImovelData.bairro}. Valor: R$ ${savedImovelData.preco.toLocaleString("pt-BR")}`
      );
      window.open(`https://wa.me/5561981537063?text=${whatsappMessage}`, "_blank");
    }
    setShowSuccessDialog(false);
    navigate("/minha-conta");
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ImovelFormData>({
    resolver: zodResolver(imovelSchema),
    defaultValues: {
      tipo: initialData?.tipo || "casa",
      operacao: initialData?.operacao || "venda",
      endereco: initialData?.endereco || "",
      numero: initialData?.numero || "",
      complemento: initialData?.complemento || "",
      bairro: initialData?.bairro || "Jardins Mangueiral",
      cep: initialData?.cep || "",
      quartos: initialData?.quartos || 0,
      banheiros: initialData?.banheiros || 0,
      vagas: initialData?.vagas || 0,
      area_m2: initialData?.area_m2 || undefined,
      preco: initialData?.preco || undefined,
      condominio: initialData?.condominio || undefined,
      iptu: initialData?.iptu || undefined,
      descricao: initialData?.descricao || "",
      mobiliado: initialData?.mobiliado || false,
      aceita_pets: initialData?.aceita_pets || false,
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 10) {
      toast({
        title: "Limite de fotos",
        description: "Você pode enviar no máximo 10 fotos",
        variant: "destructive",
      });
      return;
    }

    setPhotos([...photos, ...files]);
    
    // Create preview URLs
    const newUrls = files.map((file) => URL.createObjectURL(file));
    setPhotoUrls([...photoUrls, ...newUrls]);
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    const newUrls = [...photoUrls];
    
    URL.revokeObjectURL(newUrls[index]);
    newPhotos.splice(index, 1);
    newUrls.splice(index, 1);
    
    setPhotos(newPhotos);
    setPhotoUrls(newUrls);
  };

  const uploadPhotos = async (imovelId: string) => {
    const uploadedUrls: string[] = [];

    for (const photo of photos) {
      const fileExt = photo.name.split(".").pop();
      const fileName = `${user!.id}/${imovelId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("imoveis")
        .upload(fileName, photo);

      if (uploadError) {
        console.error("Error uploading photo:", uploadError);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("imoveis")
        .getPublicUrl(fileName);

      uploadedUrls.push(urlData.publicUrl);
    }

    // Save photo URLs to database
    for (let i = 0; i < uploadedUrls.length; i++) {
      await supabase.from("imovel_fotos").insert({
        imovel_id: imovelId,
        url: uploadedUrls[i],
        ordem: i,
      });
    }

    return uploadedUrls;
  };

  const onSubmit = async (data: ImovelFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      const imovelData = {
        tipo: data.tipo,
        operacao: data.operacao,
        endereco: data.endereco,
        numero: data.numero || null,
        complemento: data.complemento || null,
        bairro: data.bairro,
        cep: data.cep || null,
        quartos: data.quartos,
        banheiros: data.banheiros,
        vagas: data.vagas,
        area_m2: data.area_m2 || null,
        preco: data.preco,
        condominio: data.condominio || null,
        iptu: data.iptu || null,
        descricao: data.descricao || null,
        mobiliado: data.mobiliado,
        aceita_pets: data.aceita_pets,
        user_id: user.id,
        status: isAdmin ? "aprovado" : "pendente",
      };

      let imovelId: string;

      if (isEditing) {
        const { error } = await supabase
          .from("imoveis")
          .update(imovelData)
          .eq("id", initialData!.id!);

        if (error) throw error;
        imovelId = initialData!.id!;
      } else {
        const { data: newImovel, error } = await supabase
          .from("imoveis")
          .insert(imovelData)
          .select()
          .single();

        if (error) throw error;
        imovelId = newImovel.id;
      }

      // Upload photos if any
      if (photos.length > 0) {
        setUploadingPhotos(true);
        await uploadPhotos(imovelId);
        setUploadingPhotos(false);
      }

      if (onSuccess) {
        toast({
          title: isEditing ? "Imóvel atualizado!" : "Imóvel cadastrado!",
          description: "O imóvel foi salvo com sucesso",
        });
        onSuccess();
      } else if (!isAdmin) {
        // Show success dialog before WhatsApp redirect
        setSavedImovelData(data);
        setShowSuccessDialog(true);
      } else {
        toast({
          title: isEditing ? "Imóvel atualizado!" : "Imóvel publicado!",
          description: "O imóvel foi publicado com sucesso",
        });
        navigate("/admin/imoveis");
      }
    } catch (error) {
      console.error("Error saving imovel:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o imóvel",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Tipo e Operação */}
      <Card>
        <CardHeader>
          <CardTitle>Tipo de Imóvel</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={watch("tipo")}
              onValueChange={(value) => setValue("tipo", value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casa">Casa</SelectItem>
                <SelectItem value="apartamento">Apartamento</SelectItem>
                <SelectItem value="terreno">Terreno</SelectItem>
                <SelectItem value="comercial">Comercial</SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo && (
              <p className="text-sm text-destructive">{errors.tipo.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Operação</Label>
            <Select
              value={watch("operacao")}
              onValueChange={(value) => setValue("operacao", value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a operação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="venda">Venda</SelectItem>
                <SelectItem value="aluguel">Aluguel</SelectItem>
              </SelectContent>
            </Select>
            {errors.operacao && (
              <p className="text-sm text-destructive">{errors.operacao.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Localização */}
      <Card>
        <CardHeader>
          <CardTitle>Localização</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              placeholder="Rua, Quadra, Conjunto..."
              {...register("endereco")}
            />
            {errors.endereco && (
              <p className="text-sm text-destructive">{errors.endereco.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="numero">Número</Label>
            <Input id="numero" placeholder="123" {...register("numero")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="complemento">Complemento</Label>
            <Input
              id="complemento"
              placeholder="Apto, Bloco..."
              {...register("complemento")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bairro">Bairro</Label>
            <Input id="bairro" {...register("bairro")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cep">CEP</Label>
            <Input id="cep" placeholder="00000-000" {...register("cep")} />
          </div>
        </CardContent>
      </Card>

      {/* Características */}
      <Card>
        <CardHeader>
          <CardTitle>Características</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="quartos">Quartos</Label>
            <Input
              id="quartos"
              type="number"
              min="0"
              {...register("quartos")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="banheiros">Banheiros</Label>
            <Input
              id="banheiros"
              type="number"
              min="0"
              {...register("banheiros")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vagas">Vagas</Label>
            <Input id="vagas" type="number" min="0" {...register("vagas")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="area_m2">Área (m²)</Label>
            <Input
              id="area_m2"
              type="number"
              min="0"
              step="0.01"
              {...register("area_m2")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Valores */}
      <Card>
        <CardHeader>
          <CardTitle>Valores</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="preco">Preço (R$)</Label>
            <Input
              id="preco"
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              {...register("preco")}
            />
            {errors.preco && (
              <p className="text-sm text-destructive">{errors.preco.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="condominio">Condomínio (R$)</Label>
            <Input
              id="condominio"
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              {...register("condominio")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="iptu">IPTU (R$)</Label>
            <Input
              id="iptu"
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              {...register("iptu")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Descrição e Extras */}
      <Card>
        <CardHeader>
          <CardTitle>Descrição e Extras</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              placeholder="Descreva os detalhes do imóvel..."
              rows={4}
              {...register("descricao")}
            />
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="mobiliado"
                checked={watch("mobiliado")}
                onCheckedChange={(checked) => setValue("mobiliado", checked)}
              />
              <Label htmlFor="mobiliado">Mobiliado</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="aceita_pets"
                checked={watch("aceita_pets")}
                onCheckedChange={(checked) => setValue("aceita_pets", checked)}
              />
              <Label htmlFor="aceita_pets">Aceita Pets</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fotos */}
      <Card>
        <CardHeader>
          <CardTitle>Fotos</CardTitle>
          <CardDescription>
            Adicione até 10 fotos do imóvel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                className="hidden"
                id="photos"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("photos")?.click()}
                disabled={photos.length >= 10}
              >
                <Upload className="mr-2 h-4 w-4" />
                Adicionar Fotos ({photos.length}/10)
              </Button>
            </div>

            {photoUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                {photoUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={url}
                      alt={`Foto ${index + 1}`}
                      className="h-full w-full rounded-lg object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -right-2 -top-2 h-6 w-6"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit" className="flex-1" disabled={loading || uploadingPhotos}>
          {loading || uploadingPhotos ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {uploadingPhotos ? "Enviando fotos..." : "Salvando..."}
            </>
          ) : (
            <>
              {!isAdmin && <MessageCircle className="mr-2 h-4 w-4" />}
              {isEditing ? "Salvar Alterações" : isAdmin ? "Publicar Imóvel" : "Cadastrar Imóvel"}
            </>
          )}
        </Button>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="text-center sm:max-w-md">
          <DialogHeader className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <DialogTitle className="text-xl">Imóvel Cadastrado com Sucesso!</DialogTitle>
            <DialogDescription className="text-base">
              Seu imóvel foi enviado para aprovação. Agora você será direcionado para o WhatsApp para manter contato com nosso corretor.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 sm:justify-center">
            <Button variant="whatsapp" onClick={handleWhatsAppRedirect} className="w-full sm:w-auto">
              <MessageCircle className="mr-2 h-4 w-4" />
              Ir para o WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
