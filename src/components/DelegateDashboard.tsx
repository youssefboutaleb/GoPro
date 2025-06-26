import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, TrendingUp, BarChart3, Target, MapPin, Clock, CheckCircle, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import RythmeRecrutement from './RythmeRecrutement';
import ReturnIndexAnalysis from './ReturnIndexAnalysis';
import VisitPlansManagement from './VisitPlansManagement';

const DelegateDashboard = () => {
  const { user, profile, signOut, signOutLoading } = useAuth();
  const [activeView, setActiveView] = useState<'dashboard' | 'recruitment' | 'return-index' | 'visit-plans'>('dashboard');

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const today = new Date().toISOString().split('T')[0];

  // Fetch sales plans for the delegate
  const { data: salesPlans = [], isLoading: salesPlansLoading } = useQuery({
    queryKey: ['delegate-sales-plans', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('sales_plans')
        .select(`
          id,
          product_id,
          brick_id,
          products(name),
          bricks(name)
        `)
        .eq('delegate_id', user.id);

      if (error) {
        console.error('Error fetching sales plans:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch visit plans for the delegate
  const { data: visitPlans = [], isLoading: visitPlansLoading } = useQuery({
    queryKey: ['delegate-visit-plans', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('visit_plans')
        .select(`
          id,
          visit_frequency,
          doctor_id,
          doctors(first_name, last_name, specialty, brick_id, bricks(name))
        `)
        .eq('delegate_id', user.id);

      if (error) {
        console.error('Error fetching visit plans:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch sales data for current year
  const { data: salesData = [], isLoading: salesDataLoading } = useQuery({
    queryKey: ['delegate-sales-data', salesPlans.map(p => p.id)],
    queryFn: async () => {
      if (salesPlans.length === 0) return [];

      const salesPlanIds = salesPlans.map(plan => plan.id);
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .in('sales_plan_id', salesPlanIds)
        .eq('year', currentYear);

      if (error) {
        console.error('Error fetching sales data:', error);
        throw error;
      }

      return data || [];
    },
    enabled: salesPlans.length > 0,
  });

  // Fetch visits data for current year
  const { data: visitsData = [], isLoading: visitsDataLoading } = useQuery({
    queryKey: ['delegate-visits-data', visitPlans.map(p => p.id)],
    queryFn: async () => {
      if (visitPlans.length === 0) return [];

      const visitPlanIds = visitPlans.map(plan => plan.id);
      const { data, error } = await supabase
        .from('visits')
        .select('*')
        .in('visit_plan_id', visitPlanIds)
        .gte('visit_date', `${currentYear}-01-01`)
        .lte('visit_date', `${currentYear}-12-31`);

      if (error) {
        console.error('Error fetching visits data:', error);
        throw error;
      }

      return data || [];
    },
    enabled: visitPlans.length > 0,
  });

  // Calculate sales metrics
  const totalSalesPlans = salesPlans.length;
  const totalTargetsYTD = salesData.reduce((sum, sales) => {
    const targets = sales.targets || [];
    return sum + targets.slice(0, currentMonth).reduce((monthSum, target) => monthSum + (target || 0), 0);
  }, 0);
  
  const totalAchievementsYTD = salesData.reduce((sum, sales) => {
    const achievements = sales.achievements || [];
    return sum + achievements.slice(0, currentMonth).reduce((monthSum, achievement) => monthSum + (achievement || 0), 0);
  }, 0);

  const salesAchievementRate = totalTargetsYTD > 0 ? Math.round((totalAchievementsYTD / totalTargetsYTD) * 100) : 0;

  // Calculate visit metrics
  const totalVisitPlans = visitPlans.length;
  const expectedVisitsYTD = visitPlans.reduce((sum, plan) => {
    const monthlyFrequency = plan.visit_frequency === '1' ? 1 : 2;
    return sum + (monthlyFrequency * currentMonth);
  }, 0);

  const actualVisitsYTD = visitsData.length;
  const visitCompletionRate = expectedVisitsYTD > 0 ? Math.round((actualVisitsYTD / expectedVisitsYTD) * 100) : 0;

  // Visits today
  const visitsToday = visitsData.filter(visit => visit.visit_date === today).length;

  // Monthly targets status
  const monthlyTargetsMet = salesData.filter(sales => {
    const achievements = sales.achievements || [];
    const targets = sales.targets || [];
    const currentMonthAchievement = achievements[currentMonth - 1] || 0;
    const currentMonthTarget = targets[currentMonth - 1] || 0;
    return currentMonthTarget > 0 && currentMonthAchievement >= currentMonthTarget;
  }).length;

  const isLoading = salesPlansLoading || visitPlansLoading || salesDataLoading || visitsDataLoading;

  const handleSignOut = async () => {
    await signOut();
  };

  if (activeView === 'recruitment') {
    return (
      <RythmeRecrutement 
        onBack={() => setActiveView('dashboard')}
        isDelegateView={true}
      />
    );
  }

  if (activeView === 'return-index') {
    return (
      <ReturnIndexAnalysis 
        onBack={() => setActiveView('dashboard')}
      />
    );
  }

  if (activeView === 'visit-plans') {
    return (
      <VisitPlansManagement 
        onBack={() => setActiveView('dashboard')}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome, {profile?.first_name} {profile?.last_name}
                </h1>
                <p className="text-sm text-gray-600">Delegate Dashboard - Track your performance</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Delegate
              </Badge>
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
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Sales Plans</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalSalesPlans}</div>
              <p className="text-xs text-gray-600 mt-1">Active plans</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Sales Achievement</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{salesAchievementRate}%</div>
              <p className="text-xs text-gray-600 mt-1">YTD performance</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Visit Completion</CardTitle>
              <CheckCircle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{visitCompletionRate}%</div>
              <p className="text-xs text-gray-600 mt-1">{actualVisitsYTD} of {expectedVisitsYTD} visits</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Visits Today</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{visitsToday}</div>
              <p className="text-xs text-gray-600 mt-1">Recorded today</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card 
            className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
            onClick={() => setActiveView('recruitment')}
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Recruitment Rhythm</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Analyze your sales performance and recruitment patterns</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600">Monthly Targets Met</div>
                  <div className="text-xl font-bold text-gray-900">{monthlyTargetsMet}/{totalSalesPlans}</div>
                </div>
                <Button variant="ghost" size="sm" className="text-purple-600">
                  View Details →
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
            onClick={() => setActiveView('return-index')}
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Return Index</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Track visit effectiveness and return rates</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600">Visit Plans</div>
                  <div className="text-xl font-bold text-gray-900">{totalVisitPlans}</div>
                </div>
                <Button variant="ghost" size="sm" className="text-orange-600">
                  Analyze →
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
            onClick={() => setActiveView('visit-plans')}
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-green-600 to-green-700 rounded-lg group-hover:scale-110 transition-transform">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Visit Plans</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Manage and track your visit schedules</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                  <div className="text-xl font-bold text-gray-900">{visitCompletionRate}%</div>
                </div>
                <Button variant="ghost" size="sm" className="text-green-600">
                  Manage →
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activity Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Target className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Sales Performance</p>
                    <p className="text-sm text-gray-600">{totalAchievementsYTD} achieved of {totalTargetsYTD} target</p>
                  </div>
                </div>
                <Badge variant={salesAchievementRate >= 80 ? "default" : salesAchievementRate >= 50 ? "secondary" : "destructive"}>
                  {salesAchievementRate}%
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Visit Performance</p>
                    <p className="text-sm text-gray-600">{actualVisitsYTD} visits completed this year</p>
                  </div>
                </div>
                <Badge variant={visitCompletionRate >= 80 ? "default" : visitCompletionRate >= 50 ? "secondary" : "destructive"}>
                  {visitCompletionRate}%
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Today's Activity</p>
                    <p className="text-sm text-gray-600">{visitsToday} visits recorded today</p>
                  </div>
                </div>
                <Badge variant="outline">
                  {visitsToday} visits
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DelegateDashboard;
