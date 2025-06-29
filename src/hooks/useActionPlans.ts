
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type ActionPlan = Database['public']['Tables']['action_plans']['Row'];
type ActionPlanInsert = Database['public']['Tables']['action_plans']['Insert'];
type ActionPlanUpdate = Database['public']['Tables']['action_plans']['Update'];

export const useActionPlans = (statusFilter?: string) => {
  const queryClient = useQueryClient();

  const {
    data: actionPlans,
    isLoading,
    error
  } = useQuery({
    queryKey: ['action_plans', statusFilter],
    queryFn: async () => {
      console.log('🔍 Fetching action plans with filter:', statusFilter);
      
      let query = supabase
        .from('action_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter) {
        // Filter by any of the status columns
        query = query.or(`marketing_manager_status.eq.${statusFilter},sales_director_status.eq.${statusFilter},supervisor_status.eq.${statusFilter}`);
      }

      const { data: actionPlansData, error } = await query;

      if (error) {
        console.error('❌ Error fetching action plans:', error);
        throw error;
      }

      // Fetch profile information separately for created_by users
      if (actionPlansData && actionPlansData.length > 0) {
        const createdByIds = [...new Set(actionPlansData.map(plan => plan.created_by))];
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, role')
          .in('id', createdByIds);

        if (profilesError) {
          console.error('❌ Error fetching profiles:', profilesError);
          // Continue without profile data rather than failing completely
        }

        // Map profile data to action plans
        const actionPlansWithProfiles = actionPlansData.map(plan => ({
          ...plan,
          created_by_profile: profilesData?.find(profile => profile.id === plan.created_by) || null
        }));

        console.log('✅ Action plans fetched successfully:', actionPlansWithProfiles.length, 'plans');
        return actionPlansWithProfiles;
      }

      console.log('✅ Action plans fetched successfully:', 0, 'plans');
      return [];
    },
  });

  const createActionPlan = useMutation({
    mutationFn: async (actionPlan: ActionPlanInsert) => {
      console.log('🔄 Creating action plan:', actionPlan);
      
      const { data, error } = await supabase
        .from('action_plans')
        .insert(actionPlan)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating action plan:', error);
        throw error;
      }

      console.log('✅ Action plan created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action_plans'] });
      toast.success('Action plan created successfully');
    },
    onError: (error) => {
      console.error('❌ Failed to create action plan:', error);
      toast.error('Failed to create action plan');
    },
  });

  const updateActionPlan = useMutation({
    mutationFn: async ({ id, ...updates }: ActionPlanUpdate & { id: string }) => {
      console.log('🔄 Updating action plan:', id, updates);
      
      const { data, error } = await supabase
        .from('action_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating action plan:', error);
        throw error;
      }

      console.log('✅ Action plan updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action_plans'] });
      toast.success('Action plan updated successfully');
    },
    onError: (error) => {
      console.error('❌ Failed to update action plan:', error);
      toast.error('Failed to update action plan');
    },
  });

  const deleteActionPlan = useMutation({
    mutationFn: async (id: string) => {
      console.log('🔄 Deleting action plan:', id);
      
      const { error } = await supabase
        .from('action_plans')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting action plan:', error);
        throw error;
      }

      console.log('✅ Action plan deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action_plans'] });
      toast.success('Action plan deleted successfully');
    },
    onError: (error) => {
      console.error('❌ Failed to delete action plan:', error);
      toast.error('Failed to delete action plan');
    },
  });

  return {
    actionPlans: actionPlans || [],
    isLoading,
    error,
    createActionPlan,
    updateActionPlan,
    deleteActionPlan,
  };
};
