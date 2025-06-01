
import { Database } from '@/integrations/supabase/types';

export type Doctor = Database['public']['Tables']['doctors']['Row'];
export type Brick = Database['public']['Tables']['bricks']['Row'];
export type DoctorSpecialty = Database['public']['Enums']['doctor_specialty'];

export type DoctorWithBrick = Doctor & {
  bricks?: Pick<Brick, 'name' | 'region'> | null;
};

export interface DoctorFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  specialty: DoctorSpecialty;
  brick_id: string;
  active: boolean;
}

export const specialtyLabels: Record<DoctorSpecialty, string> = {
  'generaliste': 'Généraliste',
  'cardiologue': 'Cardiologue',
  'pneumologue': 'Pneumologue',
  'interniste': 'Interniste',
};
