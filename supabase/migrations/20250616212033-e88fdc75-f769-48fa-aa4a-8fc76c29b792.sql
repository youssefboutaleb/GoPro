
-- Update delegate_id values in visit_plans table
UPDATE public.visit_plans 
SET delegate_id = '5ec984d9-0bdc-48e5-ab2b-ec19c858bbc6' 
WHERE delegate_id = '91b71537-cd48-4e52-89c5-2944dfc23c2c';

UPDATE public.visit_plans 
SET delegate_id = 'cbe54a0e-7159-4118-ae30-c614b426eccf' 
WHERE delegate_id = '001cb22c-ce9a-42e3-a3d3-ecff1829bcf3';

-- Update delegate_id values in sales_plans table
UPDATE public.sales_plans 
SET delegate_id = '5ec984d9-0bdc-48e5-ab2b-ec19c858bbc6' 
WHERE delegate_id = '91b71537-cd48-4e52-89c5-2944dfc23c2c';

UPDATE public.sales_plans 
SET delegate_id = 'cbe54a0e-7159-4118-ae30-c614b426eccf' 
WHERE delegate_id = '001cb22c-ce9a-42e3-a3d3-ecff1829bcf3';

-- Add foreign key constraints for delegate_id
ALTER TABLE public.visit_plans 
ADD CONSTRAINT visit_plans_delegate_id_fkey 
FOREIGN KEY (delegate_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.sales_plans 
ADD CONSTRAINT sales_plans_delegate_id_fkey 
FOREIGN KEY (delegate_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
