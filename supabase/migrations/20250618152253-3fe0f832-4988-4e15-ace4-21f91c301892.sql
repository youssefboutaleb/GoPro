
-- Update the existing is_admin function to avoid recursion by using auth.users instead of profiles
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id 
    AND raw_user_meta_data ->> 'role' = 'Admin'
  );
$$;

-- Drop the problematic recursive policies on profiles table only
DROP POLICY IF EXISTS "Users can view own profile and admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile and admins can update all" ON public.profiles;

-- Create simple, non-recursive policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow admins to see all profiles using the updated non-recursive function
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR public.is_admin(auth.uid())
  );

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR public.is_admin(auth.uid())
  );
