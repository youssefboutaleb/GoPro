
-- Step 1: Drop ALL existing overlapping RLS policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile and admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile and admins can update all" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile or admins can insert all" ON public.profiles;
DROP POLICY IF EXISTS "Supervisors can view their supervised delegates" ON public.profiles;
DROP POLICY IF EXISTS "Sales Directors can view their supervised profiles" ON public.profiles;

-- Step 2: Create a consolidated security definer function for hierarchical access
CREATE OR REPLACE FUNCTION public.can_access_profile(profile_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  -- Get the current user's profile information once
  WITH current_user_info AS (
    SELECT role, id, supervisor_id 
    FROM public.profiles 
    WHERE id = auth.uid()
    LIMIT 1
  ),
  target_profile AS (
    SELECT role, supervisor_id 
    FROM public.profiles 
    WHERE id = profile_id
    LIMIT 1
  )
  SELECT 
    -- User can always access their own profile
    (profile_id = auth.uid()) OR
    -- Admins can access all profiles
    (SELECT role FROM current_user_info) = 'Admin' OR
    -- Supervisors can access their supervised delegates
    ((SELECT role FROM current_user_info) = 'Supervisor' AND 
     (SELECT supervisor_id FROM target_profile) = auth.uid()) OR
    -- Sales Directors can access their supervised supervisors
    ((SELECT role FROM current_user_info) = 'Sales Director' AND 
     (SELECT supervisor_id FROM target_profile) = auth.uid()) OR
    -- Sales Directors can access delegates under their supervised supervisors
    ((SELECT role FROM current_user_info) = 'Sales Director' AND 
     EXISTS (
       SELECT 1 FROM public.profiles intermediate_supervisor
       WHERE intermediate_supervisor.id = (SELECT supervisor_id FROM target_profile)
       AND intermediate_supervisor.supervisor_id = auth.uid()
       AND intermediate_supervisor.role = 'Supervisor'
     ));
$$;

-- Step 3: Create single comprehensive RLS policy for SELECT
CREATE POLICY "Comprehensive profile access policy" ON public.profiles
  FOR SELECT USING (public.can_access_profile(id));

-- Step 4: Create policies for UPDATE and INSERT using same function
CREATE POLICY "Profile update policy" ON public.profiles
  FOR UPDATE USING (
    -- Users can update their own profile OR admins can update any profile
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "Profile insert policy" ON public.profiles
  FOR INSERT WITH CHECK (
    -- Users can insert their own profile OR admins can insert any profile
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Step 5: Add performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_supervisor_id ON public.profiles(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_role_supervisor ON public.profiles(role, supervisor_id);
