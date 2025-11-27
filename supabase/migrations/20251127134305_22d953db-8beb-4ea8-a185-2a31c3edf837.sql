-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('client', 'technician', 'admin', 'superadmin');

-- Create enum for ticket status
CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'pending', 'resolved', 'closed');

-- Create enum for subscription plans
CREATE TYPE public.subscription_plan AS ENUM ('starter', 'pro', 'enterprise');

-- Create plans table
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name subscription_plan UNIQUE NOT NULL,
  base_cost DECIMAL(10,2) NOT NULL,
  max_technicians INTEGER NOT NULL,
  ticket_quota INTEGER NOT NULL,
  excess_ticket_cost DECIMAL(10,2) NOT NULL,
  sla_hours INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default plans
INSERT INTO public.plans (name, base_cost, max_technicians, ticket_quota, excess_ticket_cost, sla_hours) VALUES
('starter', 99.00, 3, 50, 2.00, 48),
('pro', 299.00, 10, 200, 1.50, 24),
('enterprise', 799.00, 999, 999999, 1.00, 12);

-- Create hotels table
CREATE TABLE public.hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan_id UUID REFERENCES public.plans(id) NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  last_payment_date TIMESTAMP WITH TIME ZONE,
  next_payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  hotel_id UUID REFERENCES public.hotels(id),
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_roles table (CRITICAL: roles in separate table)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  hotel_id UUID REFERENCES public.hotels(id),
  UNIQUE(user_id, role, hotel_id)
);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  is_mandatory BOOLEAN DEFAULT true,
  additional_cost DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert mandatory categories
INSERT INTO public.categories (name, icon, color, is_mandatory) VALUES
('Electricité', 'Zap', '#F59E0B', true),
('Plomberie', 'Droplet', '#3B82F6', true),
('Climatisation / Chauffage', 'Snowflake', '#06B6D4', true),
('Internet / WiFi', 'Wifi', '#8B5CF6', true),
('Serrurerie', 'Key', '#EF4444', true),
('Chambre', 'Bed', '#10B981', true),
('Salle de bain', 'Bath', '#EC4899', true),
('Bruit', 'Volume2', '#F97316', true),
('Propreté', 'Sparkles', '#14B8A6', true),
('Sécurité', 'Shield', '#6366F1', true),
('Restauration / Room Service', 'UtensilsCrossed', '#84CC16', true),
('Autres', 'Package', '#6B7280', true);

-- Create tickets table
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  hotel_id UUID REFERENCES public.hotels(id) NOT NULL,
  category_id UUID REFERENCES public.categories(id) NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  description TEXT NOT NULL,
  is_urgent BOOLEAN DEFAULT false,
  status ticket_status DEFAULT 'open',
  assigned_technician_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  sla_deadline TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hotels
CREATE POLICY "SuperAdmins can do everything on hotels"
  ON public.hotels FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins can view their hotel"
  ON public.hotels FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT hotel_id FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Technicians can view their hotel"
  ON public.hotels FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT hotel_id FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'technician'
    )
  );

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "SuperAdmins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "SuperAdmins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

-- RLS Policies for categories
CREATE POLICY "Everyone can view categories"
  ON public.categories FOR SELECT
  TO authenticated, anon
  USING (true);

-- RLS Policies for tickets
CREATE POLICY "Anyone can create tickets"
  ON public.tickets FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "SuperAdmins can view all tickets"
  ON public.tickets FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins can view their hotel tickets"
  ON public.tickets FOR SELECT
  TO authenticated
  USING (
    hotel_id IN (
      SELECT hotel_id FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Technicians can view assigned tickets"
  ON public.tickets FOR SELECT
  TO authenticated
  USING (assigned_technician_id = auth.uid());

CREATE POLICY "Clients can view their tickets"
  ON public.tickets FOR SELECT
  TO authenticated, anon
  USING (client_email = auth.email());

-- RLS Policies for plans
CREATE POLICY "Everyone can view plans"
  ON public.plans FOR SELECT
  TO authenticated, anon
  USING (true);

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_number TEXT;
BEGIN
  new_number := 'TK-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
  RETURN new_number;
END;
$$;

-- Trigger to auto-generate ticket number
CREATE OR REPLACE FUNCTION public.set_ticket_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := public.generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER before_insert_ticket
  BEFORE INSERT ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.set_ticket_number();

-- Trigger to set SLA deadline on ticket creation
CREATE OR REPLACE FUNCTION public.set_sla_deadline()
RETURNS TRIGGER
LANGUAGE plpgsql
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

CREATE TRIGGER before_insert_ticket_sla
  BEFORE INSERT ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.set_sla_deadline();

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_hotels_updated_at
  BEFORE UPDATE ON public.hotels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();