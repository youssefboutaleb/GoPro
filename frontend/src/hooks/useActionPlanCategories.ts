
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
        // Supervisor-specific categories
        delegatePlans: [],
        involvingMe: [],
        // Sales Director-specific categories
        supervisorPlans: [],
        salesDirectorDelegatePlans: [],
        marketingManagerInvolvingMe: []
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
      // Supervisor-specific categories
      delegatePlans: [] as ActionPlan[],
      involvingMe: [] as ActionPlan[],
      // Sales Director-specific categories
      supervisorPlans: [] as ActionPlan[],
      salesDirectorDelegatePlans: [] as ActionPlan[],
      marketingManagerInvolvingMe: [] as ActionPlan[]
    };

    actionPlans.forEach(plan => {
      const isOwnPlan = plan.created_by === profile.id;
      const isTargeted = plan.targeted_delegates?.includes(profile.id) || false;
      const isSupervisorTargeted = plan.targeted_supervisors?.includes(profile.id) || false;
      const creatorRole = plan.creator?.role;

      console.log(`Plan ${plan.id} (${plan.location}):`, {
        createdBy: plan.created_by,
        isOwnPlan,
        creatorRole,
        creatorName: plan.creator ? `${plan.creator.first_name} ${plan.creator.last_name}` : 'UNKNOWN',
        isTargeted,
        isSupervisorTargeted,
        targetedDelegates: plan.targeted_delegates,
        targetedSupervisors: plan.targeted_supervisors
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
      } else if (profile.role === 'Supervisor') {
        // For supervisors, use specific categorization logic
        if (creatorRole === 'Delegate') {
          // Check if this delegate is under this supervisor's supervision
          // This will be handled by the action plans query which should only return
          // plans from delegates under supervision
          categories.delegatePlans.push(plan);
        } else if (creatorRole === 'Sales Director' && isSupervisorTargeted) {
          // Plans from sales directors that involve this supervisor
          categories.involvingMe.push(plan);
        }
      } else if (profile.role === 'Sales Director') {
        // For sales directors, use specific categorization logic
        if (creatorRole === 'Supervisor') {
          // Plans from supervisors under direct supervision that need approval
          categories.supervisorPlans.push(plan);
        } else if (creatorRole === 'Delegate') {
          // Plans from delegates under supervision that need approval
          categories.salesDirectorDelegatePlans.push(plan);
        } else if (creatorRole === 'Marketing Manager' && plan.targeted_sales_directors?.includes(profile.id)) {
          // Plans from marketing managers that involve this sales director
          categories.marketingManagerInvolvingMe.push(plan);
        }
      } else {
        // For other roles (Marketing Managers, etc.), use general categorization
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
