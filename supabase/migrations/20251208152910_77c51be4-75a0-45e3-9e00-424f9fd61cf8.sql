-- Table des commentaires sur les tickets
CREATE TABLE public.ticket_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;

-- Policies pour les commentaires
CREATE POLICY "Admins can manage comments for their hotel tickets"
ON public.ticket_comments FOR ALL
USING (
  ticket_id IN (
    SELECT t.id FROM public.tickets t
    WHERE t.hotel_id IN (
      SELECT ur.hotel_id FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  )
);

CREATE POLICY "Technicians can add comments to their assigned tickets"
ON public.ticket_comments FOR ALL
USING (
  ticket_id IN (
    SELECT id FROM public.tickets WHERE assigned_technician_id = auth.uid()
  )
);

CREATE POLICY "SuperAdmins can view all comments"
ON public.ticket_comments FOR SELECT
USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Anyone can view comments for public tracking"
ON public.ticket_comments FOR SELECT
USING (true);