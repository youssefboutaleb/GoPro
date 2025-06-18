
-- Drop the existing policies that cause circular dependency
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create a single, simplified policy for SELECT that avoids circular dependency
CREATE POLICY "Users can view own profile and admins can view all" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'Admin'
    )
  );

-- Create a single, simplified policy for UPDATE that avoids circular dependency
CREATE POLICY "Users can update own profile and admins can update all" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'Admin'
    )
  );
