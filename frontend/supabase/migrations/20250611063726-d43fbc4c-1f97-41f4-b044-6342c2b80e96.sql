
-- Enable RLS on medecins table
ALTER TABLE public.medecins ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for medecins table (admin access)
CREATE POLICY "Admins can view all doctors" 
  ON public.medecins 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create doctors" 
  ON public.medecins 
  FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update doctors" 
  ON public.medecins 
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete doctors" 
  ON public.medecins 
  FOR DELETE 
  USING (public.is_admin(auth.uid()));
