-- Supprimer la politique récursive
DROP POLICY IF EXISTS "Admins can view roles in their hotel" ON public.user_roles;

-- Créer une fonction security definer pour obtenir le hotel_id de l'admin
CREATE OR REPLACE FUNCTION public.get_admin_hotel_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT hotel_id
  FROM public.user_roles
  WHERE user_id = _user_id
    AND role = 'admin'
  LIMIT 1
$$;

-- Recréer la politique sans récursion
CREATE POLICY "Admins can view roles in their hotel" 
ON public.user_roles 
FOR SELECT 
USING (
  hotel_id = public.get_admin_hotel_id(auth.uid())
);