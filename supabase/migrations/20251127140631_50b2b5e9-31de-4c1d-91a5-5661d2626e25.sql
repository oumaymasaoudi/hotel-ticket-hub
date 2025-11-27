-- Fix security warnings: Add search_path to functions

-- Fix generate_ticket_number function
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_number TEXT;
BEGIN
  new_number := 'TK-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
  RETURN new_number;
END;
$$;

-- Fix set_ticket_number function
CREATE OR REPLACE FUNCTION public.set_ticket_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := public.generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$;

-- Fix set_sla_deadline function
CREATE OR REPLACE FUNCTION public.set_sla_deadline()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  plan_sla_hours INTEGER;
BEGIN
  SELECT p.sla_hours INTO plan_sla_hours
  FROM public.plans p
  INNER JOIN public.hotels h ON h.plan_id = p.id
  WHERE h.id = NEW.hotel_id;
  
  NEW.sla_deadline := NEW.created_at + (plan_sla_hours || ' hours')::INTERVAL;
  RETURN NEW;
END;
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;