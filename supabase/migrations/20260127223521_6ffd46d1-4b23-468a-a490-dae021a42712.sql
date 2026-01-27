-- 1. Add UPDATE policy for imovel_fotos
CREATE POLICY "Users can update photos of their own properties"
  ON public.imovel_fotos FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM imoveis 
    WHERE imoveis.id = imovel_fotos.imovel_id 
    AND imoveis.user_id = auth.uid()
  ));

-- 2. Improve has_role function with NULL validation
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

-- 3. Create audit_log table for admin actions
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
  ON public.audit_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert audit logs"
  ON public.audit_log FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));