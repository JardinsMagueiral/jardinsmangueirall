-- =====================================================
-- SQL CONSOLIDADO - Jardins Mangueiral
-- Execute este arquivo inteiro no SQL Editor do Supabase
-- Projeto: Jardins mangueiral2
-- =====================================================

-- =====================================================
-- 1. ENUM
-- =====================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- =====================================================
-- 2. FUNÇÕES UTILITÁRIAS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Função para verificar roles (SECURITY DEFINER evita recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN _user_id IS NULL THEN false
    ELSE EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id AND role = _role
    )
  END
$$;

-- Função para criar profile automaticamente no cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome, telefone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'telefone', '')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- 3. TABELAS
-- =====================================================

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  cpf TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- USER_ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- IMOVEIS
CREATE TABLE public.imoveis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tipo TEXT NOT NULL,
  operacao TEXT NOT NULL,
  endereco TEXT NOT NULL,
  numero TEXT,
  complemento TEXT,
  bairro TEXT DEFAULT 'Jardins Mangueiral',
  cep TEXT,
  quartos INTEGER DEFAULT 0,
  banheiros INTEGER DEFAULT 0,
  vagas INTEGER DEFAULT 0,
  area_m2 NUMERIC,
  preco NUMERIC NOT NULL,
  condominio NUMERIC,
  iptu NUMERIC,
  descricao TEXT,
  mobiliado BOOLEAN DEFAULT false,
  aceita_pets BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pendente',
  destaque BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.imoveis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved properties"
  ON public.imoveis AS PERMISSIVE FOR SELECT TO public
  USING (status = 'aprovado');

CREATE POLICY "Users can view their own properties"
  ON public.imoveis AS PERMISSIVE FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all properties"
  ON public.imoveis AS PERMISSIVE FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own properties"
  ON public.imoveis FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending properties"
  ON public.imoveis FOR UPDATE TO public
  USING (auth.uid() = user_id AND status IN ('pendente', 'rejeitado'));

CREATE POLICY "Admins can update all properties"
  ON public.imoveis FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their own properties"
  ON public.imoveis FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete all properties"
  ON public.imoveis FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_imoveis_updated_at
  BEFORE UPDATE ON public.imoveis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- IMOVEL_FOTOS
CREATE TABLE public.imovel_fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imovel_id UUID REFERENCES public.imoveis(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.imovel_fotos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view photos of approved properties"
  ON public.imovel_fotos AS PERMISSIVE FOR SELECT TO public
  USING (EXISTS (SELECT 1 FROM imoveis WHERE imoveis.id = imovel_fotos.imovel_id AND imoveis.status = 'aprovado'));

CREATE POLICY "Users can view photos of their own properties"
  ON public.imovel_fotos AS PERMISSIVE FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM imoveis WHERE imoveis.id = imovel_fotos.imovel_id AND imoveis.user_id = auth.uid()));

CREATE POLICY "Users can insert photos for their own properties"
  ON public.imovel_fotos FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM imoveis WHERE imoveis.id = imovel_fotos.imovel_id AND imoveis.user_id = auth.uid()));

CREATE POLICY "Users can update photos of their own properties"
  ON public.imovel_fotos FOR UPDATE
  USING (EXISTS (SELECT 1 FROM imoveis WHERE imoveis.id = imovel_fotos.imovel_id AND imoveis.user_id = auth.uid()));

CREATE POLICY "Users can delete photos of their own properties"
  ON public.imovel_fotos FOR DELETE
  USING (EXISTS (SELECT 1 FROM imoveis WHERE imoveis.id = imovel_fotos.imovel_id AND imoveis.user_id = auth.uid()));

CREATE POLICY "Admins can manage all photos"
  ON public.imovel_fotos FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- CLASSIFICADOS
CREATE TABLE public.classificados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  preco NUMERIC NOT NULL,
  categoria TEXT NOT NULL,
  contato_whatsapp TEXT NOT NULL,
  status TEXT DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.classificados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved classificados"
  ON public.classificados FOR SELECT USING (status = 'aprovado');

