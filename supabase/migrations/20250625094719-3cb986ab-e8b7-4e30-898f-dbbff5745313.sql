
-- Drop the existing policy to recreate it with better logic
DROP POLICY IF EXISTS "Sales Directors can view their supervised profiles" ON public.profiles;

-- Create a more comprehensive policy for Sales Directors
CREATE POLICY "Sales Directors can view their supervised profiles" ON public.profiles
  FOR SELECT USING (
    -- Allow users to view their own profile (existing functionality)
    auth.uid() = id OR 
    -- Allow admins to view all profiles (existing functionality)
    public.is_current_user_admin() OR
    -- Allow supervisors to view their supervised delegates (existing functionality)
    (public.is_current_user_supervisor() AND profiles.supervisor_id = auth.uid()) OR
    -- Allow Sales Directors to view their supervised supervisors
    (public.is_current_user_sales_director() AND profiles.supervisor_id = auth.uid()) OR
    -- NEW: Allow Sales Directors to view delegates under their supervised supervisors
    (public.is_current_user_sales_director() AND 
     EXISTS (
       SELECT 1 FROM public.profiles supervisors 
       WHERE supervisors.id = profiles.supervisor_id 
       AND supervisors.supervisor_id = auth.uid()
       AND supervisors.role = 'Supervisor'
     ))
  );
