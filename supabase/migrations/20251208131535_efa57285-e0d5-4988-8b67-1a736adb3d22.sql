-- Permettre aux admins de voir les profils des techniciens de leur hôtel
CREATE POLICY "Admins can view profiles in their hotel" 
ON public.profiles 
FOR SELECT 
USING (
  id IN (
    SELECT user_id FROM public.user_roles 
    WHERE hotel_id IN (
      SELECT hotel_id FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
);