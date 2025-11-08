
-- Enable RLS for delegues table and create policies
-- Create policy that allows authenticated users to view all delegues
CREATE POLICY "Allow authenticated users to view delegues" 
  ON public.delegues 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Create policy that allows authenticated users to insert delegues
CREATE POLICY "Allow authenticated users to create delegues" 
  ON public.delegues 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Create policy that allows authenticated users to update delegues
CREATE POLICY "Allow authenticated users to update delegues" 
  ON public.delegues 
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Create policy that allows authenticated users to delete delegues
CREATE POLICY "Allow authenticated users to delete delegues" 
  ON public.delegues 
  FOR DELETE 
  TO authenticated
  USING (true);
