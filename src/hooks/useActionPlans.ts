
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Database } from '@/integrations/supabase/types';

type ActionPlan = Database['public']['Tables']['action_plans']['Row'] & {
  creator?: {
    id: string;
    first_name: string;
    last_name: string;
    role: string;
  };
};

export const useActionPlans = () => {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['action-plans', user?.id, profile?.role],
    queryFn: async (): Promise<ActionPlan[]> => {
      if (!user || !profile) return [];
      
      console.log('=== FETCHING ACTION PLANS ===');
      console.log('Current user profile:', {
        id: profile.id,
        role: profile.role,
        supervisorId: profile.supervisor_id
      });
      
      // Fetch all accessible action plans in one query
      // RLS policies will automatically filter based on user permissions
      const { data: actionPlansData, error: plansError } = await supabase
        .from('action_plans')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (plansError) {
        console.error('Error fetching action plans:', plansError);
        throw plansError;
      }
      
      console.log(`Found ${actionPlansData?.length || 0} accessible action plans`);
      
      if (!actionPlansData || actionPlansData.length === 0) {
        return [];
      }

      // Get unique creator IDs
      const creatorIds = [...new Set(actionPlansData.map(plan => plan.created_by))].filter(Boolean);
      console.log('Creator IDs to fetch:', creatorIds);
      
      // Fetch creator profiles - this will respect RLS policies
      const { data: creatorsData, error: creatorsError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .in('id', creatorIds);

      if (creatorsError) {
        console.error('Error fetching creator profiles:', creatorsError);
        // Don't throw here, just continue without creator data
      }

      console.log(`Fetched ${creatorsData?.length || 0} creator profiles out of ${creatorIds.length} requested`);

      // Create creators map
      const creatorsMap = new Map();
      if (creatorsData) {
        creatorsData.forEach(creator => {
          creatorsMap.set(creator.id, creator);
        });
      }
      
      // Transform and attach creator information
      const transformedData: ActionPlan[] = actionPlansData.map(plan => ({
        ...plan,
        creator: creatorsMap.get(plan.created_by) || undefined
      }));
      
      console.log('=== TRANSFORMATION COMPLETE ===');
      console.log('Plans with creators:', transformedData.filter(p => p.creator).length);
      console.log('Plans without creators:', transformedData.filter(p => !p.creator).length);
      
      return transformedData;
    },
    enabled: !!user && !!profile,
  });
};
