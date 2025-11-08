
-- 1. Rename 'secteur' table to 'secteurs'
ALTER TABLE public.secteur RENAME TO secteurs;

-- 2. Rename 'objectifs_visites' table to 'frequences_visites'
ALTER TABLE public.objectifs_visites RENAME TO frequences_visites;

-- 3. Create 'directeurs_ventes' table
CREATE TABLE public.directeurs_ventes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL
);

-- 4. Rename 'equipes' table to 'superviseurs' and add FK to 'directeurs_ventes'
ALTER TABLE public.equipes RENAME TO superviseurs;
ALTER TABLE public.superviseurs ADD COLUMN directeur_ventes_id UUID REFERENCES public.directeurs_ventes(id);

-- Update foreign key references to use the new table names
-- Update bricks table foreign key reference
ALTER TABLE public.bricks DROP CONSTRAINT IF EXISTS bricks_secteur_id_fkey;
ALTER TABLE public.bricks ADD CONSTRAINT bricks_secteur_id_fkey 
  FOREIGN KEY (secteur_id) REFERENCES public.secteurs(id);

-- Update delegues table foreign key references
ALTER TABLE public.delegues DROP CONSTRAINT IF EXISTS delegues_secteur_id_fkey;
ALTER TABLE public.delegues ADD CONSTRAINT delegues_secteur_id_fkey 
  FOREIGN KEY (secteur_id) REFERENCES public.secteurs(id);

ALTER TABLE public.delegues DROP CONSTRAINT IF EXISTS delegues_equipe_id_fkey;
ALTER TABLE public.delegues ADD CONSTRAINT delegues_equipe_id_fkey 
  FOREIGN KEY (equipe_id) REFERENCES public.superviseurs(id);

-- Update visites table foreign key reference
ALTER TABLE public.visites DROP CONSTRAINT IF EXISTS visites_new_objectif_visite_id_fkey;
ALTER TABLE public.visites ADD CONSTRAINT visites_objectif_visite_id_fkey 
  FOREIGN KEY (objectif_visite_id) REFERENCES public.frequences_visites(id);

-- Update RLS policies for secteurs table (renamed from secteur)
DROP POLICY IF EXISTS "Admins can view all secteurs" ON public.secteurs;
DROP POLICY IF EXISTS "Admins can create secteurs" ON public.secteurs;
DROP POLICY IF EXISTS "Admins can update secteurs" ON public.secteurs;
DROP POLICY IF EXISTS "Admins can delete secteurs" ON public.secteurs;

CREATE POLICY "Admins can view all secteurs" 
  ON public.secteurs 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create secteurs" 
  ON public.secteurs 
  FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update secteurs" 
  ON public.secteurs 
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete secteurs" 
  ON public.secteurs 
  FOR DELETE 
  USING (public.is_admin(auth.uid()));

-- Enable RLS and create policies for directeurs_ventes table
ALTER TABLE public.directeurs_ventes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all directeurs_ventes" 
  ON public.directeurs_ventes 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create directeurs_ventes" 
  ON public.directeurs_ventes 
  FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update directeurs_ventes" 
  ON public.directeurs_ventes 
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete directeurs_ventes" 
  ON public.directeurs_ventes 
  FOR DELETE 
  USING (public.is_admin(auth.uid()));

-- Enable RLS for superviseurs table (renamed from equipes)
ALTER TABLE public.superviseurs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all superviseurs" 
  ON public.superviseurs 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create superviseurs" 
  ON public.superviseurs 
  FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update superviseurs" 
  ON public.superviseurs 
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete superviseurs" 
  ON public.superviseurs 
  FOR DELETE 
  USING (public.is_admin(auth.uid()));

-- Enable RLS for frequences_visites table (renamed from objectifs_visites)
ALTER TABLE public.frequences_visites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all frequences_visites" 
  ON public.frequences_visites 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create frequences_visites" 
  ON public.frequences_visites 
  FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update frequences_visites" 
  ON public.frequences_visites 
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete frequences_visites" 
  ON public.frequences_visites 
  FOR DELETE 
  USING (public.is_admin(auth.uid()));
