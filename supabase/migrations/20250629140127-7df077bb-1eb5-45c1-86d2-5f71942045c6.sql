
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own action plans" ON public.action_plans;
DROP POLICY IF EXISTS "Delegates can view action plans targeting them" ON public.action_plans;
DROP POLICY IF EXISTS "Supervisors can view action plans targeting them" ON public.action_plans;
DROP POLICY IF EXISTS "Sales Directors can view action plans targeting them" ON public.action_plans;
DROP POLICY IF EXISTS "Supervisors can view action plans targeting their delegates" ON public.action_plans;
DROP POLICY IF EXISTS "Sales Directors can view action plans targeting their supervisors" ON public.action_plans;
DROP POLICY IF EXISTS "Sales Directors can view action plans targeting their delegates" ON public.action_plans;
DROP POLICY IF EXISTS "Marketing Managers can view all action plans" ON public.action_plans;
DROP POLICY IF EXISTS "Admins can view all action plans" ON public.action_plans;
DROP POLICY IF EXISTS "Users can create action plans" ON public.action_plans;
DROP POLICY IF EXISTS "Users can update their own action plans" ON public.action_plans;
DROP POLICY IF EXISTS "Admins can update all action plans" ON public.action_plans;
DROP POLICY IF EXISTS "Users can delete their own action plans" ON public.action_plans;
DROP POLICY IF EXISTS "Admins can delete all action plans" ON public.action_plans;

-- Create helper function to check if a user ID exists in target arrays
CREATE OR REPLACE FUNCTION public.user_in_target_array(user_id uuid, target_array text[])
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT CASE 
    WHEN target_array IS NULL THEN false
    ELSE user_id::text = ANY(target_array)
  END;
$$;

-- Create an overloaded version for uuid arrays
CREATE OR REPLACE FUNCTION public.user_in_target_array(user_id uuid, target_array uuid[])
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT CASE 
    WHEN target_array IS NULL THEN false
    ELSE user_id = ANY(target_array)
  END;
$$;

-- Enable RLS on action_plans table (already enabled, but safe to run)
ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;

-- Policy for users to view action plans they created
CREATE POLICY "Users can view their own action plans" ON public.action_plans
  FOR SELECT USING (created_by = auth.uid());

-- Policy for delegates to view action plans where they are targeted
CREATE POLICY "Delegates can view action plans targeting them" ON public.action_plans
  FOR SELECT USING (
    public.user_in_target_array(auth.uid(), targeted_delegates)
  );

-- Policy for supervisors to view action plans where they are targeted
CREATE POLICY "Supervisors can view action plans targeting them" ON public.action_plans
  FOR SELECT USING (
    public.user_in_target_array(auth.uid(), targeted_supervisors)
  );

-- Policy for sales directors to view action plans where they are targeted
CREATE POLICY "Sales Directors can view action plans targeting them" ON public.action_plans
  FOR SELECT USING (
    public.user_in_target_array(auth.uid(), targeted_sales_directors)
  );

-- Policy for supervisors to view action plans targeting their delegates
CREATE POLICY "Supervisors can view action plans targeting their delegates" ON public.action_plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.supervisor_id = auth.uid()
      AND p.role = 'Delegate'
      AND public.user_in_target_array(p.id, targeted_delegates)
    )
  );

-- Policy for sales directors to view action plans targeting their supervisors
CREATE POLICY "Sales Directors can view action plans targeting their supervisors" ON public.action_plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.supervisor_id = auth.uid()
      AND p.role = 'Supervisor'
      AND public.user_in_target_array(p.id, targeted_supervisors)
    )
  );

-- Policy for sales directors to view action plans targeting their delegates (through hierarchy)
CREATE POLICY "Sales Directors can view action plans targeting their delegates" ON public.action_plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles delegate
      JOIN public.profiles supervisor ON delegate.supervisor_id = supervisor.id
      WHERE supervisor.supervisor_id = auth.uid()
      AND supervisor.role = 'Supervisor'
      AND delegate.role = 'Delegate'
      AND public.user_in_target_array(delegate.id, targeted_delegates)
    )
  );

-- Policy for marketing managers to view all action plans (they need to approve them)
CREATE POLICY "Marketing Managers can view all action plans" ON public.action_plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'Marketing Manager'
    )
  );

-- Policy for admins to view all action plans
CREATE POLICY "Admins can view all action plans" ON public.action_plans
  FOR SELECT USING (public.is_current_user_admin());

-- Policies for INSERT operations
CREATE POLICY "Users can create action plans" ON public.action_plans
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Policies for UPDATE operations (only creators and admins can update)
CREATE POLICY "Users can update their own action plans" ON public.action_plans
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Admins can update all action plans" ON public.action_plans
  FOR UPDATE USING (public.is_current_user_admin());

-- Policies for DELETE operations (only creators and admins can delete)
CREATE POLICY "Users can delete their own action plans" ON public.action_plans
  FOR DELETE USING (created_by = auth.uid());

CREATE POLICY "Admins can delete all action plans" ON public.action_plans
  FOR DELETE USING (public.is_current_user_admin());
