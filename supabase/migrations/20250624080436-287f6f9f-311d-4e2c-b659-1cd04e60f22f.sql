
-- Insert sample sales plans using actual delegate IDs from profiles table
-- Get the actual delegate IDs first and create plans accordingly

WITH delegate_ids AS (
  SELECT id, first_name, last_name 
  FROM profiles 
  WHERE role = 'Delegate' 
  AND first_name || ' ' || last_name NOT LIKE '%Dali Affes%'
  LIMIT 10
),
product_brick_combinations AS (
  SELECT 
    d.id as delegate_id,
    d.first_name,
    p.id as product_id,
    p.name as product_name,
    b.id as brick_id,
    b.name as brick_name,
    ROW_NUMBER() OVER (PARTITION BY d.id ORDER BY p.id, b.id) as rn
  FROM delegate_ids d
  CROSS JOIN products p
  CROSS JOIN bricks b
)
INSERT INTO public.sales_plans (delegate_id, product_id, brick_id)
SELECT delegate_id, product_id, brick_id
FROM product_brick_combinations
WHERE rn <= 3; -- Each delegate gets up to 3 plans

-- Insert sales data for 2024 (complete year)
INSERT INTO public.sales (sales_plan_id, year, targets, achievements)
SELECT 
    sp.id,
    2024,
    CASE 
        WHEN p.name = 'Nebilet' THEN ARRAY[15000, 14500, 16000, 15500, 16500, 17000, 16800, 17200, 16900, 17500, 18000, 17800]
        WHEN p.name = 'Algesic' THEN ARRAY[12000, 11800, 12500, 12200, 12800, 13000, 12900, 13200, 12700, 13100, 13500, 13300]
        ELSE ARRAY[8000, 7800, 8200, 8100, 8400, 8600, 8500, 8700, 8300, 8500, 8800, 8600]
    END,
    CASE 
        WHEN p.name = 'Nebilet' THEN ARRAY[14200, 13800, 15600, 16100, 15900, 17200, 16200, 16800, 17400, 16900, 18200, 17100]
        WHEN p.name = 'Algesic' THEN ARRAY[11500, 12100, 12200, 12800, 12400, 13200, 12600, 13000, 13100, 12900, 13800, 13000]
        ELSE ARRAY[7600, 8000, 8100, 8300, 8200, 8800, 8400, 8500, 8600, 8300, 9000, 8400]
    END
FROM public.sales_plans sp
JOIN public.products p ON sp.product_id = p.id;

-- Insert sales data for 2025 (first 6 months)
INSERT INTO public.sales (sales_plan_id, year, targets, achievements)
SELECT 
    sp.id,
    2025,
    CASE 
        WHEN p.name = 'Nebilet' THEN ARRAY[18200, 18500, 18800, 19000, 19200, 19500, 0, 0, 0, 0, 0, 0]
        WHEN p.name = 'Algesic' THEN ARRAY[13800, 14000, 14200, 14500, 14700, 15000, 0, 0, 0, 0, 0, 0]
        ELSE ARRAY[8900, 9100, 9200, 9400, 9500, 9700, 0, 0, 0, 0, 0, 0]
    END,
    CASE 
        WHEN p.name = 'Nebilet' THEN ARRAY[17800, 18200, 19100, 18700, 19400, 19200, 0, 0, 0, 0, 0, 0]
        WHEN p.name = 'Algesic' THEN ARRAY[13600, 14200, 14000, 14800, 14500, 15200, 0, 0, 0, 0, 0, 0]
        ELSE ARRAY[8700, 9300, 9000, 9500, 9300, 9800, 0, 0, 0, 0, 0, 0]
    END
FROM public.sales_plans sp
JOIN public.products p ON sp.product_id = p.id;

-- Insert visit plans using actual delegate and doctor IDs
WITH delegate_doctor_pairs AS (
  SELECT 
    d.id as delegate_id,
    doc.id as doctor_id,
    CASE 
      WHEN ROW_NUMBER() OVER (PARTITION BY d.id ORDER BY doc.id) % 2 = 1 THEN '1'::visit_frequency
      ELSE '2'::visit_frequency
    END as frequency,
    ROW_NUMBER() OVER (PARTITION BY d.id ORDER BY doc.id) as rn
  FROM (
    SELECT id FROM profiles 
    WHERE role = 'Delegate' 
    AND first_name || ' ' || last_name NOT LIKE '%Dali Affes%'
    LIMIT 10
  ) d
  CROSS JOIN doctors doc
)
INSERT INTO public.visit_plans (delegate_id, doctor_id, visit_frequency)
SELECT delegate_id, doctor_id, frequency
FROM delegate_doctor_pairs
WHERE rn <= 2; -- Each delegate gets up to 2 visit plans

-- Insert visit records for 2024
INSERT INTO public.visits (visit_plan_id, visit_date)
SELECT 
    vp.id,
    generate_series(
        '2024-01-15'::date,
        '2024-12-15'::date,
        CASE 
            WHEN vp.visit_frequency = '1' THEN '1 month'::interval
            ELSE '2 months'::interval
        END
    )::date
FROM public.visit_plans vp;

-- Insert visit records for 2025 (first 6 months)
INSERT INTO public.visits (visit_plan_id, visit_date)
SELECT 
    vp.id,
    generate_series(
        '2025-01-15'::date,
        '2025-06-15'::date,
        CASE 
            WHEN vp.visit_frequency = '1' THEN '1 month'::interval
            ELSE '2 months'::interval
        END
    )::date
FROM public.visit_plans vp;
