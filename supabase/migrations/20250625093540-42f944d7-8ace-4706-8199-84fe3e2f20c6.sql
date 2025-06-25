
-- Update supervisor profiles to be supervised by the Sales Director
-- Replace the Sales Director ID with the actual ID from your profile
UPDATE public.profiles 
SET supervisor_id = '2e1389a3-58a7-4cca-a38b-cb500fc317b9'
WHERE role = 'Supervisor' 
AND supervisor_id IS NULL;

-- If you want to see which supervisors will be affected, you can run this query first:
-- SELECT id, first_name, last_name, role, supervisor_id 
-- FROM public.profiles 
-- WHERE role = 'Supervisor';
