
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
        .select(`
          *,
          created_by_profile:profiles!action_plans_created_by_fkey(
            first_name,
            last_name,
            role
          )
        `)
        .order('created_at', { ascending: false });

      if (statusFilter) {
        // Filter by any of the status columns
        query = query.or(`marketing_manager_status.eq.${statusFilter},sales_director_status.eq.${statusFilter},supervisor_status.eq.${statusFilter}`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching action plans:', error);
        throw error;
      }

      console.log('✅ Action plans fetched successfully:', data?.length || 0, 'plans');
      return data as (ActionPlan & {
        created_by_profile: {
          first_name: string;
          last_name: string;
          role: string;
        };
      })[];
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
