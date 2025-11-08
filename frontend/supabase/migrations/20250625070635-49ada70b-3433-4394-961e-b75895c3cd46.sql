
-- Add RLS policy to allow supervisors to view their supervised delegates
CREATE POLICY "Supervisors can view their supervised delegates" ON public.profiles
  FOR SELECT USING (
    -- Allow users to view their own profile (existing functionality)
    auth.uid() = id OR 
    -- Allow admins to view all profiles (existing functionality)
    public.is_current_user_admin() OR
    -- NEW: Allow supervisors to view their supervised delegates
    EXISTS (
      SELECT 1 FROM public.profiles supervisor_profile
      WHERE supervisor_profile.id = auth.uid() 
      AND supervisor_profile.role = 'Supervisor'
      AND profiles.supervisor_id = supervisor_profile.id
    )
  );

-- Drop the existing restrictive policy first
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON public.profiles;
