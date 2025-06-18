
-- Rename columns in the sales table
ALTER TABLE public.sales 
RENAME COLUMN monthly_objective TO targets;

ALTER TABLE public.sales 
RENAME COLUMN sales_achieved TO achievements;
