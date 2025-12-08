-- Create ticket_history table for tracking status changes and technician assignments
CREATE TABLE public.ticket_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'status_change', 'technician_assigned', 'technician_removed', 'created', 'comment'
  old_value TEXT,
  new_value TEXT,
  performed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ticket_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view their hotel ticket history"
ON public.ticket_history
FOR SELECT
USING (
  ticket_id IN (
    SELECT t.id FROM public.tickets t
    WHERE t.hotel_id IN (
      SELECT hotel_id FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
);

CREATE POLICY "Admins can insert ticket history for their hotel"
ON public.ticket_history
FOR INSERT
WITH CHECK (
  ticket_id IN (
    SELECT t.id FROM public.tickets t
    WHERE t.hotel_id IN (
      SELECT hotel_id FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
);

CREATE POLICY "Technicians can view their ticket history"
ON public.ticket_history
FOR SELECT
USING (
  ticket_id IN (
    SELECT id FROM public.tickets
    WHERE assigned_technician_id = auth.uid()
  )
);

CREATE POLICY "Technicians can insert history for their tickets"
ON public.ticket_history
FOR INSERT
WITH CHECK (
  ticket_id IN (
    SELECT id FROM public.tickets
    WHERE assigned_technician_id = auth.uid()
  )
);

CREATE POLICY "SuperAdmins can view all ticket history"
ON public.ticket_history
FOR SELECT
USING (has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Anyone can view history for public ticket tracking"
ON public.ticket_history
FOR SELECT
USING (true);

-- Create index for performance
CREATE INDEX idx_ticket_history_ticket_id ON public.ticket_history(ticket_id);
CREATE INDEX idx_ticket_history_created_at ON public.ticket_history(created_at DESC);