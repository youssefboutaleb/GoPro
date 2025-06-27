import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, BarChart3, Users, ClipboardList } from 'lucide-react';
import SalesDirectorKPIsDashboard from './SalesDirectorKPIsDashboard';
import ReturnIndexAnalysis from './ReturnIndexAnalysis';
import ActionPlanList from './action-plans/ActionPlanList';
import { Profile } from '@/types/auth';

interface SalesDirectorDashboardProps {
  onSignOut: () => Promise<{ error: any }>;
  signOutLoading: boolean;
  profile: Profile;
}

const SalesDirectorDashboard: React.FC<SalesDirectorDashboardProps> = ({ onSignOut, signOutLoading, profile }) => {
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
              <h1 className="text-2xl font-bold text-gray-900">Sales Director Dashboard</h1>
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
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Return Index Analysis
            </TabsTrigger>
            <TabsTrigger value="action-plans" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Action Plans
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kpis">
            <SalesDirectorKPIsDashboard onBack={() => setActiveTab('kpis')} />
          </TabsContent>

          <TabsContent value="analysis">
            <ReturnIndexAnalysis onBack={() => setActiveTab('analysis')} />
          </TabsContent>

          <TabsContent value="action-plans">
            <ActionPlanList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SalesDirectorDashboard;
