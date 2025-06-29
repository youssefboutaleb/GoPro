
import { useMemo } from 'react';
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

export const useActionPlanCategories = (actionPlans: ActionPlan[] = []) => {
  const { profile } = useAuth();

  return useMemo(() => {
    if (!profile || !actionPlans.length) {
      return {
        own: [],
        supervisorInvolvingMe: [],
        salesDirectorInvolvingMe: [],
        delegate: [],
        supervisor: [],
        salesDirector: [],
        needingMyApproval: [],
        involvingMe: []
      };
    }

    console.log('=== CATEGORIZING ACTION PLANS ===');
    console.log(`Total plans to categorize: ${actionPlans.length}`);
    console.log(`Current user role: ${profile.role}, ID: ${profile.id}`);

    const categories = {
      own: [] as ActionPlan[],
      supervisorInvolvingMe: [] as ActionPlan[],
      salesDirectorInvolvingMe: [] as ActionPlan[],
      delegate: [] as ActionPlan[],
      supervisor: [] as ActionPlan[],
      salesDirector: [] as ActionPlan[],
      needingMyApproval: [] as ActionPlan[],
      involvingMe: [] as ActionPlan[]
    };

    actionPlans.forEach(plan => {
      const isOwnPlan = plan.created_by === profile.id;
      const creatorRole = plan.creator?.role;
      const isTargetedDelegate = plan.targeted_delegates?.includes(profile.id) || false;
      const isTargetedSupervisor = plan.targeted_supervisors?.includes(profile.id) || false;
      const isTargetedSalesDirector = plan.targeted_sales_directors?.includes(profile.id) || false;

      console.log(`Plan ${plan.id} (${plan.location}):`, {
        createdBy: plan.created_by,
        isOwnPlan,
        creatorRole,
        creatorName: plan.creator ? `${plan.creator.first_name} ${plan.creator.last_name}` : 'UNKNOWN',
        isTargetedDelegate,
        isTargetedSupervisor,
        isTargetedSalesDirector,
        supervisorStatus: plan.supervisor_status,
        salesDirectorStatus: plan.sales_director_status
      });

      if (isOwnPlan) {
        categories.own.push(plan);
      } else if (profile.role === 'Delegate') {
        // For delegates, categorize plans from supervisors/sales directors that target them
        if (creatorRole === 'Supervisor' && isTargetedDelegate) {
          categories.supervisorInvolvingMe.push(plan);
        } else if (creatorRole === 'Sales Director' && isTargetedDelegate) {
          categories.salesDirectorInvolvingMe.push(plan);
        }
      } else if (profile.role === 'Supervisor') {
        // For supervisors, categorize plans by creator and approval needs
        if (creatorRole === 'Delegate' && plan.supervisor_status === 'Pending') {
          categories.needingMyApproval.push(plan);
        } else if (creatorRole === 'Sales Director' && isTargetedSupervisor) {
          categories.involvingMe.push(plan);
        } else if (creatorRole === 'Delegate') {
          categories.delegate.push(plan);
        } else if (creatorRole === 'Sales Director') {
          categories.salesDirector.push(plan);
        }
      } else if (profile.role === 'Sales Director') {
        // For sales directors, categorize plans by creator hierarchy and approval needs
        if ((creatorRole === 'Supervisor' || creatorRole === 'Delegate') && plan.sales_director_status === 'Pending') {
          categories.needingMyApproval.push(plan);
        } else if (creatorRole === 'Supervisor') {
          categories.supervisor.push(plan);
        } else if (creatorRole === 'Delegate') {
          categories.delegate.push(plan);
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
