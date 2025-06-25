
-- Handle existing policies by dropping them first and recreating
-- This ensures we get consistent admin policies across all tables

-- Drop all existing admin policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage sectors" ON public.sectors;
DROP POLICY IF EXISTS "Admins can manage bricks" ON public.bricks;
DROP POLICY IF EXISTS "Admins can manage visits" ON public.visits;
DROP POLICY IF EXISTS "Admins can manage visit_plans" ON public.visit_plans;
DROP POLICY IF EXISTS "Admins can manage sales" ON public.sales;
DROP POLICY IF EXISTS "Admins can manage sales_plans" ON public.sales_plans;
DROP POLICY IF EXISTS "Admins can manage doctors" ON public.doctors;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

-- Create a function to check if current user is admin (if not exists)
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'Admin'
  );
$$;

-- Drop existing conflicting policies for profiles
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile or admins can update all" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile or admins can insert all" ON public.profiles;

-- Create comprehensive policies for profiles
CREATE POLICY "Users can view own profile or admins can view all" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR public.is_current_user_admin()
  );

CREATE POLICY "Users can update own profile or admins can update all" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR public.is_current_user_admin()
  );

CREATE POLICY "Users can insert own profile or admins can insert all" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id OR public.is_current_user_admin()
  );

-- Create admin policies for all tables
CREATE POLICY "Admins can manage sectors" ON public.sectors
  FOR ALL USING (public.is_current_user_admin());

CREATE POLICY "Admins can manage bricks" ON public.bricks
  FOR ALL USING (public.is_current_user_admin());

CREATE POLICY "Admins can manage visits" ON public.visits
  FOR ALL USING (public.is_current_user_admin());

CREATE POLICY "Admins can manage visit_plans" ON public.visit_plans
  FOR ALL USING (public.is_current_user_admin());

CREATE POLICY "Admins can manage sales" ON public.sales
  FOR ALL USING (public.is_current_user_admin());

CREATE POLICY "Admins can manage sales_plans" ON public.sales_plans
  FOR ALL USING (public.is_current_user_admin());

CREATE POLICY "Admins can manage doctors" ON public.doctors
  FOR ALL USING (public.is_current_user_admin());

CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (public.is_current_user_admin());
