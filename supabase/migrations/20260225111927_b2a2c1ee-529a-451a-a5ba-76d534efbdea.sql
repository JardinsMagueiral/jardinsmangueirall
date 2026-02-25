
-- Fix classificados RLS: drop restrictive policies and recreate as permissive

-- SELECT policies
DROP POLICY IF EXISTS "Admins can view all classificados" ON public.classificados;
DROP POLICY IF EXISTS "Anyone can view approved classificados" ON public.classificados;
DROP POLICY IF EXISTS "Users can view their own classificados" ON public.classificados;

CREATE POLICY "Admins can view all classificados" ON public.classificados
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view approved classificados" ON public.classificados
  FOR SELECT USING (status = 'aprovado'::text);

CREATE POLICY "Users can view their own classificados" ON public.classificados
  FOR SELECT USING (auth.uid() = user_id);

-- UPDATE policies
DROP POLICY IF EXISTS "Admins can update all classificados" ON public.classificados;
DROP POLICY IF EXISTS "Users can update their own pending classificados" ON public.classificados;

CREATE POLICY "Admins can update all classificados" ON public.classificados
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their own pending classificados" ON public.classificados
  FOR UPDATE USING ((auth.uid() = user_id) AND (status = ANY (ARRAY['pendente'::text, 'rejeitado'::text])));

-- DELETE policies
DROP POLICY IF EXISTS "Admins can delete all classificados" ON public.classificados;
DROP POLICY IF EXISTS "Users can delete their own classificados" ON public.classificados;

CREATE POLICY "Admins can delete all classificados" ON public.classificados
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete their own classificados" ON public.classificados
  FOR DELETE USING (auth.uid() = user_id);

-- INSERT policy
DROP POLICY IF EXISTS "Users can create their own classificados" ON public.classificados;

CREATE POLICY "Users can create their own classificados" ON public.classificados
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Also fix classificado_fotos RLS
DROP POLICY IF EXISTS "Admins can manage all classificado photos" ON public.classificado_fotos;
DROP POLICY IF EXISTS "Anyone can view photos of approved classificados" ON public.classificado_fotos;
DROP POLICY IF EXISTS "Users can view photos of their own classificados" ON public.classificado_fotos;
DROP POLICY IF EXISTS "Users can insert photos for their own classificados" ON public.classificado_fotos;
DROP POLICY IF EXISTS "Users can delete photos of their own classificados" ON public.classificado_fotos;

CREATE POLICY "Admins can manage all classificado photos" ON public.classificado_fotos
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view photos of approved classificados" ON public.classificado_fotos
  FOR SELECT USING (EXISTS (SELECT 1 FROM classificados WHERE classificados.id = classificado_fotos.classificado_id AND classificados.status = 'aprovado'::text));

CREATE POLICY "Users can view photos of their own classificados" ON public.classificado_fotos
  FOR SELECT USING (EXISTS (SELECT 1 FROM classificados WHERE classificados.id = classificado_fotos.classificado_id AND classificados.user_id = auth.uid()));

CREATE POLICY "Users can insert photos for their own classificados" ON public.classificado_fotos
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM classificados WHERE classificados.id = classificado_fotos.classificado_id AND classificados.user_id = auth.uid()));

CREATE POLICY "Users can delete photos of their own classificados" ON public.classificado_fotos
  FOR DELETE USING (EXISTS (SELECT 1 FROM classificados WHERE classificados.id = classificado_fotos.classificado_id AND classificados.user_id = auth.uid()));
