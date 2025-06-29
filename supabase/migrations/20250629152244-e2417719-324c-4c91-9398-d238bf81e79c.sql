
-- Create a helper function to check if a user has created action plans targeting the current user
CREATE OR REPLACE FUNCTION public.has_created_action_plan_targeting_current_user(creator_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.action_plans
    WHERE created_by = creator_id 
    AND (
      public.user_in_target_array(auth.uid(), targeted_delegates) OR
      public.user_in_target_array(auth.uid(), targeted_supervisors) OR
      public.user_in_target_array(auth.uid(), targeted_sales_directors)
    )
  );
$$;

-- Add a new RLS policy to allow users to view profiles of those who created action plans targeting them
CREATE POLICY "Users can view profiles of action plan creators targeting them" ON public.profiles
  FOR SELECT USING (
    public.has_created_action_plan_targeting_current_user(id)
  );
