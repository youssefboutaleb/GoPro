
-- Fix the handle_new_user trigger function to use fully qualified enum type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Temporarily disable RLS for this function to allow profile insertion
  SET LOCAL row_security = off;
  
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'Delegate')::public.role_type
  );
  RETURN NEW;
END;
$$;
