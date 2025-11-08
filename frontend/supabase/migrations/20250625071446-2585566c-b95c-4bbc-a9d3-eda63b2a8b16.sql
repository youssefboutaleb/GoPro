
-- Create a security definer function to check if current user is supervisor
CREATE OR REPLACE FUNCTION public.is_current_user_supervisor()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'Supervisor'
  );
$$;

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Supervisors can view their supervised delegates" ON public.profiles;

-- Create a new policy without recursion using the security definer function
CREATE POLICY "Supervisors can view their supervised delegates" ON public.profiles
  FOR SELECT USING (
    -- Allow users to view their own profile (existing functionality)
    auth.uid() = id OR 
    -- Allow admins to view all profiles (existing functionality)
    public.is_current_user_admin() OR
    -- NEW: Allow supervisors to view their supervised delegates (no recursion)
    (public.is_current_user_supervisor() AND profiles.supervisor_id = auth.uid())
  );