CREATE POLICY "Users can view their own classificados"
  ON public.classificados FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all classificados"
  ON public.classificados FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own classificados"
  ON public.classificados FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending classificados"
  ON public.classificados FOR UPDATE USING (auth.uid() = user_id AND status IN ('pendente', 'rejeitado'));

CREATE POLICY "Admins can update all classificados"
  ON public.classificados FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their own classificados"
  ON public.classificados FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete all classificados"
  ON public.classificados FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_classificados_updated_at
  BEFORE UPDATE ON public.classificados
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CLASSIFICADO_FOTOS
CREATE TABLE public.classificado_fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classificado_id UUID NOT NULL REFERENCES public.classificados(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.classificado_fotos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view photos of approved classificados"
  ON public.classificado_fotos FOR SELECT
  USING (EXISTS (SELECT 1 FROM classificados WHERE classificados.id = classificado_fotos.classificado_id AND classificados.status = 'aprovado'));

CREATE POLICY "Users can view photos of their own classificados"
  ON public.classificado_fotos FOR SELECT
  USING (EXISTS (SELECT 1 FROM classificados WHERE classificados.id = classificado_fotos.classificado_id AND classificados.user_id = auth.uid()));

CREATE POLICY "Users can insert photos for their own classificados"
  ON public.classificado_fotos FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM classificados WHERE classificados.id = classificado_fotos.classificado_id AND classificados.user_id = auth.uid()));

CREATE POLICY "Users can delete photos of their own classificados"
  ON public.classificado_fotos FOR DELETE
  USING (EXISTS (SELECT 1 FROM classificados WHERE classificados.id = classificado_fotos.classificado_id AND classificados.user_id = auth.uid()));

CREATE POLICY "Admins can manage all classificado photos"
  ON public.classificado_fotos FOR ALL USING (has_role(auth.uid(), 'admin'));

-- PARCEIROS
CREATE TABLE public.parceiros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  categoria text NOT NULL,
  descricao text,
  telefone text NOT NULL,
  email text,
  instagram text,
  site text,
  endereco text,
  logo_url text,
  user_id uuid,
  status text DEFAULT 'pendente',
  destaque boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.parceiros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved partners"
  ON public.parceiros FOR SELECT USING (status = 'aprovado');

CREATE POLICY "Users can view their own partners"
  ON public.parceiros FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create partners"
  ON public.parceiros FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all partners"
  ON public.parceiros FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all partners"
  ON public.parceiros FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all partners"
  ON public.parceiros FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own pending/rejected partners"
  ON public.parceiros FOR UPDATE
  USING (auth.uid() = user_id AND status IN ('pendente', 'rejeitado'))
  WITH CHECK (auth.uid() = user_id AND status IN ('pendente', 'rejeitado'));

CREATE TRIGGER update_parceiros_updated_at
  BEFORE UPDATE ON public.parceiros
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- PARCEIRO_FOTOS
CREATE TABLE public.parceiro_fotos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parceiro_id uuid NOT NULL REFERENCES public.parceiros(id) ON DELETE CASCADE,
  url text NOT NULL,
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.parceiro_fotos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view photos of approved partners"
  ON public.parceiro_fotos FOR SELECT
  USING (EXISTS (SELECT 1 FROM parceiros WHERE parceiros.id = parceiro_fotos.parceiro_id AND parceiros.status = 'aprovado'));

CREATE POLICY "Users can view photos of their own partners"
  ON public.parceiro_fotos FOR SELECT
  USING (EXISTS (SELECT 1 FROM parceiros WHERE parceiros.id = parceiro_fotos.parceiro_id AND parceiros.user_id = auth.uid()));

CREATE POLICY "Users can insert photos for their own partners"
  ON public.parceiro_fotos FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM parceiros WHERE parceiros.id = parceiro_fotos.parceiro_id AND parceiros.user_id = auth.uid()));

