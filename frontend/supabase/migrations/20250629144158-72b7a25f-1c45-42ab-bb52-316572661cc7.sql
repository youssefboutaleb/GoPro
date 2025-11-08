
-- First, let's enable RLS on the action_plans table if it's not already enabled
ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own action plans" ON public.action_plans;
DROP POLICY IF EXISTS "Users can view action plans targeting them" ON public.action_plans;
DROP POLICY IF EXISTS "Supervisors can view delegate action plans" ON public.action_plans;
DROP POLICY IF EXISTS "Sales directors can view team action plans" ON public.action_plans;
DROP POLICY IF EXISTS "Marketing managers can view all action plans" ON public.action_plans;
DROP POLICY IF EXISTS "Users can view own action plans" ON public.action_plans;
DROP POLICY IF EXISTS "Users can create action plans" ON public.action_plans;
DROP POLICY IF EXISTS "Users can update own action plans" ON public.action_plans;
DROP POLICY IF EXISTS "Supervisors can update delegate plan status" ON public.action_plans;
DROP POLICY IF EXISTS "Sales directors can update team plan status" ON public.action_plans;
DROP POLICY IF EXISTS "Users can delete own action plans" ON public.action_plans;

-- Create comprehensive policies for action plans access

-- 1. Users can view action plans they created
CREATE POLICY "Users can view own action plans" ON public.action_plans
  FOR SELECT USING (created_by = auth.uid());

-- 2. Users can view action plans that target them specifically
CREATE POLICY "Users can view action plans targeting them" ON public.action_plans
  FOR SELECT USING (
    public.user_in_target_array(auth.uid(), targeted_delegates) OR
    public.user_in_target_array(auth.uid(), targeted_supervisors) OR
    public.user_in_target_array(auth.uid(), targeted_sales_directors)
  );

-- 3. Supervisors can view action plans created by their delegates
CREATE POLICY "Supervisors can view delegate action plans" ON public.action_plans
  FOR SELECT USING (
    public.is_current_user_supervisor_of(created_by)
  );

-- 4. Sales Directors can view action plans from their supervised supervisors and delegates
CREATE POLICY "Sales directors can view team action plans" ON public.action_plans
  FOR SELECT USING (
    public.is_current_user_sales_director() AND (
      -- Plans created by direct supervised supervisors
      created_by IN (
        SELECT id FROM public.profiles 
        WHERE supervisor_id = auth.uid() AND role = 'Supervisor'
      ) OR
      -- Plans created by delegates under supervised supervisors
      created_by IN (
        SELECT d.id FROM public.profiles d
        JOIN public.profiles s ON d.supervisor_id = s.id
        WHERE s.supervisor_id = auth.uid() AND d.role = 'Delegate' AND s.role = 'Supervisor'
      )
    )
  );

-- 5. Marketing Managers can view all action plans (if this role exists)
CREATE POLICY "Marketing managers can view all action plans" ON public.action_plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'Marketing Manager'
    )
  );

-- Create policies for INSERT operations
CREATE POLICY "Users can create action plans" ON public.action_plans
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Create policies for UPDATE operations
CREATE POLICY "Users can update own action plans" ON public.action_plans
  FOR UPDATE USING (created_by = auth.uid());

-- Supervisors can update status of delegate action plans
CREATE POLICY "Supervisors can update delegate plan status" ON public.action_plans
  FOR UPDATE USING (
    public.is_current_user_supervisor_of(created_by)
  );

-- Sales Directors can update status of team action plans
CREATE POLICY "Sales directors can update team plan status" ON public.action_plans
  FOR UPDATE USING (
    public.is_current_user_sales_director() AND (
      created_by IN (
        SELECT id FROM public.profiles 
        WHERE supervisor_id = auth.uid() AND role = 'Supervisor'
      ) OR
      created_by IN (
        SELECT d.id FROM public.profiles d
        JOIN public.profiles s ON d.supervisor_id = s.id
        WHERE s.supervisor_id = auth.uid() AND d.role = 'Delegate' AND s.role = 'Supervisor'
      )
    )
  );

-- Create policies for DELETE operations
CREATE POLICY "Users can delete own action plans" ON public.action_plans
  FOR DELETE USING (created_by = auth.uid());
