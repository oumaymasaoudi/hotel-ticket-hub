-- Table de liaison entre techniciens et catégories
CREATE TABLE public.technician_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  technician_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(technician_id, category_id)
);

-- Enable RLS
ALTER TABLE public.technician_categories ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "SuperAdmins can manage all technician categories"
ON public.technician_categories
FOR ALL
USING (has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins can manage technician categories for their hotel"
ON public.technician_categories
FOR ALL
USING (
  technician_id IN (
    SELECT user_id FROM user_roles 
    WHERE role = 'technician' 
    AND hotel_id IN (
      SELECT hotel_id FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
);

CREATE POLICY "Technicians can view their own categories"
ON public.technician_categories
FOR SELECT
USING (technician_id = auth.uid());

CREATE POLICY "Everyone can view technician categories"
ON public.technician_categories
FOR SELECT
USING (true);