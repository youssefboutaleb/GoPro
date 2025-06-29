
import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { Database } from '@/integrations/supabase/types';

type ActionPlan = Database['public']['Tables']['action_plans']['Row'] & {
  creator?: {
    id: string;
    first_name: string;
    last_name: string;
    role: string;
    supervisor_id?: string;
  };
};

export const useActionPlanCategories = (actionPlans: ActionPlan[] = []) => {
  const { profile } = useAuth();

  return useMemo(() => {
    if (!profile || !actionPlans.length) {
      return {
        own: [],
        involvingMe: [],
        delegatePlans: [],
        supervisorPlans: [],
      };
    }

    console.log('=== CATEGORIZING ACTION PLANS ===');
    console.log(`Total plans to categorize: ${actionPlans.length}`);
    console.log(`Current user role: ${profile.role}, ID: ${profile.id}`);

    const categories = {
      own: [] as ActionPlan[],
      involvingMe: [] as ActionPlan[],
      delegatePlans: [] as ActionPlan[],
      supervisorPlans: [] as ActionPlan[],
    };

    actionPlans.forEach(plan => {
      const isOwnPlan = plan.created_by === profile.id;
      const creatorRole = plan.creator?.role;
      const creatorSupervisorId = plan.creator?.supervisor_id;
      const isTargetedSupervisor = plan.targeted_supervisors?.includes(profile.id) || false;
      const isTargetedSalesDirector = plan.targeted_sales_directors?.includes(profile.id) || false;

      console.log(`Plan ${plan.id} (${plan.location}):`, {
        createdBy: plan.created_by,
        isOwnPlan,
        creatorRole,
        creatorSupervisorId,
        creatorName: plan.creator ? `${plan.creator.first_name} ${plan.creator.last_name}` : 'UNKNOWN',
        isTargetedSupervisor,
        isTargetedSalesDirector,
        supervisorStatus: plan.supervisor_status,
        salesDirectorStatus: plan.sales_director_status
      });

      if (isOwnPlan) {
        categories.own.push(plan);
      } else if (profile.role === 'Supervisor') {
        // For supervisors
        if (creatorRole === 'Sales Director' && isTargetedSupervisor) {
          // Plans from sales directors that target this supervisor
          categories.involvingMe.push(plan);
        } else if (creatorRole === 'Delegate' && creatorSupervisorId === profile.id) {
          // Plans from delegates under this supervisor's direct supervision
          categories.delegatePlans.push(plan);
        }
      } else if (profile.role === 'Sales Director') {
        // For sales directors
        if (creatorRole === 'Marketing Manager' && isTargetedSalesDirector) {
          // Plans from marketing managers that target this sales director
          categories.involvingMe.push(plan);
        } else if (creatorRole === 'Supervisor' && creatorSupervisorId === profile.id) {
          // Plans from supervisors under this sales director's direct supervision
          categories.supervisorPlans.push(plan);
        } else if (creatorRole === 'Delegate') {
          // Plans from delegates - check if they're under supervision of supervisors that this sales director supervises
          const isUnderSupervision = actionPlans.some(supervisorPlan => 
            supervisorPlan.creator?.id === creatorSupervisorId && 
            supervisorPlan.creator?.role === 'Supervisor' &&
            supervisorPlan.creator?.supervisor_id === profile.id
          );
          
          // Alternative check: directly check if the delegate's supervisor is supervised by this sales director
          if (isUnderSupervision || 
              actionPlans.find(p => p.creator?.id === creatorSupervisorId)?.creator?.supervisor_id === profile.id) {
            categories.delegatePlans.push(plan);
          }
        }
      }
    });

    console.log('=== CATEGORIZATION RESULTS ===');
    Object.entries(categories).forEach(([key, plans]) => {
      console.log(`${key}: ${plans.length} plans`);
    });

    return categories;
  }, [actionPlans, profile]);
};
