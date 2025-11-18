
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Award, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SalesDirectorSalesKPIsProps {
  delegateIds: string[];
  supervisorIds: string[];
  selectedMonth: number;
  currentYear: number;
}

const SalesDirectorSalesKPIs: React.FC<SalesDirectorSalesKPIsProps> = ({
  delegateIds,
  supervisorIds,
  selectedMonth,
  currentYear
}) => {
  // Fetch aggregated sales data for all delegates
  const { data: salesData, isLoading } = useQuery({
    queryKey: ['sales-director-sales-kpis', delegateIds, selectedMonth, currentYear],
    queryFn: async () => {
      if (delegateIds.length === 0) return null;

      // Fetch sales plans for all delegates
      const { data: salesPlans, error: plansError } = await supabase
        .from('sales_plans')
        .select('id, delegate_id')
        .in('delegate_id', delegateIds);

      if (plansError) throw plansError;

      if (!salesPlans || salesPlans.length === 0) return null;

      // Fetch sales data for all sales plans
      const salesPlanIds = salesPlans.map(p => p.id);
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('sales_plan_id, "monthly target", achievements')
        .in('sales_plan_id', salesPlanIds)
        .eq('year', currentYear);

      if (salesError) throw salesError;

      // Aggregate data
      let totalTargetsYTD = 0;
      let totalAchievementsYTD = 0;
      let totalTargetsAnnual = 0;
      let totalAchievementsAnnual = 0;

      sales?.forEach(sale => {
        const monthlyTarget = Number(sale['monthly target'] ?? 0);
        const achievements = sale.achievements || [];
        
        // Sum YTD (up to selected month) - monthly target applies to each month
        totalTargetsYTD += monthlyTarget * selectedMonth;
        totalAchievementsYTD += achievements.slice(0, selectedMonth).reduce((sum, val) => sum + (Number(val) || 0), 0);
        
        // Sum annual - monthly target * 12 months
        totalTargetsAnnual += monthlyTarget * 12;
        totalAchievementsAnnual += achievements.reduce((sum, val) => sum + (Number(val) || 0), 0);
      });

      const achievementRateYTD = totalTargetsYTD > 0 ? (totalAchievementsYTD / totalTargetsYTD) * 100 : 0;
      const achievementRateAnnual = totalTargetsAnnual > 0 ? (totalAchievementsAnnual / totalTargetsAnnual) * 100 : 0;
      
      // Calculate recruitment rhythm
      const n = 12 - selectedMonth;
      const denominator = n > 0 ? (n * (n + 1)) / 2 : 1;
      const recruitmentRhythm = denominator > 0 ? Math.ceil((totalTargetsAnnual - totalAchievementsYTD) / denominator) : 0;

      return {
        totalTargetsYTD,
        totalAchievementsYTD,
        totalTargetsAnnual,
        totalAchievementsAnnual,
        achievementRateYTD,
        achievementRateAnnual,
        recruitmentRhythm,
        activePlansCount: salesPlans.length
      };
    },
    enabled: delegateIds.length > 0,
  });

  const getPerformanceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-100';
    if (rate >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Aggregated Sales Performance</CardTitle>
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

  if (!salesData) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Aggregated Sales Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Sales Data Found</h3>
            <p className="text-gray-600">No sales plans or data available for the selected period.</p>
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
          <span>Aggregated Sales Performance</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">YTD Achievement Rate</p>
                <p className="text-2xl font-bold text-blue-900">{salesData.achievementRateYTD.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <Badge className={`mt-2 ${getPerformanceColor(salesData.achievementRateYTD)}`}>
              {salesData.achievementRateYTD >= 80 ? 'Excellent' : salesData.achievementRateYTD >= 50 ? 'Good' : 'Needs Improvement'}
            </Badge>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Achievements YTD</p>
                <p className="text-2xl font-bold text-green-900">{salesData.totalAchievementsYTD}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Recruitment Rhythm</p>
                <p className="text-2xl font-bold text-purple-900">{salesData.recruitmentRhythm}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Active Sales Plans</p>
                <p className="text-2xl font-bold text-orange-900">{salesData.activePlansCount}</p>
              </div>
              <Award className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Year-to-Date Performance</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Targets YTD:</span>
                <span className="text-sm font-medium">{salesData.totalTargetsYTD}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Achievements YTD:</span>
                <span className="text-sm font-medium">{salesData.totalAchievementsYTD}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Achievement Rate:</span>
                <span className="text-sm font-medium">{salesData.achievementRateYTD.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Annual Projection</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Annual Targets:</span>
                <span className="text-sm font-medium">{salesData.totalTargetsAnnual}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Remaining Target:</span>
                <span className="text-sm font-medium">{salesData.totalTargetsAnnual - salesData.totalAchievementsYTD}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Projected Rate:</span>
                <span className="text-sm font-medium">{salesData.achievementRateAnnual.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesDirectorSalesKPIs;
