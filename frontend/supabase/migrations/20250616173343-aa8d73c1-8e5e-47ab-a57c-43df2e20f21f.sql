
-- Step 1: Rename tables from French to English
ALTER TABLE public.responsables RENAME TO managers;
ALTER TABLE public.delegues RENAME TO delegates;
ALTER TABLE public.medecins RENAME TO doctors;
ALTER TABLE public.produits RENAME TO products;
ALTER TABLE public.secteurs RENAME TO sectors;
ALTER TABLE public.bricks RENAME TO territories;
ALTER TABLE public.superviseurs RENAME TO supervisors;
ALTER TABLE public.ventes RENAME TO sales;
ALTER TABLE public.frequences_visites RENAME TO visit_frequencies;
ALTER TABLE public.objectifs_ventes RENAME TO sales_objectives;
ALTER TABLE public.plan_actions RENAME TO action_plans;
ALTER TABLE public.visites RENAME TO visits;

-- Step 2: Rename columns in managers table (formerly responsables)
ALTER TABLE public.managers RENAME COLUMN nom TO name;
ALTER TABLE public.managers RENAME COLUMN prenom TO first_name;
ALTER TABLE public.managers RENAME COLUMN tache TO task;

-- Step 3: Update task constraint to use English values
ALTER TABLE public.managers DROP CONSTRAINT IF EXISTS responsables_tache_check;
ALTER TABLE public.managers ADD CONSTRAINT managers_task_check 
  CHECK (task IN ('Sales Management', 'Marketing'));

-- Step 4: Rename columns in delegates table
ALTER TABLE public.delegates RENAME COLUMN nom TO name;
ALTER TABLE public.delegates RENAME COLUMN prenom TO first_name;
ALTER TABLE public.delegates RENAME COLUMN secteur_id TO sector_id;
ALTER TABLE public.delegates RENAME COLUMN equipe_id TO team_id;

-- Step 5: Rename columns in doctors table
ALTER TABLE public.doctors RENAME COLUMN nom TO name;
ALTER TABLE public.doctors RENAME COLUMN prenom TO first_name;
ALTER TABLE public.doctors RENAME COLUMN specialite TO specialty;
ALTER TABLE public.doctors RENAME COLUMN brick_id TO territory_id;

-- Step 6: Rename columns in products table
ALTER TABLE public.products RENAME COLUMN nom TO name;
ALTER TABLE public.products RENAME COLUMN classe_therapeutique TO therapeutic_class;
ALTER TABLE public.products RENAME COLUMN actif TO active;

-- Step 7: Rename columns in sectors table
ALTER TABLE public.sectors RENAME COLUMN nom TO name;

-- Step 8: Rename columns in territories table (formerly bricks)
ALTER TABLE public.territories RENAME COLUMN nom TO name;
ALTER TABLE public.territories RENAME COLUMN secteur_id TO sector_id;

-- Step 9: Rename columns in supervisors table
ALTER TABLE public.supervisors RENAME COLUMN nom TO name;
ALTER TABLE public.supervisors RENAME COLUMN responsable_id TO manager_id;

-- Step 10: Rename columns in sales table
ALTER TABLE public.sales RENAME COLUMN brick_id TO territory_id;
ALTER TABLE public.sales RENAME COLUMN delegue_id TO delegate_id;
ALTER TABLE public.sales RENAME COLUMN produit_id TO product_id;

-- Step 11: Rename columns in visit_frequencies table
ALTER TABLE public.visit_frequencies RENAME COLUMN delegue_id TO delegate_id;
ALTER TABLE public.visit_frequencies RENAME COLUMN medecin_id TO doctor_id;
ALTER TABLE public.visit_frequencies RENAME COLUMN frequence_visite TO visit_frequency;

-- Step 12: Rename columns in sales_objectives table
ALTER TABLE public.sales_objectives RENAME COLUMN annee TO year;
ALTER TABLE public.sales_objectives RENAME COLUMN objectif_mensuel TO monthly_objective;
ALTER TABLE public.sales_objectives RENAME COLUMN vente_realisee TO sales_achieved;
ALTER TABLE public.sales_objectives RENAME COLUMN vente_id TO sale_id;

-- Step 13: Rename columns in action_plans table
ALTER TABLE public.action_plans RENAME COLUMN responsable_id TO manager_id;
ALTER TABLE public.action_plans RENAME COLUMN produit_id TO product_id;
ALTER TABLE public.action_plans RENAME COLUMN brick_id TO territory_id;
ALTER TABLE public.action_plans RENAME COLUMN date_execution TO execution_date;

-- Step 14: Rename columns in visits table
ALTER TABLE public.visits RENAME COLUMN date_visite TO visit_date;
ALTER TABLE public.visits RENAME COLUMN objectif_visite_id TO visit_objective_id;

-- Step 15: Update foreign key constraints with new table names
ALTER TABLE public.territories DROP CONSTRAINT IF EXISTS bricks_secteur_id_fkey;
ALTER TABLE public.territories ADD CONSTRAINT territories_sector_id_fkey 
  FOREIGN KEY (sector_id) REFERENCES public.sectors(id);

