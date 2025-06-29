
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useProfilesForActionPlans = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['profiles_for_action_plans', profile?.id, profile?.role],
    queryFn: async () => {
      console.log('🔍 Fetching profiles for action plans targeting...');
      
      if (!profile) {
        console.log('❌ No profile available');
        return { delegates: [], supervisors: [], salesDirectors: [] };
      }

      let delegatesQuery = supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .eq('role', 'Delegate');

      let supervisorsQuery = supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .eq('role', 'Supervisor');

      let salesDirectorsQuery = supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .eq('role', 'Sales Director');

      // Apply filters based on user's role and hierarchy
      if (profile.role === 'Supervisor') {
        // Supervisors can only target their own delegates
        delegatesQuery = delegatesQuery.eq('supervisor_id', profile.id);
        // Supervisors cannot target other supervisors or sales directors
        supervisorsQuery = supervisorsQuery.eq('id', 'non-existent-id'); // No results
        salesDirectorsQuery = salesDirectorsQuery.eq('id', 'non-existent-id'); // No results
      } else if (profile.role === 'Sales Director') {
        // Sales Directors can target their supervised delegates and supervisors
        delegatesQuery = delegatesQuery.or(`supervisor_id.eq.${profile.id},supervisor_id.in.(select id from profiles where supervisor_id = '${profile.id}' and role = 'Supervisor')`);
        supervisorsQuery = supervisorsQuery.eq('supervisor_id', profile.id);
        // Sales Directors cannot target other sales directors
        salesDirectorsQuery = salesDirectorsQuery.eq('id', 'non-existent-id');
      }
      // Admins and Marketing Managers can see all profiles (no additional filters needed)

      const [delegatesResult, supervisorsResult, salesDirectorsResult] = await Promise.all([
        delegatesQuery,
        supervisorsQuery,
        salesDirectorsQuery,
      ]);

      if (delegatesResult.error) {
        console.error('❌ Error fetching delegates:', delegatesResult.error);
        throw delegatesResult.error;
      }

      if (supervisorsResult.error) {
        console.error('❌ Error fetching supervisors:', supervisorsResult.error);
        throw supervisorsResult.error;
      }

      if (salesDirectorsResult.error) {
        console.error('❌ Error fetching sales directors:', salesDirectorsResult.error);
        throw salesDirectorsResult.error;
      }

      console.log('✅ Profiles fetched successfully:', {
        delegates: delegatesResult.data?.length || 0,
        supervisors: supervisorsResult.data?.length || 0,
        salesDirectors: salesDirectorsResult.data?.length || 0,
      });

      return {
        delegates: delegatesResult.data || [],
        supervisors: supervisorsResult.data || [],
        salesDirectors: salesDirectorsResult.data || [],
      };
    },
    enabled: !!profile,
  });
};
