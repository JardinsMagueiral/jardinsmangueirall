-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  cpf TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- User roles policies (users can only see their own roles)
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create imoveis table
CREATE TABLE public.imoveis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Tipo e Operação
  tipo TEXT NOT NULL CHECK (tipo IN ('casa', 'apartamento', 'terreno', 'comercial')),
  operacao TEXT NOT NULL CHECK (operacao IN ('venda', 'aluguel')),
  
  -- Localização
  endereco TEXT NOT NULL,
  numero TEXT,
  complemento TEXT,
  bairro TEXT DEFAULT 'Jardins Mangueiral',
  cep TEXT,
  
  -- Características
  quartos INTEGER DEFAULT 0,
  banheiros INTEGER DEFAULT 0,
  vagas INTEGER DEFAULT 0,
  area_m2 DECIMAL(10,2),
  
  -- Valores
  preco DECIMAL(12,2) NOT NULL,
  condominio DECIMAL(10,2),
  iptu DECIMAL(10,2),
  
  -- Extras
  descricao TEXT,
  mobiliado BOOLEAN DEFAULT false,
  aceita_pets BOOLEAN DEFAULT false,
  
  -- Status e Controle
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado', 'inativo')),
  destaque BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on imoveis
ALTER TABLE public.imoveis ENABLE ROW LEVEL SECURITY;

-- Imoveis policies
CREATE POLICY "Anyone can view approved properties"
  ON public.imoveis FOR SELECT
  USING (status = 'aprovado');

CREATE POLICY "Users can view their own properties"
  ON public.imoveis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own properties"
  ON public.imoveis FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own properties"
  ON public.imoveis FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own properties"
  ON public.imoveis FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all properties"
  ON public.imoveis FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all properties"
  ON public.imoveis FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all properties"
  ON public.imoveis FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create imovel_fotos table
CREATE TABLE public.imovel_fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imovel_id UUID REFERENCES public.imoveis(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on imovel_fotos
ALTER TABLE public.imovel_fotos ENABLE ROW LEVEL SECURITY;

-- Imovel fotos policies
CREATE POLICY "Anyone can view photos of approved properties"
  ON public.imovel_fotos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.imoveis
      WHERE id = imovel_id AND status = 'aprovado'
    )
  );

CREATE POLICY "Users can view photos of their own properties"
  ON public.imovel_fotos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.imoveis
      WHERE id = imovel_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert photos for their own properties"
  ON public.imovel_fotos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.imoveis
      WHERE id = imovel_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete photos of their own properties"
  ON public.imovel_fotos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.imoveis
      WHERE id = imovel_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all photos"
  ON public.imovel_fotos FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('imoveis', 'imoveis', true);

-- Storage policies
CREATE POLICY "Anyone can view property images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'imoveis');

CREATE POLICY "Authenticated users can upload property images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'imoveis' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own property images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'imoveis' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can delete any property images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'imoveis' AND public.has_role(auth.uid(), 'admin'));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_imoveis_updated_at
  BEFORE UPDATE ON public.imoveis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on signup
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
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for auto-creating profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();