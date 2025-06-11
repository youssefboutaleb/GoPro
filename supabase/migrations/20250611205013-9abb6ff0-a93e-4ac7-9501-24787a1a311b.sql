
-- Enable RLS for equipes table and create policies
-- Create policy that allows authenticated users to view all equipes
CREATE POLICY "Allow authenticated users to view equipes" 
  ON public.equipes 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Create policy that allows authenticated users to insert equipes
CREATE POLICY "Allow authenticated users to create equipes" 
  ON public.equipes 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Create policy that allows authenticated users to update equipes
CREATE POLICY "Allow authenticated users to update equipes" 
  ON public.equipes 
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Create policy that allows authenticated users to delete equipes
CREATE POLICY "Allow authenticated users to delete equipes" 
  ON public.equipes 
  FOR DELETE 
  TO authenticated
  USING (true);
