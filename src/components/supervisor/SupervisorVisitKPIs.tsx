import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SupervisorVisitKPIsProps {
  delegateIds: string[];
  selectedMonth: number;
  currentYear: number;
}

interface ProcessedVisitData {
  delegateId: string;
  plannedVisits: number;
  actualVisits: number;
  completionRate: number;
  returnIndex: number;
}

const SupervisorVisitKPIs: React.FC<SupervisorVisitKPIsProps> = ({
  delegateIds,
  selectedMonth,
  currentYear
}) => {
  // Fetch visit data for all delegates
  const { data: visitData = [], isLoading } = useQuery({
    queryKey: ['supervisor-visit-kpis', delegateIds, selectedMonth, currentYear],
    queryFn: async () => {
      if (delegateIds.length === 0) return [];

      // Fetch visit plans for all delegates
      const { data: visitPlans, error: plansError } = await supabase
        .from('visit_plans')
        .select('id, delegate_id, visit_frequency, doctor_id')
        .in('delegate_id', delegateIds);

      if (plansError) throw plansError;

      if (!visitPlans || visitPlans.length === 0) return [];

      // Fetch actual visits for these plans
      const visitPlanIds = visitPlans.map(p => p.id);
      const { data: visits, error: visitsError } = await supabase
        .from('visits')
        .select('visit_plan_id, visit_date')
        .in('visit_plan_id', visitPlanIds)
        .gte('visit_date', `${currentYear}-01-01`)
        .lte('visit_date', `${currentYear}-${selectedMonth.toString().padStart(2, '0')}-31`);

      if (visitsError) throw visitsError;

      // Process data by delegate
      const processedData: ProcessedVisitData[] = delegateIds.map(delegateId => {
        const delegatePlans = visitPlans.filter(p => p.delegate_id === delegateId);
        const delegateVisits = visits?.filter(v => 
          delegatePlans.some(p => p.id === v.visit_plan_id)
        ) || [];

        // Calculate planned visits based on frequency and months
        let plannedVisits = 0;
        delegatePlans.forEach(plan => {
          const frequency = plan.visit_frequency;
          let monthlyVisits = 0;
          
          // Map database enum values to visit frequencies
          switch (frequency) {
            case '1':
              monthlyVisits = 1; // Monthly visits
              break;
            case '2':
              monthlyVisits = 2; // Bi-weekly visits (2 per month)
              break;
            default:
              monthlyVisits = 1;
          }
          
          plannedVisits += monthlyVisits * selectedMonth;
        });

        const actualVisits = delegateVisits.length;
        const completionRate = plannedVisits > 0 ? (actualVisits / plannedVisits) * 100 : 0;
        
        // Simple return index calculation (actual visits / planned visits * 100)
        const returnIndex = completionRate;

        return {
          delegateId,
          plannedVisits,
          actualVisits,
          completionRate,
          returnIndex
        };
      });

      return processedData;
    },
    enabled: delegateIds.length > 0,
  });

  // Calculate team aggregates
  const teamStats = visitData.reduce(
    (acc, delegate) => ({
      totalPlanned: acc.totalPlanned + delegate.plannedVisits,
      totalActual: acc.totalActual + delegate.actualVisits,
      avgReturnIndex: acc.avgReturnIndex + delegate.returnIndex,
    }),
    { totalPlanned: 0, totalActual: 0, avgReturnIndex: 0 }
  );

  const teamCompletionRate = teamStats.totalPlanned > 0 ? 
    (teamStats.totalActual / teamStats.totalPlanned) * 100 : 0;
  
  const avgReturnIndex = visitData.length > 0 ? 
    teamStats.avgReturnIndex / visitData.length : 0;

  const getVisitPerformanceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-100';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getVisitPerformanceBadge = (rate: number) => {
    if (rate >= 80) return 'success';
    if (rate >= 60) return 'warning';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Visit Effectiveness KPIs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading visit KPIs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <span>Visit Effectiveness KPIs</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Team Completion Rate</p>
                <p className="text-2xl font-bold text-blue-900">{teamCompletionRate.toFixed(1)}%</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
            <Badge className={`mt-2 ${getVisitPerformanceColor(teamCompletionRate)}`}>
              {teamCompletionRate >= 80 ? 'Excellent' : teamCompletionRate >= 60 ? 'Good' : 'Needs Improvement'}
            </Badge>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Visits YTD</p>
                <p className="text-2xl font-bold text-green-900">{teamStats.totalActual}</p>
              </div>
              <MapPin className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg Qualitative Return Index</p>
                <p className="text-2xl font-bold text-purple-900">{avgReturnIndex.toFixed(1)}%</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Planned Visits YTD</p>
                <p className="text-2xl font-bold text-orange-900">{teamStats.totalPlanned}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        {visitData.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Individual Visit Performance</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-4 font-medium text-gray-700">Delegate</th>
                    <th className="text-center py-2 px-4 font-medium text-gray-700">Completion Rate</th>
                    <th className="text-center py-2 px-4 font-medium text-gray-700">Planned Visits</th>
                    <th className="text-center py-2 px-4 font-medium text-gray-700">Actual Visits</th>
                    <th className="text-center py-2 px-4 font-medium text-gray-700">Qualitative Return Index</th>
                  </tr>
                </thead>
                <tbody>
                  {visitData.map((delegate) => (
                    <tr key={delegate.delegateId} className="border-b border-gray-100">
                      <td className="py-3 px-4">Delegate {delegate.delegateId.slice(0, 8)}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={getVisitPerformanceBadge(delegate.completionRate) as any}>
                          {delegate.completionRate.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">{delegate.plannedVisits}</td>
                      <td className="py-3 px-4 text-center">{delegate.actualVisits}</td>
                      <td className="py-3 px-4 text-center">{delegate.returnIndex.toFixed(1)}%</td>
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

export default SupervisorVisitKPIs;
