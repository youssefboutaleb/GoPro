
-- Create the new enum types
CREATE TYPE action_types AS ENUM ('Staff', 'ePU', 'Congress', 'Travel', 'Gift');
CREATE TYPE action_status AS ENUM ('Pending', 'Approved', 'Rejected');

-- Add new columns to action_plans table
ALTER TABLE action_plans 
ADD COLUMN targeted_delegates UUID[],
ADD COLUMN targeted_supervisors UUID[],
ADD COLUMN targeted_sales_directors UUID[];

-- Create temporary columns for data migration
ALTER TABLE action_plans 
ADD COLUMN new_type action_types DEFAULT 'Staff',
ADD COLUMN new_supervisor_status action_status DEFAULT 'Pending',
ADD COLUMN new_sales_director_status action_status DEFAULT 'Pending',
ADD COLUMN new_marketing_manager_status action_status DEFAULT 'Pending';

-- Migrate existing data to new enum columns
UPDATE action_plans 
SET new_type = CASE 
  WHEN type = 'Staff' THEN 'Staff'::action_types
  WHEN type = 'ePU' THEN 'ePU'::action_types
  WHEN type = 'Congress' THEN 'Congress'::action_types
  WHEN type = 'Travel' THEN 'Travel'::action_types
  WHEN type = 'Gift' THEN 'Gift'::action_types
  ELSE 'Staff'::action_types
END;

UPDATE action_plans 
SET new_supervisor_status = CASE 
  WHEN supervisor_status = 'Approved' THEN 'Approved'::action_status
  WHEN supervisor_status = 'Rejected' THEN 'Rejected'::action_status
  ELSE 'Pending'::action_status
END;

UPDATE action_plans 
SET new_sales_director_status = CASE 
  WHEN sales_director_status = 'Approved' THEN 'Approved'::action_status
  WHEN sales_director_status = 'Rejected' THEN 'Rejected'::action_status
  ELSE 'Pending'::action_status
END;

UPDATE action_plans 
SET new_marketing_manager_status = CASE 
  WHEN marketing_manager_status = 'Approved' THEN 'Approved'::action_status
  WHEN marketing_manager_status = 'Rejected' THEN 'Rejected'::action_status
  ELSE 'Pending'::action_status
END;

-- Drop old columns
ALTER TABLE action_plans 
DROP COLUMN type,
DROP COLUMN supervisor_status,
DROP COLUMN sales_director_status,
DROP COLUMN marketing_manager_status;

-- Rename new columns to original names
ALTER TABLE action_plans 
RENAME COLUMN new_type TO type;
ALTER TABLE action_plans 
RENAME COLUMN new_supervisor_status TO supervisor_status;
ALTER TABLE action_plans 
RENAME COLUMN new_sales_director_status TO sales_director_status;
ALTER TABLE action_plans 
RENAME COLUMN new_marketing_manager_status TO marketing_manager_status;

-- Set NOT NULL constraints and defaults for the renamed columns
ALTER TABLE action_plans 
ALTER COLUMN type SET NOT NULL,
ALTER COLUMN type SET DEFAULT 'Staff'::action_types,
ALTER COLUMN supervisor_status SET NOT NULL,
ALTER COLUMN supervisor_status SET DEFAULT 'Pending'::action_status,
ALTER COLUMN sales_director_status SET NOT NULL,
ALTER COLUMN sales_director_status SET DEFAULT 'Pending'::action_status,
ALTER COLUMN marketing_manager_status SET NOT NULL,
ALTER COLUMN marketing_manager_status SET DEFAULT 'Pending'::action_status;
