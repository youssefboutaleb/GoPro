
-- Enable RLS on visits table if not already enabled
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

-- Allow users to insert visits for visit plans they have access to
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

-- Allow users to view visits for visit plans they have access to
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

-- Allow users to update visits for visit plans they have access to
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

-- Allow users to delete visits for visit plans they have access to
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
