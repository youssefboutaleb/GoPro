
-- Step 1: Rename the enum type from user_type to role_type
ALTER TYPE public.user_type RENAME TO role_type;

-- Step 2: Update the profiles table
-- Add the new columns first
ALTER TABLE public.profiles 
ADD COLUMN first_name TEXT NOT NULL DEFAULT '',
ADD COLUMN last_name TEXT NOT NULL DEFAULT '';

-- Rename the user_type column to role (the type is already renamed above)
ALTER TABLE public.profiles 
RENAME COLUMN user_type TO role;

-- Remove the default values now that we've added the columns
ALTER TABLE public.profiles 
ALTER COLUMN first_name DROP DEFAULT,
ALTER COLUMN last_name DROP DEFAULT;
