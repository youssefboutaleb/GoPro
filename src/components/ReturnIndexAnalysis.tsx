import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BarChart3, Calendar, TrendingUp, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

interface ReturnIndexAnalysisProps {
  onBack: () => void;
  delegateIds?: string[];
  supervisorName?: string;
}

interface AnalysisData {
  id: string;
  doctor_name: string;
  brick_name: string;
  visit_frequency: number;
  planned_visits: number[];
  actual_visits: number[];
  return_index: number;
  row_color: 'red' | 'yellow' | 'green';
}

const ReturnIndexAnalysis: React.FC<ReturnIndexAnalysisProps> = ({ 
  onBack, 
  delegateIds = [], 
  supervisorName 
}) => {
  const { user, profile } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Use provided delegateIds or fallback to current user
  const effectiveDelegateIds = delegateIds.length > 0 ? delegateIds : [user?.id].filter(Boolean);

  console.log('ReturnIndexAnalysis - User profile:', profile);
  console.log('ReturnIndexAnalysis - Effective delegate IDs:', effectiveDelegateIds);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Generate month names for table headers
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const displayMonths = monthNames.slice(0, currentMonth);

  // Fetch visit plans for multiple delegates
  const { data: visitPlans = [], isLoading: visitPlansLoading, error: visitPlansError } = useQuery({
    queryKey: ['return-index-visit-plans', effectiveDelegateIds.join(',')],
    queryFn: async () => {
      console.log('Fetching visit plans for return index analysis:', effectiveDelegateIds);
      console.log('Current user profile role:', profile?.role);
      
      if (effectiveDelegateIds.length === 0) {
        console.log('No delegate IDs provided');
        return [];
      }

      try {
        const { data, error } = await supabase
          .from('visit_plans')
          .select(`
            id, 
            delegate_id, 
            visit_frequency,
            doctors (
              id,
              first_name,
              last_name,
              brick_id,
              bricks (
                id,
                name
              )
            )
          `)
          .in('delegate_id', effectiveDelegateIds);

        if (error) {
          console.error('Visit plans query error for return index:', error);
          console.error('Error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }

        console.log('Visit plans fetched successfully for return index:', data?.length || 0, 'items');
        console.log('Visit plans data:', data);
        return data || [];
      } catch (error) {
        console.error('Error in visit plans query for return index:', error);
        throw error;
      }
    },
    enabled: effectiveDelegateIds.length > 0,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch actual visits data
  const { data: visitsData = [], isLoading: visitsLoading } = useQuery({
    queryKey: ['visits-data', visitPlans.map(p => p.id), currentYear],
    queryFn: async () => {
      console.log('Fetching visits data for plans:', visitPlans.length);
      
      if (visitPlans.length === 0) {
        console.log('No visit plans to fetch data for');
        return [];
      }

      try {
        const visitPlanIds = visitPlans.map(plan => plan.id);
        
        const { data, error } = await supabase
          .from('visits')
          .select('id, visit_plan_id, visit_date')
          .in('visit_plan_id', visitPlanIds)
          .gte('visit_date', `${currentYear}-01-01`)
          .lte('visit_date', `${currentYear}-12-31`);

        if (error) {
          console.error('Visits data query error:', error);
          throw error;
        }

        console.log('Visits data fetched:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('Error in visits data query:', error);
        throw error;
      }
    },
    enabled: visitPlans.length > 0,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  // Process data when all queries are complete
  const { data: processedData = [], isLoading: isProcessing } = useQuery({
    queryKey: ['processed-visit-data', visitPlans, visitsData, selectedMonth],
    queryFn: async () => {
      console.log('Processing visit data...');
      
      if (!visitPlans.length) {
        console.log('Missing visit plans data for processing');
        return [];
      }

      const processed: AnalysisData[] = [];

      for (const visitPlan of visitPlans) {
        const doctor = visitPlan.doctors;
        const brick = doctor?.bricks;

        if (!doctor || !brick) {
          console.log('Missing doctor or brick data for visit plan:', visitPlan.id);
          continue;
        }

        // Calculate planned visits per month based on visit frequency
        const monthlyPlannedVisits = parseInt(visitPlan.visit_frequency);
        const planned_visits = Array(12).fill(monthlyPlannedVisits);

        // Calculate actual visits per month
        const actual_visits = Array(12).fill(0);
        const planVisits = visitsData.filter(v => v.visit_plan_id === visitPlan.id);
        
        planVisits.forEach(visit => {
          const visitDate = new Date(visit.visit_date);
          const monthIndex = visitDate.getMonth();
          if (monthIndex >= 0 && monthIndex < 12) {
            actual_visits[monthIndex]++;
          }
        });

        // Calculate return index up to selected month
        let totalPlanned = 0;
        let totalActual = 0;

        for (let i = 0; i < selectedMonth; i++) {
          totalPlanned += planned_visits[i] || 0;
          totalActual += actual_visits[i] || 0;
        }

        const returnIndex = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;

        let rowColor: 'red' | 'yellow' | 'green' = 'red';
        if (returnIndex >= 80) {
          rowColor = 'green';
        } else if (returnIndex >= 50) {
          rowColor = 'yellow';
        }

        processed.push({
          id: visitPlan.id,
          doctor_name: `${doctor.first_name} ${doctor.last_name}`,
          brick_name: brick.name,
          visit_frequency: monthlyPlannedVisits,
          planned_visits,
          actual_visits,
          return_index: returnIndex,
          row_color: rowColor
        });
      }

      console.log('Processed visit data:', processed.length, 'items');
      return processed;
    },
    enabled: !visitPlansLoading && !visitsLoading,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = visitPlansLoading || visitsLoading || isProcessing;
  const error = visitPlansError;

  const getRowColorClass = (color: 'red' | 'yellow' | 'green') => {
    switch (color) {
      case 'green':
        return 'bg-green-50 border-l-4 border-l-green-500';
      case 'yellow':
        return 'bg-yellow-50 border-l-4 border-l-yellow-500';
      case 'red':
        return 'bg-red-50 border-l-4 border-l-red-500';
      default:
        return '';
    }
  };

  const getReturnIndexColor = (returnIndex: number) => {
    if (returnIndex >= 80) return 'text-green-600 bg-green-100';
    if (returnIndex >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getMonthHighlightClass = (monthIndex: number) => {
    if (monthIndex < selectedMonth) {
      return 'bg-blue-50 border-2 border-blue-200';
    }
    return '';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading visit plan analysis...</p>
          <p className="text-sm text-gray-500 mt-2">
            User: {profile?.role} | Delegates: {effectiveDelegateIds.length}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Loading: {visitPlansLoading && 'Visit Plans'} {visitsLoading && 'Visits'} {isProcessing && 'Processing'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Return index component error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading visit plan analysis</p>
          <p className="text-sm text-gray-600 mb-4">{error.message}</p>
          <p className="text-xs text-gray-500 mb-4">
            User Role: {profile?.role} | Delegate IDs: {effectiveDelegateIds.join(', ')}
          </p>
          <Button onClick={onBack}>Back</Button>
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
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack} className="p-2 hover:bg-blue-50">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Indice de Retour</h1>
                  <p className="text-sm text-gray-600">
                    {supervisorName 
                      ? `Visit effectiveness analysis for ${supervisorName}`
                      : profile?.role === 'Supervisor'
                      ? 'Visit effectiveness analysis for your supervised delegates'
                      : 'Visit effectiveness analysis'
                    }
                  </p>
                </div>
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
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Return Index Analysis Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Visit Plan Effectiveness Analysis</CardTitle>
            <p className="text-sm text-gray-500">
              Analyzing {effectiveDelegateIds.length} delegate(s) | Found {processedData.length} visit plans
            </p>
          </CardHeader>
          <CardContent>
            {processedData.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Visit Plans Found</h3>
                <p className="text-gray-600">
                  {supervisorName 
                    ? `No visit plans found for ${supervisorName}.`
                    : profile?.role === 'Supervisor' 
                    ? 'No visit plans found for your supervised delegates.'
                    : 'No visit plans found for your profile.'
                  }
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Delegate IDs: {effectiveDelegateIds.join(', ')}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Doctor Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Brick Name</th>
                      {displayMonths.map((month, index) => (
                        <th 
                          key={month} 
                          className={`text-center py-3 px-4 font-medium text-gray-700 min-w-[80px] ${getMonthHighlightClass(index)}`}
                        >
                          {month}
                        </th>
                      ))}
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Return Index</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedData.map((plan) => (
                      <tr key={plan.id} className={getRowColorClass(plan.row_color)}>
                        <td className="py-4 px-4 font-medium">
                          {plan.doctor_name}
                        </td>
                        <td className="py-4 px-4">
                          {plan.brick_name}
                        </td>
                        {displayMonths.map((_, index) => (
                          <td 
                            key={index} 
                            className={`py-4 px-4 text-center ${getMonthHighlightClass(index)}`}
                          >
                            <div className="text-sm">
                              <div className="font-medium">{plan.actual_visits[index] || 0}</div>
                              <div className="text-gray-500">/ {plan.planned_visits[index] || 0}</div>
                            </div>
                          </td>
                        ))}
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReturnIndexColor(plan.return_index)}`}>
                            {plan.return_index}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Color Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-50 border-l-4 border-l-green-500"></div>
                <span>Green: Return Index ≥ 80%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-50 border-l-4 border-l-yellow-500"></div>
                <span>Yellow: 50% ≤ Return Index &lt; 80%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-50 border-l-4 border-l-red-500"></div>
                <span>Red: Return Index &lt; 50%</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-600">
              <p><strong>Note:</strong> Shows actual visits vs planned visits per month. Planned visits are based on visit frequency (1 or 2 visits per month per doctor).</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReturnIndexAnalysis;
