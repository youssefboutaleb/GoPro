
-- 1. Rename 'directeurs_ventes' table to 'responsables'
ALTER TABLE public.directeurs_ventes RENAME TO responsables;

-- 2. Add new attributes to 'responsables' table
ALTER TABLE public.responsables 
ADD COLUMN prenom TEXT,
ADD COLUMN tache TEXT CHECK (tache IN ('Direction de vente', 'Marketing'));

-- 3. Create 'plan_actions' table
CREATE TABLE public.plan_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT,
    budget NUMERIC NOT NULL,
    date_execution DATE NOT NULL,
    responsable_id UUID REFERENCES public.responsables(id),
    produit_id UUID REFERENCES public.produits(id),
    brick_id UUID REFERENCES public.bricks(id)
);

-- 4. Update foreign key references to use the new table name
ALTER TABLE public.superviseurs DROP CONSTRAINT IF EXISTS superviseurs_directeur_ventes_id_fkey;
ALTER TABLE public.superviseurs ADD CONSTRAINT superviseurs_responsable_id_fkey 
  FOREIGN KEY (directeur_ventes_id) REFERENCES public.responsables(id);

-- 5. Enable RLS and create policies for plan_actions table
ALTER TABLE public.plan_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all plan_actions" 
  ON public.plan_actions 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create plan_actions" 
  ON public.plan_actions 
  FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update plan_actions" 
  ON public.plan_actions 
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete plan_actions" 
  ON public.plan_actions 
  FOR DELETE 
  USING (public.is_admin(auth.uid()));

-- 6. Update RLS policies for responsables table (renamed from directeurs_ventes)
DROP POLICY IF EXISTS "Admins can view all directeurs_ventes" ON public.responsables;
DROP POLICY IF EXISTS "Admins can create directeurs_ventes" ON public.responsables;
DROP POLICY IF EXISTS "Admins can update directeurs_ventes" ON public.responsables;
DROP POLICY IF EXISTS "Admins can delete directeurs_ventes" ON public.responsables;

CREATE POLICY "Admins can view all responsables" 
  ON public.responsables 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create responsables" 
  ON public.responsables 
  FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update responsables" 
  ON public.responsables 
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete responsables" 
  ON public.responsables 
  FOR DELETE 
  USING (public.is_admin(auth.uid()));
