
-- Create a function to check if current user is supervisor of a specific delegate
CREATE OR REPLACE FUNCTION public.is_current_user_supervisor_of(delegate_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = delegate_id 
    AND supervisor_id = auth.uid()
    AND role = 'Delegate'
  );
$$;

-- Add supervisor access policies for visit_plans
CREATE POLICY "Supervisors can view their delegates' visit plans" ON public.visit_plans
  FOR SELECT USING (
    public.is_current_user_supervisor_of(delegate_id)
  );

-- Add supervisor access policies for visits
CREATE POLICY "Supervisors can view their delegates' visits" ON public.visits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.visit_plans vp
      WHERE vp.id = visit_plan_id 
      AND public.is_current_user_supervisor_of(vp.delegate_id)
    )
  );

-- Add supervisor access policies for sales_plans
CREATE POLICY "Supervisors can view their delegates' sales plans" ON public.sales_plans
  FOR SELECT USING (
    public.is_current_user_supervisor_of(delegate_id)
  );

-- Add supervisor access policies for sales
CREATE POLICY "Supervisors can view their delegates' sales" ON public.sales
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sales_plans sp
      WHERE sp.id = sales_plan_id 
      AND public.is_current_user_supervisor_of(sp.delegate_id)
    )
  );
