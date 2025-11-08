
-- Add sector_id column to profiles table as foreign key to sectors table
ALTER TABLE public.profiles 
ADD COLUMN sector_id uuid REFERENCES public.sectors(id);

-- Add index for better query performance
CREATE INDEX idx_profiles_sector_id ON public.profiles(sector_id);
