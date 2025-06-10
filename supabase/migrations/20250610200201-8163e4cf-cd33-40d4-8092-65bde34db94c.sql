
-- Drop the problematic RLS policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create simpler, non-recursive policies
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    (SELECT auth.jwt() ->> 'email') IN (
      SELECT email FROM public.profiles WHERE role IN ('admin', 'superuser')
    )
    OR auth.uid() = id
  );

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    (SELECT auth.jwt() ->> 'email') IN (
      SELECT email FROM public.profiles WHERE role IN ('admin', 'superuser')
    )
    OR auth.uid() = id
  );

-- Alternative approach: Create a simple function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role IN ('admin', 'superuser')
  );
$$;

-- Drop the policies again and recreate with the function
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR public.is_admin(auth.uid())
  );

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR public.is_admin(auth.uid())
  );
