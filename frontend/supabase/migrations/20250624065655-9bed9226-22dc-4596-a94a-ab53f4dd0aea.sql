
-- Drop the existing trigger and recreate it to ensure it uses the updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger with the corrected function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
