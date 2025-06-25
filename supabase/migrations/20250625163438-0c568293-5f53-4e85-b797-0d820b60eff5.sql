
-- Create comprehensive RLS policies for visits table to allow INSERT operations
CREATE POLICY "Users can insert visits for their visit plans" 
ON public.visits 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.visit_plans vp 
    WHERE vp.id = visit_plan_id 
    AND vp.delegate_id = auth.uid()
  )
);

-- Ensure users can view visits for their visit plans (might already exist)
DROP POLICY IF EXISTS "Users can view visits for their visit plans" ON public.visits;
CREATE POLICY "Users can view visits for their visit plans" 
ON public.visits 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.visit_plans vp 
    WHERE vp.id = visit_plan_id 
    AND vp.delegate_id = auth.uid()
  )
);

-- Allow users to update visits for their visit plans
CREATE POLICY "Users can update visits for their visit plans" 
ON public.visits 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.visit_plans vp 
    WHERE vp.id = visit_plan_id 
    AND vp.delegate_id = auth.uid()
  )
);

-- Allow users to delete visits for their visit plans
CREATE POLICY "Users can delete visits for their visit plans" 
ON public.visits 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.visit_plans vp 
    WHERE vp.id = visit_plan_id 
    AND vp.delegate_id = auth.uid()
  )
);
