
import { Database } from '@/integrations/supabase/types';

export type Visit = Database['public']['Tables']['visits']['Row'];
export type Doctor = Database['public']['Tables']['doctors']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type VisitStatus = Database['public']['Enums']['visit_status'];

// Extended type for visit with joined data
export type VisitWithJoins = Visit & {
  doctors?: Pick<Doctor, 'first_name' | 'last_name' | 'specialty'> | null;
  profiles?: Pick<Profile, 'first_name' | 'last_name'> | null;
};

export interface VisitFormData {
  doctor_id: string;
  visit_date: string;
  status: VisitStatus;
  notes: string;
}

export const statusLabels = {
  'planifiee': 'Planifiée',
  'realisee': 'Réalisée',
  'annulee': 'Annulée',
};

export const statusColors = {
  'planifiee': 'bg-blue-100 text-blue-800',
  'realisee': 'bg-green-100 text-green-800',
  'annulee': 'bg-red-100 text-red-800',
};
