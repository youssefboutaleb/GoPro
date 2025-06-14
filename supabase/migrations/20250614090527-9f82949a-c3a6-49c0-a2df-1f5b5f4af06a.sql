
-- Delete the delegue_produits table
DROP TABLE IF EXISTS public.delegue_produits;

-- Remove the specified columns from the ventes table
ALTER TABLE public.ventes 
DROP COLUMN IF EXISTS montant,
DROP COLUMN IF EXISTS periode,
DROP COLUMN IF EXISTS source;
