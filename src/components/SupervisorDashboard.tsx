
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, BarChart3, Users, ClipboardList } from 'lucide-react';
import SupervisorKPIsDashboard from './SupervisorKPIsDashboard';
import SupervisorTeamReturnIndex from './SupervisorTeamReturnIndex';
import ActionPlanList from './action-plans/ActionPlanList';
import { Profile } from '@/types/auth';

interface SupervisorDashboardProps {
  onSignOut: () => Promise<{ error: any }>;
  signOutLoading: boolean;
  profile: Profile;
}

const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({ onSignOut, signOutLoading, profile }) => {
  const [activeTab, setActiveTab] = useState('kpis');

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
            <SupervisorKPIsDashboard />
          </TabsContent>

          <TabsContent value="team">
            <SupervisorTeamReturnIndex />
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
