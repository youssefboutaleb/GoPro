
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SalesDirectorVisitKPIsProps {
  delegateIds: string[];
  supervisorIds: string[];
  selectedMonth: number;
  currentYear: number;
}

const SalesDirectorVisitKPIs: React.FC<SalesDirectorVisitKPIsProps> = ({
  delegateIds,
  supervisorIds,
  selectedMonth,
  currentYear
}) => {
  // Fetch aggregated visit data for all delegates
  const { data: visitData, isLoading } = useQuery({
    queryKey: ['sales-director-visit-kpis', delegateIds, selectedMonth, currentYear],
    queryFn: async () => {
      if (delegateIds.length === 0) return null;

      // Fetch visit plans for all delegates
      const { data: visitPlans, error: plansError } = await supabase
        .from('visit_plans')
        .select('id, delegate_id, visit_frequency, doctor_id')
        .in('delegate_id', delegateIds);

      if (plansError) throw plansError;

      if (!visitPlans || visitPlans.length === 0) return null;

      // Fetch actual visits for these plans
      const visitPlanIds = visitPlans.map(p => p.id);
      const { data: visits, error: visitsError } = await supabase
        .from('visits')
        .select('visit_plan_id, visit_date')
        .in('visit_plan_id', visitPlanIds)
        .gte('visit_date', `${currentYear}-01-01`)
        .lte('visit_date', `${currentYear}-${selectedMonth.toString().padStart(2, '0')}-31`);

      if (visitsError) throw visitsError;

      // Calculate aggregated metrics
      let totalPlannedVisits = 0;
      let totalActualVisits = visits?.length || 0;
      let totalDoctors = new Set();
      let totalActivePlans = visitPlans.length;

      visitPlans.forEach(plan => {
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
        
        totalPlannedVisits += monthlyVisits * selectedMonth;
        totalDoctors.add(plan.doctor_id);
      });

      const completionRate = totalPlannedVisits > 0 ? (totalActualVisits / totalPlannedVisits) * 100 : 0;
      const uniqueDoctors = totalDoctors.size;
      const avgVisitsPerPlan = totalActivePlans > 0 ? totalActualVisits / totalActivePlans : 0;

      return {
        totalPlannedVisits,
        totalActualVisits,
        completionRate,
        uniqueDoctors,
        totalActivePlans,
        avgVisitsPerPlan
      };
    },
    enabled: delegateIds.length > 0,
  });

  const getVisitPerformanceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-100';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Aggregated Visit Performance</CardTitle>
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

  if (!visitData) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Aggregated Visit Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Visit Data Found</h3>
            <p className="text-gray-600">No visit plans or data available for the selected period.</p>
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
          <span>Aggregated Visit Performance</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Visit Completion Rate</p>
                <p className="text-2xl font-bold text-blue-900">{visitData.completionRate.toFixed(1)}%</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
            <Badge className={`mt-2 ${getVisitPerformanceColor(visitData.completionRate)}`}>
              {visitData.completionRate >= 80 ? 'Excellent' : visitData.completionRate >= 60 ? 'Good' : 'Needs Improvement'}
            </Badge>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Visits YTD</p>
                <p className="text-2xl font-bold text-green-900">{visitData.totalActualVisits}</p>
              </div>
              <MapPin className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Unique Doctors</p>
                <p className="text-2xl font-bold text-purple-900">{visitData.uniqueDoctors}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Active Visit Plans</p>
                <p className="text-2xl font-bold text-orange-900">{visitData.totalActivePlans}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Visit Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Planned Visits YTD:</span>
                <span className="text-sm font-medium">{visitData.totalPlannedVisits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Actual Visits YTD:</span>
                <span className="text-sm font-medium">{visitData.totalActualVisits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Completion Rate:</span>
                <span className="text-sm font-medium">{visitData.completionRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Efficiency Metrics</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Visits per Plan:</span>
                <span className="text-sm font-medium">{visitData.avgVisitsPerPlan.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Coverage:</span>
                <span className="text-sm font-medium">{visitData.uniqueDoctors} doctors</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Plans:</span>
                <span className="text-sm font-medium">{visitData.totalActivePlans}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesDirectorVisitKPIs;
