
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Users, Award } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SupervisorSalesKPIsProps {
  delegateIds: string[];
  selectedMonth: number;
  currentYear: number;
}

interface ProcessedSalesData {
  delegateId: string;
  totalTargetsYTD: number;
  totalAchievementsYTD: number;
  achievementRate: number;
  recruitmentRhythm: number;
  salesPlansCount: number;
}

const SupervisorSalesKPIs: React.FC<SupervisorSalesKPIsProps> = ({
  delegateIds,
  selectedMonth,
  currentYear
}) => {
  // Fetch sales data for all delegates
  const { data: salesData = [], isLoading } = useQuery({
    queryKey: ['supervisor-sales-kpis', delegateIds, selectedMonth, currentYear],
    queryFn: async () => {
      if (delegateIds.length === 0) return [];

      // Fetch sales plans for all delegates
      const { data: salesPlans, error: plansError } = await supabase
        .from('sales_plans')
        .select('id, delegate_id')
        .in('delegate_id', delegateIds);

      if (plansError) throw plansError;

      if (!salesPlans || salesPlans.length === 0) return [];

      // Fetch sales data for all sales plans
      const salesPlanIds = salesPlans.map(p => p.id);
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('sales_plan_id, targets, achievements')
        .in('sales_plan_id', salesPlanIds)
        .eq('year', currentYear);

      if (salesError) throw salesError;

      // Process data by delegate
      const processedData: ProcessedSalesData[] = delegateIds.map(delegateId => {
        const delegatePlans = salesPlans.filter(p => p.delegate_id === delegateId);
        const delegateSales = sales?.filter(s => 
          delegatePlans.some(p => p.id === s.sales_plan_id)
        ) || [];

        let totalTargetsYTD = 0;
        let totalAchievementsYTD = 0;
        let totalTargetsAnnual = 0;

        delegateSales.forEach(sale => {
          const targets = sale.targets || [];
          const achievements = sale.achievements || [];
          
          // Sum targets and achievements YTD
          totalTargetsYTD += targets.slice(0, selectedMonth).reduce((sum, val) => sum + (val || 0), 0);
          totalAchievementsYTD += achievements.slice(0, selectedMonth).reduce((sum, val) => sum + (val || 0), 0);
          totalTargetsAnnual += targets.reduce((sum, val) => sum + (val || 0), 0);
        });

        const achievementRate = totalTargetsYTD > 0 ? (totalAchievementsYTD / totalTargetsYTD) * 100 : 0;
        
        // Calculate recruitment rhythm
        const n = 12 - selectedMonth;
        const denominator = n > 0 ? (n * (n + 1)) / 2 : 1;
        const recruitmentRhythm = denominator > 0 ? Math.ceil((totalTargetsAnnual - totalAchievementsYTD) / denominator) : 0;

        return {
          delegateId,
          totalTargetsYTD,
          totalAchievementsYTD,
          achievementRate,
          recruitmentRhythm,
          salesPlansCount: delegatePlans.length
        };
      });

      return processedData;
    },
    enabled: delegateIds.length > 0,
  });

  // Calculate team aggregates
  const teamStats = salesData.reduce(
    (acc, delegate) => ({
      totalTargets: acc.totalTargets + delegate.totalTargetsYTD,
      totalAchievements: acc.totalAchievements + delegate.totalAchievementsYTD,
      totalPlans: acc.totalPlans + delegate.salesPlansCount,
      avgRecruitmentRhythm: acc.avgRecruitmentRhythm + delegate.recruitmentRhythm,
    }),
    { totalTargets: 0, totalAchievements: 0, totalPlans: 0, avgRecruitmentRhythm: 0 }
  );

  const teamAchievementRate = teamStats.totalTargets > 0 ? 
    (teamStats.totalAchievements / teamStats.totalTargets) * 100 : 0;
  
  const avgRecruitmentRhythm = salesData.length > 0 ? 
    teamStats.avgRecruitmentRhythm / salesData.length : 0;

  // Find top and bottom performers
  const sortedByPerformance = [...salesData].sort((a, b) => b.achievementRate - a.achievementRate);
  const topPerformer = sortedByPerformance[0];
  const bottomPerformer = sortedByPerformance[sortedByPerformance.length - 1];

  const getPerformanceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-100';
    if (rate >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPerformanceBadge = (rate: number) => {
    if (rate >= 80) return 'success';
    if (rate >= 50) return 'warning';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Sales Performance KPIs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading sales KPIs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <span>Sales Performance KPIs</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Team Achievement Rate</p>
                <p className="text-2xl font-bold text-blue-900">{teamAchievementRate.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <Badge className={`mt-2 ${getPerformanceColor(teamAchievementRate)}`}>
              {teamAchievementRate >= 80 ? 'Excellent' : teamAchievementRate >= 50 ? 'Good' : 'Needs Improvement'}
            </Badge>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Achievements YTD</p>
                <p className="text-2xl font-bold text-green-900">{teamStats.totalAchievements}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg Recruitment Rhythm</p>
                <p className="text-2xl font-bold text-purple-900">{avgRecruitmentRhythm.toFixed(0)}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Active Sales Plans</p>
                <p className="text-2xl font-bold text-orange-900">{teamStats.totalPlans}</p>
              </div>
              <Award className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        {salesData.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Individual Performance</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-4 font-medium text-gray-700">Delegate</th>
                    <th className="text-center py-2 px-4 font-medium text-gray-700">Achievement Rate</th>
                    <th className="text-center py-2 px-4 font-medium text-gray-700">Targets YTD</th>
                    <th className="text-center py-2 px-4 font-medium text-gray-700">Achievements YTD</th>
                    <th className="text-center py-2 px-4 font-medium text-gray-700">Recruitment Rhythm</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.map((delegate) => (
                    <tr key={delegate.delegateId} className="border-b border-gray-100">
                      <td className="py-3 px-4">Delegate {delegate.delegateId.slice(0, 8)}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={getPerformanceBadge(delegate.achievementRate) as any}>
                          {delegate.achievementRate.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">{delegate.totalTargetsYTD}</td>
                      <td className="py-3 px-4 text-center">{delegate.totalAchievementsYTD}</td>
                      <td className="py-3 px-4 text-center">{delegate.recruitmentRhythm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SupervisorSalesKPIs;
