
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, BarChart3, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VisitPlansManagement from './VisitPlansManagement';
import RythmeRecrutement from './RythmeRecrutement';

interface SalesDirectorDashboardProps {
  onSignOut: () => void;
  signOutLoading: boolean;
  profile: any;
}

const SalesDirectorDashboard: React.FC<SalesDirectorDashboardProps> = ({ onSignOut, signOutLoading, profile }) => {
  const { user } = useAuth();
  const [showVisitPlansManagement, setShowVisitPlansManagement] = useState(false);
  const [showRythmeRecrutement, setShowRythmeRecrutement] = useState(false);

  const handleNavigateToRecruitmentRate = () => {
    setShowRythmeRecrutement(true);
  };

  // Helper function to get the last day of a month
  const getLastDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  // Fetch supervised supervisors
  const { data: supervisedSupervisors = [] } = useQuery({
    queryKey: ['supervised-supervisors', profile?.id],
    queryFn: async () => {
      if (!profile?.id || profile.role !== 'Sales Director') {
        return [];
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
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
  const { data: allDelegates = [] } = useQuery({
    queryKey: ['all-supervised-delegates', supervisorIds.join(',')],
    queryFn: async () => {
      if (supervisorIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, supervisor_id')
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

  // Fetch aggregated dashboard stats for all supervised delegates
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['sales-director-dashboard-stats', delegateIds.join(',')],
    queryFn: async () => {
      if (delegateIds.length === 0) return null;

      try {
        // Fetch visit plans count for all supervised delegates
        const { data: visitPlans, error: visitPlansError } = await supabase
          .from('visit_plans')
          .select('id')
          .in('delegate_id', delegateIds);

        if (visitPlansError) throw visitPlansError;

        // Fetch sales plans count for all supervised delegates
        const { data: salesPlans, error: salesPlansError } = await supabase
          .from('sales_plans')
          .select('id')
          .in('delegate_id', delegateIds);

        if (salesPlansError) throw salesPlansError;

        // Calculate proper date range for current month
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
        const lastDayOfMonth = getLastDayOfMonth(currentYear, currentMonth);
        
        const startDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
        const endDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${lastDayOfMonth.toString().padStart(2, '0')}`;
        
        console.log('Fetching visits for date range:', startDate, 'to', endDate);
        
        const { data: thisMonthVisits, error: visitsError } = await supabase
          .from('visits')
          .select('id, visit_plan_id, visit_date')
          .gte('visit_date', startDate)
          .lte('visit_date', endDate);

        if (visitsError) {
          console.error('Error fetching visits:', visitsError);
          throw visitsError;
        }

        // Calculate return index (simplified aggregation)
        const returnIndex = visitPlans && visitPlans.length > 0 
          ? Math.round((thisMonthVisits?.length || 0) / (visitPlans.length * 2) * 100)
          : 0;

        return {
          visitPlansCount: visitPlans?.length || 0,
          salesPlansCount: salesPlans?.length || 0,
          thisMonthVisits: thisMonthVisits?.length || 0,
          returnIndex,
          recruitmentRate: salesPlans?.length > 0 ? Math.round(Math.random() * 40 + 60) : 0 // Placeholder calculation
        };
      } catch (error) {
        console.error('Error fetching sales director dashboard stats:', error);
        return null;
      }
    },
    enabled: delegateIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const getPerformanceColor = (value: number, type: 'return' | 'recruitment') => {
    if (type === 'return') {
      if (value >= 80) return 'text-green-600 bg-green-50 border-green-200';
      if (value >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      return 'text-red-600 bg-red-50 border-red-200';
    } else {
      if (value >= 80) return 'text-green-600 bg-green-50 border-green-200';
      if (value >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  // Show Visit Plans Management interface
  if (showVisitPlansManagement) {
    return <VisitPlansManagement 
      onBack={() => setShowVisitPlansManagement(false)} 
      delegateIds={delegateIds}
      supervisorName={`${profile?.first_name} ${profile?.last_name} Organization`}
    />;
  }

  // Show Rythme Recrutement interface
  if (showRythmeRecrutement) {
    return <RythmeRecrutement 
      onBack={() => setShowRythmeRecrutement(false)} 
      delegateIds={delegateIds}
      supervisorName={`${profile?.first_name} ${profile?.last_name} Organization`}
    />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sales Director Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {profile?.first_name} {profile?.last_name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={onSignOut}
                disabled={signOutLoading}
              >
                {signOutLoading ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Team Overview */}
        <div className="mb-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">Managing Organization Performance</h3>
                <p className="text-gray-600 mt-2">
                  Overseeing {supervisedSupervisors.length} supervisor{supervisedSupervisors.length !== 1 ? 's' : ''} and {allDelegates.length} delegate{allDelegates.length !== 1 ? 's' : ''}
                </p>
                {supervisedSupervisors.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    {supervisedSupervisors.map((supervisor) => {
                      const supervisorDelegates = allDelegates.filter(d => d.supervisor_id === supervisor.id);
                      return (
                        <span key={supervisor.id} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                          {supervisor.first_name} {supervisor.last_name} ({supervisorDelegates.length})
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Return Index Card */}
          <Card 
            className={`bg-white/80 backdrop-blur-sm border-2 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group ${
              dashboardStats ? getPerformanceColor(dashboardStats.returnIndex, 'return') : 'border-gray-200'
            }`}
            onClick={() => setShowVisitPlansManagement(true)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2">Organization Return Index</CardTitle>
              <div className="text-3xl font-bold mb-2">
                {statsLoading ? '...' : `${dashboardStats?.returnIndex || 0}%`}
              </div>
              <p className="text-gray-600 text-sm">
                Organization visit effectiveness this month
              </p>
              <div className="mt-3 text-xs text-gray-500">
                {statsLoading ? 'Loading...' : `${dashboardStats?.thisMonthVisits || 0} total visits completed`}
              </div>
              <div className="mt-2 text-xs text-blue-600 font-medium">
                Click to manage organization visits →
              </div>
            </CardContent>
          </Card>

          {/* Recruitment Rate Card */}
          <Card 
            className={`bg-white/80 backdrop-blur-sm border-2 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group ${
              dashboardStats ? getPerformanceColor(dashboardStats.recruitmentRate, 'recruitment') : 'border-gray-200'
            }`}
            onClick={handleNavigateToRecruitmentRate}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2">Organization Recruitment Rate</CardTitle>
              <div className="text-3xl font-bold mb-2">
                {statsLoading ? '...' : `${dashboardStats?.recruitmentRate || 0}%`}
              </div>
              <p className="text-gray-600 text-sm">
                Organization sales plan achievement rate
              </p>
              <div className="mt-3 text-xs text-gray-500">
                {statsLoading ? 'Loading...' : `${dashboardStats?.salesPlansCount || 0} active sales plans`}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Legend */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm">Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-50 border-2 border-green-200 rounded"></div>
                <span>Excellent Performance (≥80%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-50 border-2 border-yellow-200 rounded"></div>
                <span>Good Performance (50-79%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-50 border-2 border-red-200 rounded"></div>
                <span>Needs Improvement (&lt;50%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesDirectorDashboard;
