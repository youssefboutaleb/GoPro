
-- Enable RLS on secteur table
ALTER TABLE public.secteur ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for secteur table (admin access)
CREATE POLICY "Admins can view all secteurs" 
  ON public.secteur 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create secteurs" 
  ON public.secteur 
  FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update secteurs" 
  ON public.secteur 
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete secteurs" 
  ON public.secteur 
  FOR DELETE 
  USING (public.is_admin(auth.uid()));
