
-- Step 1: Create new enum types and update existing ones
CREATE TYPE public.user_type AS ENUM ('Admin', 'Sales Director', 'Marketing Manager', 'Supervisor', 'Delegate');
CREATE TYPE public.visit_frequency AS ENUM ('1', '2');

-- Step 2: Drop the visit_status enum
DROP TYPE IF EXISTS public.visit_status;

-- Step 3: Rename tables
ALTER TABLE public.territories RENAME TO bricks;
ALTER TABLE public.sales RENAME TO sales_plans;
ALTER TABLE public.sales_objectives RENAME TO sales;
ALTER TABLE public.visit_frequencies RENAME TO visit_plans;

-- Step 4: Update foreign key column names in all tables
-- Update territory_id to brick_id (skip bricks table as sector_id stays the same)
ALTER TABLE public.doctors RENAME COLUMN territory_id TO brick_id;
ALTER TABLE public.sales_plans RENAME COLUMN territory_id TO brick_id;
ALTER TABLE public.action_plans RENAME COLUMN territory_id TO brick_id;

-- Update sale_id to sales_plan_id
ALTER TABLE public.sales RENAME COLUMN sale_id TO sales_plan_id;

-- Update visit_objective_id to visit_plan_id
ALTER TABLE public.visits RENAME COLUMN visit_objective_id TO visit_plan_id;

-- Step 5: Handle visit_plans table conversion more carefully
-- First drop any existing constraints
ALTER TABLE public.visit_plans DROP CONSTRAINT IF EXISTS visit_frequencies_visit_frequency_check;

-- Add a temporary column with the new enum type
ALTER TABLE public.visit_plans ADD COLUMN visit_frequency_new public.visit_frequency;

-- Update the new column based on the old integer values
UPDATE public.visit_plans SET visit_frequency_new = 
  CASE 
    WHEN visit_frequency = 1 THEN '1'::public.visit_frequency
    WHEN visit_frequency = 2 THEN '2'::public.visit_frequency
    ELSE '1'::public.visit_frequency
  END;

-- Drop the old column and rename the new one
ALTER TABLE public.visit_plans DROP COLUMN visit_frequency;
ALTER TABLE public.visit_plans RENAME COLUMN visit_frequency_new TO visit_frequency;
ALTER TABLE public.visit_plans ALTER COLUMN visit_frequency SET NOT NULL;

-- Step 6: Delete the tables we no longer need
DROP TABLE IF EXISTS public.delegates CASCADE;
DROP TABLE IF EXISTS public.managers CASCADE; 
DROP TABLE IF EXISTS public.supervisors CASCADE;

-- Step 7: Alter the profiles table
-- First, add the new supervisor_id column
ALTER TABLE public.profiles ADD COLUMN supervisor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Update the role column to use the new enum
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check,
ALTER COLUMN role DROP DEFAULT,
ALTER COLUMN role TYPE public.user_type USING 
  CASE 
    WHEN role::text = 'superuser' THEN 'Admin'::public.user_type
    WHEN role::text = 'admin' THEN 'Admin'::public.user_type
    WHEN role::text = 'user' THEN 'Delegate'::public.user_type
    ELSE 'Delegate'::public.user_type
  END,
ALTER COLUMN role SET NOT NULL;

-- Drop the old columns from profiles
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS first_name,
DROP COLUMN IF EXISTS last_name,
DROP COLUMN IF EXISTS email;

-- Step 8: Update foreign key constraints to point to new table names
ALTER TABLE public.doctors DROP CONSTRAINT IF EXISTS doctors_territory_id_fkey;
ALTER TABLE public.doctors ADD CONSTRAINT doctors_brick_id_fkey 
  FOREIGN KEY (brick_id) REFERENCES public.bricks(id);

ALTER TABLE public.sales_plans DROP CONSTRAINT IF EXISTS sales_territory_id_fkey;
ALTER TABLE public.sales_plans ADD CONSTRAINT sales_plans_brick_id_fkey 
  FOREIGN KEY (brick_id) REFERENCES public.bricks(id);

ALTER TABLE public.action_plans DROP CONSTRAINT IF EXISTS action_plans_territory_id_fkey;
ALTER TABLE public.action_plans ADD CONSTRAINT action_plans_brick_id_fkey 
  FOREIGN KEY (brick_id) REFERENCES public.bricks(id);

ALTER TABLE public.sales DROP CONSTRAINT IF EXISTS sales_objectives_sale_id_fkey;
ALTER TABLE public.sales ADD CONSTRAINT sales_sales_plan_id_fkey 
  FOREIGN KEY (sales_plan_id) REFERENCES public.sales_plans(id);

ALTER TABLE public.visits DROP CONSTRAINT IF EXISTS visits_visit_objective_id_fkey;
ALTER TABLE public.visits ADD CONSTRAINT visits_visit_plan_id_fkey 
  FOREIGN KEY (visit_plan_id) REFERENCES public.visit_plans(id);

-- Step 9: Drop the old enum types
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.frequence_visite;

-- Step 10: Update RLS policies for renamed tables (using DROP IF EXISTS to avoid errors)
-- Policies for bricks table (policies already exist, no need to recreate)

-- Update policies for sales_plans table
DROP POLICY IF EXISTS "Admins can view all sales" ON public.sales_plans;
DROP POLICY IF EXISTS "Admins can create sales" ON public.sales_plans;
DROP POLICY IF EXISTS "Admins can update sales" ON public.sales_plans;
DROP POLICY IF EXISTS "Admins can delete sales" ON public.sales_plans;

CREATE POLICY "Admins can view all sales_plans" 
  ON public.sales_plans 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create sales_plans" 
  ON public.sales_plans 
  FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update sales_plans" 
  ON public.sales_plans 
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete sales_plans" 
  ON public.sales_plans 
  FOR DELETE 
  USING (public.is_admin(auth.uid()));

-- Update policies for visit_plans table
DROP POLICY IF EXISTS "Admins can view all frequences_visites" ON public.visit_plans;
DROP POLICY IF EXISTS "Admins can create frequences_visites" ON public.visit_plans;
DROP POLICY IF EXISTS "Admins can update frequences_visites" ON public.visit_plans;
DROP POLICY IF EXISTS "Admins can delete frequences_visites" ON public.visit_plans;

CREATE POLICY "Admins can view all visit_plans" 
  ON public.visit_plans 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create visit_plans" 
  ON public.visit_plans 
  FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update visit_plans" 
  ON public.visit_plans 
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete visit_plans" 
  ON public.visit_plans 
  FOR DELETE 
  USING (public.is_admin(auth.uid()));
