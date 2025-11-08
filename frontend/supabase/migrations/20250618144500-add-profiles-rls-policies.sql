
-- Add RLS policies for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Create policy that allows users to update their own profile  
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create policy that allows admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Create policy that allows admins to update all profiles
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin(auth.uid()));