ALTER TABLE public.delegates DROP CONSTRAINT IF EXISTS delegues_equipe_id_fkey;
ALTER TABLE public.delegates ADD CONSTRAINT delegates_team_id_fkey 
  FOREIGN KEY (team_id) REFERENCES public.supervisors(id);

ALTER TABLE public.delegates DROP CONSTRAINT IF EXISTS delegues_secteur_id_fkey;
ALTER TABLE public.delegates ADD CONSTRAINT delegates_sector_id_fkey 
  FOREIGN KEY (sector_id) REFERENCES public.sectors(id);

ALTER TABLE public.doctors DROP CONSTRAINT IF EXISTS medecins_brick_id_fkey;
ALTER TABLE public.doctors ADD CONSTRAINT doctors_territory_id_fkey 
  FOREIGN KEY (territory_id) REFERENCES public.territories(id);

ALTER TABLE public.supervisors DROP CONSTRAINT IF EXISTS superviseurs_responsable_id_fkey;
ALTER TABLE public.supervisors ADD CONSTRAINT supervisors_manager_id_fkey 
  FOREIGN KEY (manager_id) REFERENCES public.managers(id);

ALTER TABLE public.sales DROP CONSTRAINT IF EXISTS ventes_brick_id_fkey;
ALTER TABLE public.sales ADD CONSTRAINT sales_territory_id_fkey 
  FOREIGN KEY (territory_id) REFERENCES public.territories(id);

ALTER TABLE public.sales DROP CONSTRAINT IF EXISTS ventes_delegue_id_fkey;
ALTER TABLE public.sales ADD CONSTRAINT sales_delegate_id_fkey 
  FOREIGN KEY (delegate_id) REFERENCES public.delegates(id);

ALTER TABLE public.sales DROP CONSTRAINT IF EXISTS ventes_produit_id_fkey;
ALTER TABLE public.sales ADD CONSTRAINT sales_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES public.products(id);

ALTER TABLE public.visit_frequencies DROP CONSTRAINT IF EXISTS objectifs_visites_delegue_id_fkey;
ALTER TABLE public.visit_frequencies ADD CONSTRAINT visit_frequencies_delegate_id_fkey 
  FOREIGN KEY (delegate_id) REFERENCES public.delegates(id);

ALTER TABLE public.visit_frequencies DROP CONSTRAINT IF EXISTS objectifs_visites_medecin_id_fkey;
ALTER TABLE public.visit_frequencies ADD CONSTRAINT visit_frequencies_doctor_id_fkey 
  FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);

ALTER TABLE public.sales_objectives DROP CONSTRAINT IF EXISTS objectifs_ventes_vente_id_fkey;
ALTER TABLE public.sales_objectives ADD CONSTRAINT sales_objectives_sale_id_fkey 
  FOREIGN KEY (sale_id) REFERENCES public.sales(id);

ALTER TABLE public.action_plans DROP CONSTRAINT IF EXISTS plan_actions_responsable_id_fkey;
ALTER TABLE public.action_plans ADD CONSTRAINT action_plans_manager_id_fkey 
  FOREIGN KEY (manager_id) REFERENCES public.managers(id);

ALTER TABLE public.action_plans DROP CONSTRAINT IF EXISTS plan_actions_produit_id_fkey;
ALTER TABLE public.action_plans ADD CONSTRAINT action_plans_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES public.products(id);

ALTER TABLE public.action_plans DROP CONSTRAINT IF EXISTS plan_actions_brick_id_fkey;
ALTER TABLE public.action_plans ADD CONSTRAINT action_plans_territory_id_fkey 
  FOREIGN KEY (territory_id) REFERENCES public.territories(id);

ALTER TABLE public.visits DROP CONSTRAINT IF EXISTS visites_objectif_visite_id_fkey;
ALTER TABLE public.visits ADD CONSTRAINT visits_visit_objective_id_fkey 
  FOREIGN KEY (visit_objective_id) REFERENCES public.visit_frequencies(id);

-- Step 16: Update RLS policies with new table names
DROP POLICY IF EXISTS "Admins can view all responsables" ON public.managers;
DROP POLICY IF EXISTS "Admins can create responsables" ON public.managers;
DROP POLICY IF EXISTS "Admins can update responsables" ON public.managers;
DROP POLICY IF EXISTS "Admins can delete responsables" ON public.managers;

CREATE POLICY "Admins can view all managers" 
  ON public.managers 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create managers" 
  ON public.managers 
  FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update managers" 
  ON public.managers 
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete managers" 
  ON public.managers 
  FOR DELETE 
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all plan_actions" ON public.action_plans;
DROP POLICY IF EXISTS "Admins can create plan_actions" ON public.action_plans;
DROP POLICY IF EXISTS "Admins can update plan_actions" ON public.action_plans;
DROP POLICY IF EXISTS "Admins can delete plan_actions" ON public.action_plans;

CREATE POLICY "Admins can view all action_plans" 
  ON public.action_plans 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create action_plans" 
  ON public.action_plans 
  FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update action_plans" 
  ON public.action_plans 
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete action_plans" 
  ON public.action_plans 
  FOR DELETE 
  USING (public.is_admin(auth.uid()));
