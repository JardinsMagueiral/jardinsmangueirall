
-- Tabela quadras
CREATE TABLE public.quadras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero integer NOT NULL UNIQUE,
  nome text NOT NULL,
  telefone text NOT NULL,
  email text NOT NULL,
  taxa_condominio numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela quadra_fotos
CREATE TABLE public.quadra_fotos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quadra_id uuid NOT NULL REFERENCES public.quadras(id) ON DELETE CASCADE,
  url text NOT NULL,
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- RLS quadras
ALTER TABLE public.quadras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quadras"
  ON public.quadras FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage quadras"
  ON public.quadras FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS quadra_fotos
ALTER TABLE public.quadra_fotos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quadra photos"
  ON public.quadra_fotos FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage quadra photos"
  ON public.quadra_fotos FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('quadras', 'quadras', true);

CREATE POLICY "Anyone can view quadra images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'quadras');

CREATE POLICY "Admins can upload quadra images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'quadras' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete quadra images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'quadras' AND has_role(auth.uid(), 'admin'::app_role));

-- Seed 15 quadras
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
