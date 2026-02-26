CREATE POLICY "Users can update their own pending/rejected partners"
ON public.parceiros FOR UPDATE
USING (auth.uid() = user_id AND status IN ('pendente', 'rejeitado'))
WITH CHECK (auth.uid() = user_id AND status IN ('pendente', 'rejeitado'));