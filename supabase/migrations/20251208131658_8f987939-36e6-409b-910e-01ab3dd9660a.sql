-- Permettre aux admins de mettre à jour les tickets de leur hôtel
CREATE POLICY "Admins can update their hotel tickets" 
ON public.tickets 
FOR UPDATE 
USING (
  hotel_id IN (
    SELECT hotel_id FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);