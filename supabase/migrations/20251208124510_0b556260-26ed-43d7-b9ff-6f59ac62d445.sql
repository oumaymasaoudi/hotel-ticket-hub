-- Permettre aux admins de voir les user_roles de leur hôtel
CREATE POLICY "Admins can view roles in their hotel" 
ON public.user_roles 
FOR SELECT 
USING (
  hotel_id IN (
    SELECT hotel_id FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);