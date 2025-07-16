-- Create a function to get visit records for a delegate with proper joins
CREATE OR REPLACE FUNCTION get_visit_records_for_delegate(delegate_user_id uuid)
RETURNS TABLE (
  visit_id uuid,
  visit_date timestamp with time zone,
  visit_plan_id uuid,
  doctor_first_name text,
  doctor_last_name text,
  doctor_specialty text,
  brick_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id as visit_id,
    v.visit_date,
    v.visit_plan_id,
    d.first_name as doctor_first_name,
    d.last_name as doctor_last_name,
    d.specialty as doctor_specialty,
    b.name as brick_name
  FROM visits v
  INNER JOIN visit_plans vp ON v.visit_plan_id = vp.id
  INNER JOIN doctors d ON vp.doctor_id = d.id
  INNER JOIN bricks b ON d.brick_id = b.id
  WHERE vp.delegate_id = delegate_user_id
  ORDER BY v.visit_date DESC;
END;
$$;