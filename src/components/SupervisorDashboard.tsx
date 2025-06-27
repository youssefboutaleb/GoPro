import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, BarChart3, Users, ClipboardList } from 'lucide-react';
import SupervisorKPIsDashboard from './SupervisorKPIsDashboard';
import SupervisorTeamReturnIndex from './SupervisorTeamReturnIndex';
import ActionPlanList from './action-plans/ActionPlanList';
import { Profile } from '@/types/auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SupervisorDashboardProps {
  onSignOut: () => Promise<{ error: any }>;
  signOutLoading: boolean;
  profile: Profile;
}

const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({ onSignOut, signOutLoading, profile }) => {
  const { profile: authProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('kpis');

  // Fetch supervised delegates to pass to components
  const { data: supervisedDelegates = [] } = useQuery({
    queryKey: ['supervised-delegates', authProfile?.id],
    queryFn: async () => {
      if (!authProfile?.id || authProfile.role !== 'Supervisor') {
        return [];
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, supervisor_id, role')
        .eq('supervisor_id', authProfile.id)
        .eq('role', 'Delegate');

      if (error) {
        console.error('Error fetching supervised delegates:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!authProfile?.id && authProfile?.role === 'Supervisor',
  });

  const delegateIds = supervisedDelegates.map(d => d.id);

  const handleSignOut = async () => {
    const { error } = await onSignOut();
    if (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Supervisor Dashboard</h1>
              <p className="text-gray-600">Welcome back, {profile.first_name}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              disabled={signOutLoading}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {signOutLoading ? 'Signing out...' : 'Sign Out'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="kpis" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              KPIs Dashboard
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team Performance
            </TabsTrigger>
            <TabsTrigger value="action-plans" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Action Plans
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kpis">
            <SupervisorKPIsDashboard onBack={() => setActiveTab('kpis')} />
          </TabsContent>

          <TabsContent value="team">
            <SupervisorTeamReturnIndex 
              onBack={() => setActiveTab('team')} 
              delegateIds={delegateIds}
            />
          </TabsContent>

          <TabsContent value="action-plans">
            <ActionPlanList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
