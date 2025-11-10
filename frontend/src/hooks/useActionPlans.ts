
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/apiService';
import { useAuth } from './useAuth';
import { ActionPlan, Profile } from '@/types/backend';

type ActionPlanWithCreator = ActionPlan & {
  creator?: {
    id: string;
    first_name: string;
    last_name: string;
    role: string;
  };
  // Legacy snake_case fields for compatibility
  created_by?: string;
  supervisor_status?: string;
  sales_director_status?: string;
  marketing_manager_status?: string;
  is_executed?: boolean;
  targeted_doctors?: string[];
  targeted_bricks?: string[];
  targeted_delegates?: string[];
  targeted_supervisors?: string[];
  targeted_sales_directors?: string[];
  targeted_products?: string[];
  created_at?: string;
  updated_at?: string;
};

const getToken = () => localStorage.getItem('keycloak_token') || undefined;

export const useActionPlans = () => {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['action-plans', user?.id, profile?.role],
    queryFn: async (): Promise<ActionPlanWithCreator[]> => {
      if (!user || !profile) return [];
      
      console.log('=== FETCHING ACTION PLANS ===');
      console.log('Current user profile:', {
        id: profile.id,
        role: profile.role,
        supervisorId: profile.supervisorId || profile.supervisor_id
      });
      
      // Fetch all action plans
      const actionPlansData = await apiService.getActionPlans(getToken());
      
      console.log(`Found ${actionPlansData?.length || 0} accessible action plans`);
      
      if (!actionPlansData || actionPlansData.length === 0) {
        return [];
      }

      // Get unique creator IDs
      const creatorIds = [...new Set(actionPlansData.map((plan: any) => plan.createdBy || plan.created_by))].filter(Boolean);
      console.log('Creator IDs to fetch:', creatorIds);
      
      // Fetch creator profiles
      let creatorsData: Profile[] = [];
      try {
        const allProfiles = await apiService.getProfiles(getToken());
        creatorsData = allProfiles.filter((p: any) => creatorIds.includes(p.id));
      } catch (error) {
        console.error('Error fetching creator profiles:', error);
        // Continue without creator data
      }

      console.log(`Fetched ${creatorsData?.length || 0} creator profiles out of ${creatorIds.length} requested`);

      // Create creators map
      const creatorsMap = new Map();
      creatorsData.forEach(creator => {
        creatorsMap.set(creator.id, {
          id: creator.id,
          first_name: creator.firstName,
          last_name: creator.lastName,
          role: creator.role,
        });
      });
      
      // Transform and attach creator information
      const transformedData: ActionPlanWithCreator[] = actionPlansData.map((plan: any) => {
        const createdBy = plan.createdBy || plan.created_by;
        const creator = creatorsMap.get(createdBy);
        
        return {
          ...plan,
          created_by: createdBy,
          supervisor_status: plan.supervisorStatus || plan.supervisor_status,
          sales_director_status: plan.salesDirectorStatus || plan.sales_director_status,
          marketing_manager_status: plan.marketingManagerStatus || plan.marketing_manager_status,
          is_executed: plan.isExecuted !== undefined ? plan.isExecuted : plan.is_executed,
          targeted_doctors: plan.targetedDoctors || plan.targeted_doctors,
          targeted_bricks: plan.targetedBricks || plan.targeted_bricks,
          targeted_delegates: plan.targetedDelegates || plan.targeted_delegates,
          targeted_supervisors: plan.targetedSupervisors || plan.targeted_supervisors,
          targeted_sales_directors: plan.targetedSalesDirectors || plan.targeted_sales_directors,
          targeted_products: plan.targetedProducts || plan.targeted_products,
          created_at: plan.createdAt || plan.created_at,
          updated_at: plan.updatedAt || plan.updated_at,
          creator: creator || undefined,
        };
      });
      
      console.log('=== TRANSFORMATION COMPLETE ===');
      console.log('Plans with creators:', transformedData.filter(p => p.creator).length);
      
      return transformedData;
    },
    enabled: !!user && !!profile,
  });
};
