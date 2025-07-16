import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, BarChart3, TrendingUp, ClipboardList, ArrowRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VisitPlansManagement from './VisitPlansManagement';
import RythmeRecrutement from './RythmeRecrutement';
import ActionPlansList from './action-plans/ActionPlansList';
import VisitReport from './VisitReport';

const DelegateDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { profile, signOut, signOutLoading } = useAuth();
  const [showVisitPlansManagement, setShowVisitPlansManagement] = useState(false);
  const [showRythmeRecrutement, setShowRythmeRecrutement] = useState(false);
  const [showActionPlans, setShowActionPlans] = useState(false);
  const [showVisitReport, setShowVisitReport] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleNavigateToRecruitmentRate = () => {
    setShowRythmeRecrutement(true);
  };

  // Helper function to get the last day of a month
  const getLastDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  // Fetch supervisor info to get sales director ID
  const { data: supervisorInfo } = useQuery({
    queryKey: ['supervisor-info', profile?.supervisor_id],
    queryFn: async () => {
      if (!profile?.supervisor_id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, supervisor_id')
        .eq('id', profile.supervisor_id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.supervisor_id,
  });

  // Fetch quick stats for dashboard cards
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['delegate-dashboard-stats', profile?.id, profile?.supervisor_id, supervisorInfo?.supervisor_id],
    queryFn: async () => {
      if (!profile?.id) return null;

      try {
        // Fetch visit plans count
        const { data: visitPlans, error: visitPlansError } = await supabase
          .from('visit_plans')
          .select('id')
          .eq('delegate_id', profile.id);

        if (visitPlansError) throw visitPlansError;

        // Fetch sales plans count
        const { data: salesPlans, error: salesPlansError } = await supabase
          .from('sales_plans')
          .select('id')
          .eq('delegate_id', profile.id);

        if (salesPlansError) throw salesPlansError;

        // Fetch action plans - include created by delegate and targeting delegate
        let actionPlansQuery = supabase
          .from('action_plans')
          .select('id, supervisor_status, sales_director_status, marketing_manager_status, created_by, targeted_delegates');

        // Get plans created by delegate OR targeting delegate
        const creatorIds = [profile.id];
        if (profile.supervisor_id) {
          creatorIds.push(profile.supervisor_id);
        }
        if (supervisorInfo?.supervisor_id) {
          creatorIds.push(supervisorInfo.supervisor_id);
        }

        const { data: allActionPlans, error: actionPlansError } = await actionPlansQuery
          .in('created_by', creatorIds);

        if (actionPlansError) throw actionPlansError;

        // Filter action plans to include only:
        // 1. Plans created by the delegate
        // 2. Plans created by supervisor/sales director that target this delegate
        const relevantActionPlans = allActionPlans?.filter(plan => 
          plan.created_by === profile.id || 
          (plan.targeted_delegates && plan.targeted_delegates.includes(profile.id))
        ) || [];

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

        // Calculate return index (simplified)
        const returnIndex = visitPlans && visitPlans.length > 0 
          ? Math.round((thisMonthVisits?.length || 0) / (visitPlans.length * 2) * 100)
          : 0;

        // Calculate pending action plans (including those targeting the delegate)
        const pendingActionPlans = relevantActionPlans.filter(plan => 
          plan.supervisor_status === 'Pending' || 
          plan.sales_director_status === 'Pending' || 
          plan.marketing_manager_status === 'Pending'
        ).length;

        return {
          visitPlansCount: visitPlans?.length || 0,
          salesPlansCount: salesPlans?.length || 0,
          actionPlansCount: relevantActionPlans.length,
          pendingActionPlans,
          thisMonthVisits: thisMonthVisits?.length || 0,
          returnIndex,
          recruitmentRate: salesPlans?.length > 0 ? Math.round(Math.random() * 40 + 60) : 0 // Placeholder calculation
        };
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return null;
      }
    },
    enabled: !!profile?.id,
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

  const getActionPlanColor = (pendingCount: number) => {
    if (pendingCount === 0) return 'text-green-600 bg-green-50 border-green-200';
    if (pendingCount <= 2) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  // Show Visit Plans Management interface
  if (showVisitPlansManagement) {
    return <VisitPlansManagement onBack={() => setShowVisitPlansManagement(false)} />;
  }

  // Show Rythme Recrutement interface
  if (showRythmeRecrutement) {
    return <RythmeRecrutement onBack={() => setShowRythmeRecrutement(false)} />;
  }

  // Show Action Plans interface
  if (showActionPlans) {
    return <ActionPlansList onBack={() => setShowActionPlans(false)} />;
  }

  // Show Visit Report interface
  if (showVisitReport) {
    return <VisitReport onBack={() => setShowVisitReport(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Delegate Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {profile?.first_name} {profile?.last_name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <CardTitle className="text-lg mb-2">Return Index</CardTitle>
              <div className="text-3xl font-bold mb-2">
                {statsLoading ? '...' : `${dashboardStats?.returnIndex || 0}%`}
              </div>
              <p className="text-gray-600 text-sm">
                Visit effectiveness this month
              </p>
              <div className="mt-3 text-xs text-gray-500">
                {statsLoading ? 'Loading...' : `${dashboardStats?.thisMonthVisits || 0} visits completed`}
              </div>
              <div className="mt-2 text-xs text-blue-600 font-medium">
                Click to manage visits →
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
              <CardTitle className="text-lg mb-2">Recruitment Rate</CardTitle>
              <div className="text-3xl font-bold mb-2">
                {statsLoading ? '...' : `${dashboardStats?.recruitmentRate || 0}%`}
              </div>
              <p className="text-gray-600 text-sm">
                Sales plan achievement rate
              </p>
              <div className="mt-3 text-xs text-gray-500">
                {statsLoading ? 'Loading...' : `${dashboardStats?.salesPlansCount || 0} active sales plans`}
              </div>
            </CardContent>
          </Card>

          {/* Action Plans Card */}
          <Card 
            className={`bg-white/80 backdrop-blur-sm border-2 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group ${
              dashboardStats ? getActionPlanColor(dashboardStats.pendingActionPlans) : 'border-gray-200'
            }`}
            onClick={() => setShowActionPlans(true)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg">
                  <ClipboardList className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2">Action Plans</CardTitle>
              <div className="text-3xl font-bold mb-2">
                {statsLoading ? '...' : `${dashboardStats?.actionPlansCount || 0}`}
              </div>
              <p className="text-gray-600 text-sm">
                Total action plans (including those involving you)
              </p>
              <div className="mt-3 text-xs text-gray-500">
                {statsLoading ? 'Loading...' : `${dashboardStats?.pendingActionPlans || 0} pending approval`}
              </div>
              <div className="mt-2 text-xs text-blue-600 font-medium">
                Click to manage plans →
              </div>
            </CardContent>
          </Card>

          {/* Report Card */}
          <Card 
            className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => setShowVisitReport(true)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-gradient-to-r from-teal-600 to-teal-700 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-teal-600 transition-colors" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2">Report</CardTitle>
              <div className="text-3xl font-bold mb-2">
                {statsLoading ? '...' : `${dashboardStats?.thisMonthVisits || 0}`}
              </div>
              <p className="text-gray-600 text-sm">
                Monthly visit calendar
              </p>
              <div className="mt-3 text-xs text-gray-500">
                View detailed visit records
              </div>
              <div className="mt-2 text-xs text-blue-600 font-medium">
                Click to view calendar →
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

export default DelegateDashboard;
