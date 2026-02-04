import { useState, useEffect, useCallback } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, MessageCircle, CheckCircle } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortablePhotoItem, PhotoItem } from "./SortablePhotoItem";

// File upload validation constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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

interface ExistingPhoto {
  id: string;
  url: string;
}

interface ImovelFormProps {
  isAdmin?: boolean;
  initialData?: Partial<ImovelFormData> & { id?: string };
  existingPhotos?: ExistingPhoto[];
  onSuccess?: () => void;
}

export function ImovelForm({ isAdmin = false, initialData, existingPhotos: initialExistingPhotos = [], onSuccess }: ImovelFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [allPhotos, setAllPhotos] = useState<PhotoItem[]>([]);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [savedImovelData, setSavedImovelData] = useState<ImovelFormData | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Estados para formatação de valores monetários
  const [precoFormatado, setPrecoFormatado] = useState("");
  const [condominioFormatado, setCondominioFormatado] = useState("");
  const [iptuFormatado, setIptuFormatado] = useState("");
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const isEditing = !!initialData?.id;

  // Initialize photos from existing photos
  useEffect(() => {
    if (initialExistingPhotos.length > 0) {
      const existingItems: PhotoItem[] = initialExistingPhotos.map(photo => ({
        id: photo.id,
        url: photo.url,
        type: 'existing' as const,
      }));
      setAllPhotos(existingItems);
    }
  }, [initialExistingPhotos]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setAllPhotos((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  const handleWhatsAppRedirect = () => {
    if (savedImovelData) {
      const whatsappMessage = encodeURIComponent(
        `Olá! Acabei de cadastrar um imóvel (${savedImovelData.tipo} para ${savedImovelData.operacao}) no site Jardins Mangueiral. ` +
        `Endereço: ${savedImovelData.endereco}, ${savedImovelData.bairro}. Valor: R$ ${savedImovelData.preco.toLocaleString("pt-BR")}`
      );
      window.open(`https://wa.me/5561991647984?text=${whatsappMessage}`, "_blank");
    }
    setShowSuccessDialog(false);
    setTermsAccepted(false);
    navigate("/minha-conta");
  };

  const formatarMoeda = (valor: string): string => {
    const numeros = valor.replace(/\D/g, "");
    const numero = parseInt(numeros) || 0;
    return numero.toLocaleString("pt-BR");
  };

  const handlePrecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorDigitado = e.target.value;
    const formatado = formatarMoeda(valorDigitado);
    setPrecoFormatado(formatado);
    const valorNumerico = parseInt(valorDigitado.replace(/\D/g, "")) || 0;
    setValue("preco", valorNumerico, { shouldValidate: true });
  };

  const handleCondominioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorDigitado = e.target.value;
    const formatado = formatarMoeda(valorDigitado);
    setCondominioFormatado(formatado);
    const valorNumerico = parseInt(valorDigitado.replace(/\D/g, "")) || 0;
    setValue("condominio", valorNumerico);
  };

  const handleIptuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorDigitado = e.target.value;
    const formatado = formatarMoeda(valorDigitado);
    setIptuFormatado(formatado);
    const valorNumerico = parseInt(valorDigitado.replace(/\D/g, "")) || 0;
    setValue("iptu", valorNumerico);
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

  // Inicializar valores formatados quando tiver dados iniciais
  useEffect(() => {
    if (initialData?.preco) {
      setPrecoFormatado(initialData.preco.toLocaleString("pt-BR"));
    }
    if (initialData?.condominio) {
      setCondominioFormatado(initialData.condominio.toLocaleString("pt-BR"));
    }
    if (initialData?.iptu) {
      setIptuFormatado(initialData.iptu.toLocaleString("pt-BR"));
    }
  }, [initialData]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate total number of photos
    if (allPhotos.length + files.length > 10) {
      toast({
        title: "Limite de fotos",
        description: `Você pode ter no máximo 10 fotos (${allPhotos.length} atual + ${10 - allPhotos.length} novas)`,
        variant: "destructive",
      });
      return;
    }

    // Validate each file for size and type
    const validFiles: File[] = [];
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "Arquivo muito grande",
          description: `${file.name} excede o limite de 5MB`,
          variant: "destructive",
        });
        return;
      }
      
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({
          title: "Tipo de arquivo inválido",
          description: `${file.name} não é uma imagem válida (use JPEG, PNG ou WebP)`,
          variant: "destructive",
        });
        return;
      }
      
      validFiles.push(file);
    }

    // Create new photo items
    const newPhotoItems: PhotoItem[] = validFiles.map((file) => ({
      id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url: URL.createObjectURL(file),
      type: 'new' as const,
      file,
    }));

    setAllPhotos(prev => [...prev, ...newPhotoItems]);
    
    // Reset input
    e.target.value = '';
  };

  const handleRemovePhoto = async (photo: PhotoItem) => {
    if (photo.type === 'new') {
      // Just remove from local state
      URL.revokeObjectURL(photo.url);
      setAllPhotos(prev => prev.filter(p => p.id !== photo.id));
    } else {
      // Delete from database and storage
      setDeletingPhotoId(photo.id);
      try {
        // Extract path from URL to delete from storage
        const urlParts = photo.url.split("/storage/v1/object/public/imoveis/");
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await supabase.storage.from("imoveis").remove([filePath]);
        }

        // Delete from database
        const { error } = await supabase
          .from("imovel_fotos")
          .delete()
          .eq("id", photo.id);

        if (error) throw error;

        // Update local state
        setAllPhotos(prev => prev.filter(p => p.id !== photo.id));
        
        toast({
          title: "Foto removida",
          description: "A foto foi removida com sucesso",
        });
      } catch {
        toast({
          title: "Erro",
          description: "Não foi possível remover a foto",
          variant: "destructive",
        });
      } finally {
        setDeletingPhotoId(null);
      }
    }
  };

  const uploadAndSavePhotos = async (imovelId: string) => {
    // First, update order of existing photos
    const existingPhotos = allPhotos.filter(p => p.type === 'existing');
    for (let i = 0; i < existingPhotos.length; i++) {
      const photo = existingPhotos[i];
      const orderIndex = allPhotos.findIndex(p => p.id === photo.id);
      await supabase
        .from("imovel_fotos")
        .update({ ordem: orderIndex })
        .eq("id", photo.id);
    }

    // Then, upload and save new photos
    const newPhotos = allPhotos.filter(p => p.type === 'new' && p.file);
    for (const photo of newPhotos) {
      if (!photo.file) continue;
      
      const fileExt = photo.file.name.split(".").pop();
      const fileName = `${user!.id}/${imovelId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("imoveis")
        .upload(fileName, photo.file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("imoveis")
        .getPublicUrl(fileName);

      const orderIndex = allPhotos.findIndex(p => p.id === photo.id);
      
      await supabase.from("imovel_fotos").insert({
        imovel_id: imovelId,
        url: urlData.publicUrl,
        ordem: orderIndex,
      });
    }
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

      // Upload and save photos with order
      const hasNewPhotos = allPhotos.some(p => p.type === 'new');
      const hasExistingPhotos = allPhotos.some(p => p.type === 'existing');
      
      if (hasNewPhotos || hasExistingPhotos) {
        setUploadingPhotos(true);
        await uploadAndSavePhotos(imovelId);
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
      console.error("Error saving property:", error);
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
              type="text"
              inputMode="numeric"
              placeholder="200.000"
              value={precoFormatado}
              onChange={handlePrecoChange}
            />
            {errors.preco && (
              <p className="text-sm text-destructive">{errors.preco.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="condominio">Condomínio (R$)</Label>
            <Input
              id="condominio"
              type="text"
              inputMode="numeric"
              placeholder="500"
              value={condominioFormatado}
              onChange={handleCondominioChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="iptu">IPTU (R$)</Label>
            <Input
              id="iptu"
              type="text"
              inputMode="numeric"
              placeholder="150"
              value={iptuFormatado}
              onChange={handleIptuChange}
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
            Adicione até 10 fotos do imóvel ({allPhotos.length}/10). Arraste para reordenar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Photo Grid with Drag and Drop */}
            {allPhotos.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={allPhotos.map(p => p.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                    {allPhotos.map((photo, index) => (
                      <SortablePhotoItem
                        key={photo.id}
                        photo={photo}
                        index={index}
                        onRemove={handleRemovePhoto}
                        isDeleting={deletingPhotoId === photo.id}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {/* Add Photos Button */}
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
                disabled={allPhotos.length >= 10}
              >
                <Upload className="mr-2 h-4 w-4" />
                Adicionar Fotos
              </Button>
            </div>
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

      {/* Success Dialog with Terms */}
      <Dialog open={showSuccessDialog} onOpenChange={(open) => {
        setShowSuccessDialog(open);
        if (!open) setTermsAccepted(false);
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden">
          <DialogHeader className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <DialogTitle className="text-xl text-center">Imóvel Cadastrado com Sucesso!</DialogTitle>
            <DialogDescription className="text-base text-center">
              Seu imóvel foi enviado para aprovação. Para prosseguir, leia e aceite os termos abaixo.
            </DialogDescription>
          </DialogHeader>
          
          {/* Authorization Terms */}
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Termos de Autorização</h4>
            <ScrollArea className="h-48 w-full rounded-md border p-4 text-sm text-muted-foreground">
              <div className="space-y-3 pr-4">
                <p><strong>1ª)</strong> A presente autorização, SEM EXCLUSIVIDADE, tem seu amparo na Lei 6.530, Art. 20, Item III e Artigos 722 a 729 do Código Civil Brasileiro.</p>
                <p><strong>2ª)</strong> Fica autorizada a colocação de placas, publicação de anúncios, a promoção e a intermediação da venda do imóvel acima descrito.</p>
                <p><strong>3ª)</strong> Esta autorização é concedida pelo prazo de 90 dias a contar desta data, prorrogada automaticamente, caso o(a)(s) contratante(s), após o término do prazo, não se manifeste(m) expressamente por escrito.</p>
                <p><strong>4ª)</strong> O(a)(s) contratante(s) se compromete(m) a pagar os honorários de 5%, desde que a compra, venda ou permuta, ora iniciada, intermediada por esta empresa, associadas ou associados, ocorra dentro do prazo acima estipulado, ou na sua prorrogação.</p>
                <p><strong>5ª)</strong> As informações contidas neste documento são de inteira responsabilidade do(a)(s) proprietário(a)(s) do imóvel.</p>
              </div>
            </ScrollArea>
          </div>

          {/* Terms Acceptance Checkbox */}
          <div className="flex items-start gap-3 mt-4">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            />
            <label htmlFor="terms" className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Li e aceito os termos de autorização acima
            </label>
          </div>

          <DialogFooter className="mt-4 sm:justify-center">
            <Button 
              variant="whatsapp" 
              onClick={handleWhatsAppRedirect} 
              disabled={!termsAccepted}
              className="w-full sm:w-auto"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Ir para o WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
