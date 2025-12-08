-- Créer le bucket pour les images de tickets
INSERT INTO storage.buckets (id, name, public)
VALUES ('ticket-images', 'ticket-images', true);

-- Politique: Tout le monde peut voir les images
CREATE POLICY "Anyone can view ticket images"
ON storage.objects FOR SELECT
USING (bucket_id = 'ticket-images');

-- Politique: Les utilisateurs authentifiés peuvent uploader
CREATE POLICY "Authenticated users can upload ticket images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ticket-images');

-- Politique: Les admins et techniciens peuvent supprimer
CREATE POLICY "Staff can delete ticket images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ticket-images' AND (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'technician') OR
    public.has_role(auth.uid(), 'superadmin')
  )
);

-- Table pour stocker les références des images
CREATE TABLE public.ticket_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ticket_images ENABLE ROW LEVEL SECURITY;

-- Policies pour ticket_images
CREATE POLICY "Anyone can view ticket images metadata"
ON public.ticket_images FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert ticket images during creation"
ON public.ticket_images FOR INSERT
WITH CHECK (true);

CREATE POLICY "Staff can delete ticket images"
ON public.ticket_images FOR DELETE
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'technician') OR
  public.has_role(auth.uid(), 'superadmin')
);