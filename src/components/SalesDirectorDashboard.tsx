
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Building, Users, TrendingUp, Target, Calendar, BarChart3, MapPin, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import BreadcrumbNavigation from './common/BreadcrumbNavigation';
import VisitPlansManagement from './VisitPlansManagement';
import RythmeRecrutement from './RythmeRecrutement';
import EnhancedSupervisorDashboard from './enhanced-kpis/EnhancedSupervisorDashboard';
import SalesDirectorOverview from './sales-director/SalesDirectorOverview';
import SalesDirectorTeamStructure from './sales-director/SalesDirectorTeamStructure';
import SalesDirectorVisitKPIs from './sales-director/SalesDirectorVisitKPIs';

type DashboardView = 'overview' | 'visit-plans' | 'recruitment' | 'enhanced-kpis';

const SalesDirectorDashboard: React.FC = () => {
  const { profile, signOut, signOutLoading } = useAuth();
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Generate month names for selector
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const displayMonths = monthNames.slice(0, currentMonth);

  // Fetch supervised supervisors
  const { data: supervisedSupervisors = [], isLoading: supervisorsLoading } = useQuery({
    queryKey: ['supervised-supervisors', profile?.id],
    queryFn: async () => {
      if (!profile?.id || profile.role !== 'Sales Director') {
        return [];
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, supervisor_id, role')
        .eq('supervisor_id', profile.id)
        .eq('role', 'Supervisor');

      if (error) {
        console.error('Error fetching supervised supervisors:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!profile?.id && profile?.role === 'Sales Director',
  });

  const supervisorIds = supervisedSupervisors.map(s => s.id);

  // Fetch all delegates under supervised supervisors
  const { data: allDelegates = [], isLoading: delegatesLoading } = useQuery({
    queryKey: ['all-supervised-delegates', supervisorIds.join(',')],
    queryFn: async () => {
      if (supervisorIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, supervisor_id, role')
        .in('supervisor_id', supervisorIds)
        .eq('role', 'Delegate');

      if (error) {
        console.error('Error fetching all delegates:', error);
        throw error;
      }

      return data || [];
    },
    enabled: supervisorIds.length > 0,
  });

  const delegateIds = allDelegates.map(d => d.id);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleBackToOverview = () => {
    setCurrentView('overview');
  };

  const breadcrumbItems = [
    { label: 'Sales Director Dashboard' }
  ];

  // Return specific view based on current state
  switch (currentView) {
    case 'visit-plans':
      return (
        <VisitPlansManagement 
          onBack={handleBackToOverview} 
          delegateIds={delegateIds}
          supervisorName="Sales Director Team"
        />
      );
    
    case 'recruitment':
      return (
        <RythmeRecrutement 
          onBack={handleBackToOverview} 
          delegateIds={delegateIds}
          supervisorName="Sales Director Team"
        />
      );
    
    case 'enhanced-kpis':
      return (
        <EnhancedSupervisorDashboard 
          onBack={handleBackToOverview}
        />
      );
    
    default:
      break;
  }

  const isLoading = supervisorsLoading || delegatesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Sales Director dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sales Director Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {profile?.first_name} {profile?.last_name} - Managing {supervisedSupervisors.length} supervisors and {allDelegates.length} delegates
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {displayMonths.map((month, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                disabled={signOutLoading}
              >
                {signOutLoading ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <BreadcrumbNavigation 
          items={breadcrumbItems}
          onBack={() => {}}
          showHomeIcon={true}
        />

        {supervisedSupervisors.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Supervised Teams Found</h3>
              <p className="text-gray-600">
                You don't have any supervised supervisors yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Organization Overview */}
            <SalesDirectorOverview 
              supervisedSupervisors={supervisedSupervisors}
              allDelegates={allDelegates}
              selectedMonth={selectedMonth}
            />

            {/* Team Structure */}
            <SalesDirectorTeamStructure 
              supervisedSupervisors={supervisedSupervisors}
              allDelegates={allDelegates}
            />

            {/* Visit KPIs */}
            <SalesDirectorVisitKPIs 
              delegateIds={delegateIds}
              supervisorIds={supervisorIds}
              selectedMonth={selectedMonth}
              currentYear={currentYear}
            />

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card 
                className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => setCurrentView('visit-plans')}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-blue-900">{allDelegates.length}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2">Visit Plans Management</CardTitle>
                  <p className="text-gray-600 text-sm">
                    Track and manage visit plans across all supervised teams
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => setCurrentView('recruitment')}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-gradient-to-r from-green-600 to-green-700 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-green-900">{supervisedSupervisors.length}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2">Rythme de Recrutement</CardTitle>
                  <p className="text-gray-600 text-sm">
                    Analyze recruitment rhythm and sales performance across teams
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => setCurrentView('enhanced-kpis')}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-purple-900">Analytics</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2">Enhanced Analytics</CardTitle>
                  <p className="text-gray-600 text-sm">
                    Advanced KPIs and performance analytics for the entire organization
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesDirectorDashboard;
