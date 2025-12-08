-- Ajouter la politique UPDATE pour les techniciens sur leurs tickets assignés
CREATE POLICY "Technicians can update their assigned tickets" 
ON public.tickets 
FOR UPDATE 
USING (assigned_technician_id = auth.uid())
WITH CHECK (assigned_technician_id = auth.uid());