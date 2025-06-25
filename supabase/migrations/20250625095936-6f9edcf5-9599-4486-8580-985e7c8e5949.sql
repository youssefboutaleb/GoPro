
-- First, let's ensure RLS is enabled on all relevant tables
ALTER TABLE public.visit_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Drop any existing conflicting policies on these tables
DROP POLICY IF EXISTS "Users can view their own visit plans" ON public.visit_plans;
DROP POLICY IF EXISTS "Users can insert their own visit plans" ON public.visit_plans;
DROP POLICY IF EXISTS "Users can update their own visit plans" ON public.visit_plans;
DROP POLICY IF EXISTS "Users can delete their own visit plans" ON public.visit_plans;
DROP POLICY IF EXISTS "Supervisors can view their delegates' visit plans" ON public.visit_plans;
DROP POLICY IF EXISTS "Sales Directors can view visit plans" ON public.visit_plans;

DROP POLICY IF EXISTS "Users can view their own sales plans" ON public.sales_plans;
DROP POLICY IF EXISTS "Users can insert their own sales plans" ON public.sales_plans;
DROP POLICY IF EXISTS "Users can update their own sales plans" ON public.sales_plans;
DROP POLICY IF EXISTS "Users can delete their own sales plans" ON public.sales_plans;
DROP POLICY IF EXISTS "Supervisors can view their delegates' sales plans" ON public.sales_plans;
DROP POLICY IF EXISTS "Sales Directors can view sales plans" ON public.sales_plans;

DROP POLICY IF EXISTS "Users can view visits for their visit plans" ON public.visits;
DROP POLICY IF EXISTS "Users can insert visits for their visit plans" ON public.visits;
DROP POLICY IF EXISTS "Users can update visits for their visit plans" ON public.visits;
DROP POLICY IF EXISTS "Users can delete visits for their visit plans" ON public.visits;
DROP POLICY IF EXISTS "Supervisors can view their delegates' visits" ON public.visits;
DROP POLICY IF EXISTS "Sales Directors can view visits" ON public.visits;

DROP POLICY IF EXISTS "Users can view their own sales" ON public.sales;
DROP POLICY IF EXISTS "Users can insert their own sales" ON public.sales;
DROP POLICY IF EXISTS "Users can update their own sales" ON public.sales;
DROP POLICY IF EXISTS "Users can delete their own sales" ON public.sales;
DROP POLICY IF EXISTS "Supervisors can view their delegates' sales" ON public.sales;
DROP POLICY IF EXISTS "Sales Directors can view sales" ON public.sales;

-- Create comprehensive RLS policies for visit_plans table
CREATE POLICY "Comprehensive visit plans access" ON public.visit_plans
  FOR SELECT USING (
    -- Delegates can see their own visit plans
    delegate_id = auth.uid() OR
    -- Admins can see all visit plans
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin') OR
    -- Supervisors can see their supervised delegates' visit plans
    EXISTS (
      SELECT 1 FROM public.profiles supervisor
      WHERE supervisor.id = auth.uid() 
      AND supervisor.role = 'Supervisor'
      AND visit_plans.delegate_id IN (
        SELECT p.id FROM public.profiles p 
        WHERE p.supervisor_id = supervisor.id AND p.role = 'Delegate'
      )
    ) OR
    -- Sales Directors can see visit plans of delegates under their supervised supervisors
    EXISTS (
      SELECT 1 FROM public.profiles sales_director
      WHERE sales_director.id = auth.uid() 
      AND sales_director.role = 'Sales Director'
      AND visit_plans.delegate_id IN (
        SELECT p.id FROM public.profiles p 
        JOIN public.profiles s ON p.supervisor_id = s.id
        WHERE s.supervisor_id = sales_director.id 
        AND s.role = 'Supervisor' 
        AND p.role = 'Delegate'
      )
    )
  );