CREATE POLICY "Users can delete photos of their own partners"
  ON public.parceiro_fotos FOR DELETE
  USING (EXISTS (SELECT 1 FROM parceiros WHERE parceiros.id = parceiro_fotos.parceiro_id AND parceiros.user_id = auth.uid()));

CREATE POLICY "Admins can manage all partner photos"
  ON public.parceiro_fotos FOR ALL USING (has_role(auth.uid(), 'admin'));

-- QUADRAS
CREATE TABLE public.quadras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero integer NOT NULL UNIQUE,
  nome text NOT NULL,
  telefone text NOT NULL,
  email text NOT NULL,
  taxa_condominio numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.quadras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quadras"
  ON public.quadras FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage quadras"
  ON public.quadras FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- QUADRA_FOTOS
CREATE TABLE public.quadra_fotos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quadra_id uuid NOT NULL REFERENCES public.quadras(id) ON DELETE CASCADE,
  url text NOT NULL,
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.quadra_fotos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quadra photos"
  ON public.quadra_fotos FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage quadra photos"
  ON public.quadra_fotos FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- EVENTOS
CREATE TABLE public.eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data date NOT NULL,
  titulo text NOT NULL,
  descricao text,
  status text DEFAULT 'pendente',
  user_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved events"
  ON public.eventos FOR SELECT USING (status = 'aprovado');

CREATE POLICY "Admins can view all events"
  ON public.eventos FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can create events"
  ON public.eventos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update events"
  ON public.eventos FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete events"
  ON public.eventos FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- NOTICIAS
CREATE TABLE public.noticias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  titulo text NOT NULL,
  descricao text,
  link text,
  imagem_url text,
  status text DEFAULT 'pendente',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.noticias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved noticias"
  ON public.noticias FOR SELECT USING (status = 'aprovado');

CREATE POLICY "Users can view their own noticias"
  ON public.noticias FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create noticias"
  ON public.noticias FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all noticias"
  ON public.noticias FOR ALL USING (has_role(auth.uid(), 'admin'));

-- WHATSAPP_GRUPOS
CREATE TABLE public.whatsapp_grupos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  link TEXT NOT NULL,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.whatsapp_grupos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active groups"
  ON public.whatsapp_grupos FOR SELECT USING (ativo = true);

CREATE POLICY "Admins can manage all groups"
  ON public.whatsapp_grupos FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- AUDIT_LOG
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON public.audit_log FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert audit logs"
  ON public.audit_log FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

