
-- Enable RLS on tables that don't have it yet
ALTER TABLE public.bricks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bricks table (admin access)
CREATE POLICY "Admins can view all bricks" 
  ON public.bricks 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create bricks" 
  ON public.bricks 
  FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update bricks" 
  ON public.bricks 
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete bricks" 
  ON public.bricks 
  FOR DELETE 
  USING (public.is_admin(auth.uid()));

-- Create RLS policies for produits table (admin access)
CREATE POLICY "Admins can view all products" 
  ON public.produits 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create products" 
  ON public.produits 
  FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update products" 
  ON public.produits 
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete products" 
  ON public.produits 
  FOR DELETE 
  USING (public.is_admin(auth.uid()));

-- Create RLS policies for visites table (admin access)
CREATE POLICY "Admins can view all visits" 
  ON public.visites 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create visits" 
  ON public.visites 
  FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update visits" 
  ON public.visites 
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete visits" 
  ON public.visites 
  FOR DELETE 
  USING (public.is_admin(auth.uid()));