-- Create comprehensive RLS policies for sales_plans table
CREATE POLICY "Comprehensive sales plans access" ON public.sales_plans
  FOR SELECT USING (
    -- Delegates can see their own sales plans
    delegate_id = auth.uid() OR
    -- Admins can see all sales plans
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin') OR
    -- Supervisors can see their supervised delegates' sales plans
    EXISTS (
      SELECT 1 FROM public.profiles supervisor
      WHERE supervisor.id = auth.uid() 
      AND supervisor.role = 'Supervisor'
      AND sales_plans.delegate_id IN (
        SELECT p.id FROM public.profiles p 
        WHERE p.supervisor_id = supervisor.id AND p.role = 'Delegate'
      )
    ) OR
    -- Sales Directors can see sales plans of delegates under their supervised supervisors
    EXISTS (
      SELECT 1 FROM public.profiles sales_director
      WHERE sales_director.id = auth.uid() 
      AND sales_director.role = 'Sales Director'
      AND sales_plans.delegate_id IN (
        SELECT p.id FROM public.profiles p 
        JOIN public.profiles s ON p.supervisor_id = s.id
        WHERE s.supervisor_id = sales_director.id 
        AND s.role = 'Supervisor' 
        AND p.role = 'Delegate'
      )
    )
  );

-- Create comprehensive RLS policies for visits table
CREATE POLICY "Comprehensive visits access" ON public.visits
  FOR SELECT USING (
    -- Users can see visits for their own visit plans
    EXISTS (
      SELECT 1 FROM public.visit_plans vp 
      WHERE vp.id = visits.visit_plan_id 
      AND vp.delegate_id = auth.uid()
    ) OR
    -- Admins can see all visits
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin') OR
    -- Supervisors can see visits for their supervised delegates' visit plans
    EXISTS (
      SELECT 1 FROM public.visit_plans vp
      JOIN public.profiles supervisor ON supervisor.id = auth.uid()
      WHERE vp.id = visits.visit_plan_id
      AND supervisor.role = 'Supervisor'
      AND vp.delegate_id IN (
        SELECT p.id FROM public.profiles p 
        WHERE p.supervisor_id = supervisor.id AND p.role = 'Delegate'
      )
    ) OR
    -- Sales Directors can see visits for delegates under their supervised supervisors
    EXISTS (
      SELECT 1 FROM public.visit_plans vp
      JOIN public.profiles sales_director ON sales_director.id = auth.uid()
      WHERE vp.id = visits.visit_plan_id
      AND sales_director.role = 'Sales Director'
      AND vp.delegate_id IN (
        SELECT p.id FROM public.profiles p 
        JOIN public.profiles s ON p.supervisor_id = s.id
        WHERE s.supervisor_id = sales_director.id 
        AND s.role = 'Supervisor' 
        AND p.role = 'Delegate'
      )
    )
  );

-- Create comprehensive RLS policies for sales table
CREATE POLICY "Comprehensive sales access" ON public.sales
  FOR SELECT USING (
    -- Users can see sales for their own sales plans
    EXISTS (
      SELECT 1 FROM public.sales_plans sp 
      WHERE sp.id = sales.sales_plan_id 
      AND sp.delegate_id = auth.uid()
    ) OR
    -- Admins can see all sales
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin') OR
    -- Supervisors can see sales for their supervised delegates' sales plans
    EXISTS (
      SELECT 1 FROM public.sales_plans sp
      JOIN public.profiles supervisor ON supervisor.id = auth.uid()
      WHERE sp.id = sales.sales_plan_id
      AND supervisor.role = 'Supervisor'
      AND sp.delegate_id IN (
        SELECT p.id FROM public.profiles p 
        WHERE p.supervisor_id = supervisor.id AND p.role = 'Delegate'
      )
    ) OR
    -- Sales Directors can see sales for delegates under their supervised supervisors
    EXISTS (
      SELECT 1 FROM public.sales_plans sp
      JOIN public.profiles sales_director ON sales_director.id = auth.uid()
      WHERE sp.id = sales.sales_plan_id
      AND sales_director.role = 'Sales Director'
      AND sp.delegate_id IN (
        SELECT p.id FROM public.profiles p 
        JOIN public.profiles s ON p.supervisor_id = s.id
        WHERE s.supervisor_id = sales_director.id 
        AND s.role = 'Supervisor' 
        AND p.role = 'Delegate'
      )
    )
  );

-- Add indexes for better performance on the queries above
CREATE INDEX IF NOT EXISTS idx_visit_plans_delegate_id ON public.visit_plans(delegate_id);
CREATE INDEX IF NOT EXISTS idx_sales_plans_delegate_id ON public.sales_plans(delegate_id);
CREATE INDEX IF NOT EXISTS idx_visits_visit_plan_id ON public.visits(visit_plan_id);
CREATE INDEX IF NOT EXISTS idx_sales_sales_plan_id ON public.sales(sales_plan_id);
