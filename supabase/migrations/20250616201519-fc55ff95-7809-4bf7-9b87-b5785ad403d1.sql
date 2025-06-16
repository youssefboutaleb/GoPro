
-- Rename the 'role' column to 'user_type' in the profiles table
ALTER TABLE public.profiles RENAME COLUMN role TO user_type;
