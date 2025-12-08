-- Allow everyone to view active hotels for ticket creation
CREATE POLICY "Everyone can view active hotels"
ON public.hotels
FOR SELECT
USING (is_active = true);