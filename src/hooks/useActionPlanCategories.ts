
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
        salesDirector: []
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
      salesDirector: [] as ActionPlan[]
    };

    actionPlans.forEach(plan => {
      const isOwnPlan = plan.created_by === profile.id;
      const isTargeted = plan.targeted_delegates?.includes(profile.id) || false;
      const creatorRole = plan.creator?.role;

      console.log(`Plan ${plan.id} (${plan.location}):`, {
        createdBy: plan.created_by,
        isOwnPlan,
        creatorRole,
        creatorName: plan.creator ? `${plan.creator.first_name} ${plan.creator.last_name}` : 'UNKNOWN',
        isTargeted,
        targetedDelegates: plan.targeted_delegates
      });

      if (isOwnPlan) {
        categories.own.push(plan);
      } else if (profile.role === 'Delegate') {
        // For delegates, categorize plans from supervisors/sales directors that target them
        if (creatorRole === 'Supervisor' && isTargeted) {
          categories.supervisorInvolvingMe.push(plan);
        } else if (creatorRole === 'Sales Director' && isTargeted) {
          categories.salesDirectorInvolvingMe.push(plan);
        }
      } else {
        // For supervisors/sales directors, categorize by creator role
        if (creatorRole === 'Delegate') {
          categories.delegate.push(plan);
        } else if (creatorRole === 'Supervisor') {
          categories.supervisor.push(plan);
        } else if (creatorRole === 'Sales Director') {
          categories.salesDirector.push(plan);
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