-- =====================================================
-- 4. TRIGGER DE AUTH (cria profile + role no cadastro)
-- =====================================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 5. STORAGE BUCKETS
-- =====================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('imoveis', 'imoveis', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('parceiros', 'parceiros', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('classificados', 'classificados', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('quadras', 'quadras', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('noticias', 'noticias', true);

-- Limites de tamanho e tipos MIME
UPDATE storage.buckets 
SET file_size_limit = 5242880, allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'] 
WHERE id IN ('imoveis', 'parceiros', 'classificados', 'quadras', 'noticias');

-- =====================================================
-- 6. STORAGE POLICIES
-- =====================================================

-- Imóveis
CREATE POLICY "Anyone can view property images"
  ON storage.objects FOR SELECT USING (bucket_id = 'imoveis');

CREATE POLICY "Authenticated users can upload property images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'imoveis' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own property images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'imoveis' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can delete any property images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'imoveis' AND public.has_role(auth.uid(), 'admin'));

-- Parceiros
CREATE POLICY "Authenticated users can upload partner images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'parceiros');

CREATE POLICY "Anyone can view partner images"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'parceiros');

CREATE POLICY "Users can delete their own partner images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'parceiros');

-- Classificados
CREATE POLICY "Anyone can view classificado images"
  ON storage.objects FOR SELECT USING (bucket_id = 'classificados');

CREATE POLICY "Authenticated users can upload classificado images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'classificados' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own classificado images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'classificados' AND auth.role() = 'authenticated');

-- Quadras
CREATE POLICY "Anyone can view quadra images"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'quadras');

CREATE POLICY "Admins can upload quadra images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'quadras' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete quadra images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'quadras' AND has_role(auth.uid(), 'admin'::app_role));

-- Notícias
CREATE POLICY "Anyone can view noticia images"
  ON storage.objects FOR SELECT USING (bucket_id = 'noticias');

CREATE POLICY "Authenticated users can upload noticia images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'noticias' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own noticia images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'noticias' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can manage all noticia images"
  ON storage.objects FOR ALL
  USING (bucket_id = 'noticias' AND has_role(auth.uid(), 'admin'));

-- =====================================================
-- 7. DADOS INICIAIS (Quadras + Grupos WhatsApp)
-- =====================================================

INSERT INTO public.quadras (numero, nome, telefone, email, taxa_condominio) VALUES
  (1, 'Jardins dos Jacarandás', '3427-9016 / 3248-2765', 'COND.JARDIMJACARANDAS@GMAIL.COM', 360.53),
  (2, 'Jardins dos Muricis', '3055-8141', 'CONDOMINIOJARDINSDOSMURICIS@GMAIL.COM', 390.62),
  (3, 'Jardins dos Pequis', '3427-9505', 'JM.JARDINSDOSPEQUIS@GMAIL.COM', 293.90),
  (4, 'Jardins dos Tinguis', '3427-9231', 'ADMINISTRACAO@JTINGUIS.COM', 352.55),
  (5, 'Jardins das Paineiras', '999852502 / 996213639', 'ADMJARDINSDASPAINEIRAS@GMAIL.COM', 361.45),
  (6, 'Jardins das Salácias', '3054-6259', 'ADM.SALACIAS@GMAIL.COM', 253.61),
  (7, 'Jardins dos Tapiris', '998335073', 'TAPIRIS2019@GMAIL.COM', 339.64),
  (8, 'Jardins Quaresmeiras', '3054-5973', 'ADM8QUARESMEIRA@GMAIL.COM', 290.04),
  (9, 'Jardins dos Jatobás', '99822-5287 / 3055-7435 / 3055-8550', 'CONDOMINIOJARDINSDOSJATOBAS@GMAIL.COM', 344.45),
  (10, 'Jardins das Caviúnas', '99676-3868 / 3011-4777', 'CONDOMINIOJARDINSDASCAVIUNAS@GMAIL.COM', 256.84),
  (11, 'Jardins dos Angelins', '3052-7078', 'CONDOMINIOANGELISQC11@GMAIL.COM', 292.93),
  (12, 'Jardins das Mangabeiras', '3427-5022 / 3248-4382', 'JARDIMDASMANGABEIRAS@GMAIL.COM', 333.24),
  (13, 'Jardins dos Buritis', '3427-8341', 'JARDINSDOSBURITIS.QC13@GMAIL.COM', 283.52),
  (14, 'Jardins das Acácias', '3055-7792', 'JARDIMDASACACIAS14@GMAIL.COM', 319.85),
  (15, 'Jardins dos Ipês', '3427-8343', 'CONDOMINIOJARDIMDOSIPES@GMAIL.COM', 268.03);

INSERT INTO public.whatsapp_grupos (titulo, descricao, link, ordem) VALUES
  ('Geral 🔊', 'Grupo principal da comunidade', 'https://chat.whatsapp.com/GH1XuLDJfKP4be24ullSCD', 1),
  ('Geral 2 🔊', 'Segundo grupo geral', 'https://chat.whatsapp.com/DrIx3XxBW8h2CuqQSj0q1F', 2),
  ('Carona 🚕', 'Encontre ou ofereça caronas', 'https://chat.whatsapp.com/BoCnDmejx5wGLgTweIk782', 3),
  ('Imóveis 🏡', 'Compra, venda e aluguel', 'https://chat.whatsapp.com/DGIxINfCoLw8rAt2BKMuoj', 4),
  ('Desapego 🛍️', 'Classificados da comunidade', 'https://chat.whatsapp.com/LtNPTADfoSK24EjGsFubsp', 5);

-- =====================================================
-- FIM - Verifique que tudo foi executado sem erros!
-- =====================================================
