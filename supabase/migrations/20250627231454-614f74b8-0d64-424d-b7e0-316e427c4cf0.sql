
-- Create action_plans table
CREATE TABLE public.action_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('staff', 'ePU', 'congress', 'travel', 'gift')),
  date DATE NOT NULL,
  location TEXT NOT NULL,
  targeted_products TEXT[],
  targeted_bricks UUID[],
  targeted_doctors UUID[],
  description TEXT,
  supervisor_status TEXT DEFAULT 'pending' CHECK (supervisor_status IN ('pending', 'approved', 'rejected')),
  sales_director_status TEXT DEFAULT 'pending' CHECK (sales_director_status IN ('pending', 'approved', 'rejected')),
  marketing_manager_status TEXT DEFAULT 'pending' CHECK (marketing_manager_status IN ('pending', 'approved', 'rejected')),
  is_executed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for action plans
CREATE POLICY "Users can view action plans they created" 
  ON public.action_plans 
  FOR SELECT 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create action plans" 
  ON public.action_plans 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own action plans" 
  ON public.action_plans 
  FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Supervisors can view and update action plans for their delegates"
  ON public.action_plans
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = action_plans.created_by
      AND p.supervisor_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.profiles u
        WHERE u.id = auth.uid()
        AND u.role = 'Supervisor'
      )
    )
  );

CREATE POLICY "Sales Directors can view and update action plans for their team"
  ON public.action_plans
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = action_plans.created_by
      AND (
        p.supervisor_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles supervisor
          WHERE supervisor.id = p.supervisor_id
          AND supervisor.supervisor_id = auth.uid()
        )
      )
      AND EXISTS (
        SELECT 1 FROM public.profiles u
        WHERE u.id = auth.uid()
        AND u.role = 'Sales Director'
      )
    )
  );

CREATE POLICY "Admins can view and update all action plans"
  ON public.action_plans
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );
