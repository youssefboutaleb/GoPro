-- Update visit_date records to add random times between 08:00 and 18:00
UPDATE visits 
SET visit_date = visit_date::date + 
  (
    '08:00:00'::time + 
    (random() * interval '10 hours')
  )
WHERE visit_date IS NOT NULL;