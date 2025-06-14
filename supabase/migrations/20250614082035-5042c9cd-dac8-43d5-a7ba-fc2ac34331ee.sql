
-- Step 1: Create new tables with the optimized structure

-- First, create the new 'ventes' table (renamed from 'ventes_produits')
CREATE TABLE public.ventes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delegue_id UUID REFERENCES delegues(id),
    brick_id UUID REFERENCES bricks(id),
    produit_id UUID REFERENCES produits(id),
    montant NUMERIC NOT NULL,
    periode DATE NOT NULL,
    source TEXT
);

-- Migrate data from ventes_produits to ventes
INSERT INTO public.ventes (id, delegue_id, brick_id, produit_id, montant, periode, source)
SELECT id, delegue_id, brick_id, produit_id, montant, periode, source
FROM public.ventes_produits;

-- Step 2: Create new 'objectifs_ventes' table (renamed from 'objectifs_produits')
CREATE TABLE public.objectifs_ventes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vente_id UUID REFERENCES ventes(id),
    annee INT NOT NULL,
    objectif_mensuel NUMERIC[12] DEFAULT ARRAY[0,0,0,0,0,0,0,0,0,0,0,0],
    vente_realisee NUMERIC[12] DEFAULT ARRAY[0,0,0,0,0,0,0,0,0,0,0,0]
);

-- Step 3: Create new 'objectifs_visites' table (renamed from 'delegue_medecins')
CREATE TABLE public.objectifs_visites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delegue_id UUID REFERENCES delegues(id),
    medecin_id UUID REFERENCES medecins(id),
    frequence_visite INT CHECK (frequence_visite IN (1, 2))
);

-- Migrate data from delegue_medecins to objectifs_visites
INSERT INTO public.objectifs_visites (id, delegue_id, medecin_id, frequence_visite)
SELECT id, delegue_id, medecin_id, 
       CASE 
         WHEN frequence_visite = '1'::frequence_visite THEN 1
         WHEN frequence_visite = '2'::frequence_visite THEN 2
         ELSE 1
       END
FROM public.delegue_medecins;

-- Step 4: Create new visites table structure
CREATE TABLE public.visites_new (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    objectif_visite_id UUID REFERENCES objectifs_visites(id),
    date_visite DATE NOT NULL
);

-- Step 5: Drop old tables after data migration
DROP TABLE IF EXISTS public.ventes_produits;
DROP TABLE IF EXISTS public.objectifs_produits;
DROP TABLE IF EXISTS public.delegue_medecins;
DROP TABLE IF EXISTS public.rapports_mensuels;

-- Rename new visites table
DROP TABLE IF EXISTS public.visites;
ALTER TABLE public.visites_new RENAME TO visites;

-- Step 6: Add indexes for better performance
CREATE INDEX idx_ventes_delegue_id ON public.ventes(delegue_id);
CREATE INDEX idx_ventes_brick_id ON public.ventes(brick_id);
CREATE INDEX idx_ventes_produit_id ON public.ventes(produit_id);
CREATE INDEX idx_ventes_periode ON public.ventes(periode);

CREATE INDEX idx_objectifs_ventes_vente_id ON public.objectifs_ventes(vente_id);
CREATE INDEX idx_objectifs_ventes_annee ON public.objectifs_ventes(annee);

CREATE INDEX idx_objectifs_visites_delegue_id ON public.objectifs_visites(delegue_id);
CREATE INDEX idx_objectifs_visites_medecin_id ON public.objectifs_visites(medecin_id);

CREATE INDEX idx_visites_objectif_visite_id ON public.visites(objectif_visite_id);
CREATE INDEX idx_visites_date_visite ON public.visites(date_visite);
