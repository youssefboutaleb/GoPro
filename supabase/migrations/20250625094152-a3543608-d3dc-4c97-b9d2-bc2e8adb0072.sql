
-- Create a security definer function to check if current user is Sales Director
CREATE OR REPLACE FUNCTION public.is_current_user_sales_director()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'Sales Director'
  );
$$;

-- Add RLS policy for Sales Directors to view their supervised profiles
CREATE POLICY "Sales Directors can view their supervised profiles" ON public.profiles
  FOR SELECT USING (
    -- Allow users to view their own profile (existing functionality)
    auth.uid() = id OR 
    -- Allow admins to view all profiles (existing functionality)
    public.is_current_user_admin() OR
    -- Allow supervisors to view their supervised delegates (existing functionality)
    (public.is_current_user_supervisor() AND profiles.supervisor_id = auth.uid()) OR
    -- NEW: Allow Sales Directors to view their supervised supervisors and delegates
    (public.is_current_user_sales_director() AND profiles.supervisor_id = auth.uid())
  );
