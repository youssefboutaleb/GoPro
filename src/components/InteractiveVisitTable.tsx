
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Calendar, Target, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

interface VisitPlanData {
  id: string;
  doctor_name: string;
  brick_name: string;
  visit_frequency: number;
  planned_visits: number[];
  actual_visits: number[];
  return_index: number;
  row_color: 'red' | 'yellow' | 'green';
  can_record_today: boolean;
  visits_today: number;
  monthly_target_met: boolean;
}

interface InteractiveVisitTableProps {
  delegateIds?: string[];
}

const InteractiveVisitTable: React.FC<InteractiveVisitTableProps> = ({ 
  delegateIds = [] 
}) => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [swipingRowId, setSwipingRowId] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [recordingVisit, setRecordingVisit] = useState<string | null>(null);

  // Use provided delegateIds or fallback to current user
  const effectiveDelegateIds = delegateIds.length > 0 ? delegateIds : [user?.id].filter(Boolean);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const today = new Date().toISOString().split('T')[0];

  // Fetch visit plans with doctors and bricks data
  const { data: visitPlansData = [], isLoading } = useQuery({
    queryKey: ['interactive-visit-plans', effectiveDelegateIds.join(',')],
    queryFn: async () => {
      if (effectiveDelegateIds.length === 0) return [];

      // Fetch visit plans
      const { data: visitPlans, error: visitPlansError } = await supabase
        .from('visit_plans')
        .select('id, delegate_id, visit_frequency, doctor_id')
        .in('delegate_id', effectiveDelegateIds);

      if (visitPlansError) throw visitPlansError;

      // Fetch doctors
      const doctorIds = visitPlans?.map(p => p.doctor_id).filter(Boolean) || [];
      const { data: doctors, error: doctorsError } = await supabase
        .from('doctors')
        .select('id, first_name, last_name, brick_id')
        .in('id', doctorIds);

      if (doctorsError) throw doctorsError;

      // Fetch bricks
      const brickIds = doctors?.map(d => d.brick_id).filter(Boolean) || [];
      const { data: bricks, error: bricksError } = await supabase
        .from('bricks')
        .select('id, name')
        .in('id', brickIds);

      if (bricksError) throw bricksError;

      // Fetch visits for this year
      const visitPlanIds = visitPlans?.map(p => p.id) || [];
      const { data: visits, error: visitsError } = await supabase
        .from('visits')
        .select('id, visit_plan_id, visit_date')
        .in('visit_plan_id', visitPlanIds)
        .gte('visit_date', `${currentYear}-01-01`)
        .lte('visit_date', `${currentYear}-12-31`);

      if (visitsError) throw visitsError;

      // Process the data
      const processed: VisitPlanData[] = [];

      for (const visitPlan of visitPlans || []) {
        const doctor = doctors?.find(d => d.id === visitPlan.doctor_id);
        const brick = doctor ? bricks?.find(b => b.id === doctor.brick_id) : null;

        if (!doctor) continue;

        const monthlyPlannedVisits = visitPlan.visit_frequency === '1' ? 1 : 2;
        const planned_visits = Array(12).fill(monthlyPlannedVisits);

        // Calculate actual visits per month
        const actual_visits = Array(12).fill(0);
        const planVisits = visits?.filter(v => v.visit_plan_id === visitPlan.id) || [];
        
        planVisits.forEach(visit => {
          const visitDate = new Date(visit.visit_date);
          const monthIndex = visitDate.getMonth();
          if (monthIndex >= 0 && monthIndex < 12) {
            actual_visits[monthIndex]++;
          }
        });

        // Calculate visits today
        const visitsToday = planVisits.filter(v => v.visit_date === today).length;

        // Check if monthly target is met for current month
        const currentMonthActual = actual_visits[currentMonth - 1] || 0;
        const currentMonthPlanned = planned_visits[currentMonth - 1] || 0;
        const monthlyTargetMet = currentMonthActual >= currentMonthPlanned;

        // Calculate return index up to current month
        let totalPlanned = 0;
        let totalActual = 0;

        for (let i = 0; i < currentMonth; i++) {
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

        // Can record if haven't exceeded monthly limit and haven't recorded today
        const canRecordToday = currentMonthActual < currentMonthPlanned && visitsToday === 0;

        processed.push({
          id: visitPlan.id,
          doctor_name: `${doctor.first_name} ${doctor.last_name}`,
          brick_name: brick?.name || 'Unknown Brick',
          visit_frequency: monthlyPlannedVisits,
          planned_visits,
          actual_visits,
          return_index: returnIndex,
          row_color: rowColor,
          can_record_today: canRecordToday,
          visits_today: visitsToday,
          monthly_target_met: monthlyTargetMet
        });
      }

      return processed;
    },
    enabled: effectiveDelegateIds.length > 0,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Mutation to record a visit
  const recordVisitMutation = useMutation({
    mutationFn: async (visitPlanId: string) => {
      const { data, error } = await supabase
        .from('visits')
        .insert({
          visit_plan_id: visitPlanId,
          visit_date: today
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ['interactive-visit-plans'] });
      queryClient.invalidateQueries({ queryKey: ['delegate-dashboard-stats'] });
    }
  });

  // Touch event handlers for swipe
  const handleTouchStart = (e: React.TouchEvent, rowId: string) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent, visitPlan: VisitPlanData) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = Math.abs(touch.clientY - touchStart.y);

    // Check if it's a horizontal swipe (not vertical scroll)
    if (Math.abs(deltaX) > 50 && deltaY < 30) {
      if (deltaX > 0 && visitPlan.can_record_today) {
        // Swipe right to record visit
        handleRecordVisit(visitPlan.id);
      }
    }

    setTouchStart(null);
    setSwipingRowId(null);
  };

  const handleRecordVisit = async (visitPlanId: string) => {
    setRecordingVisit(visitPlanId);
    try {
      await recordVisitMutation.mutateAsync(visitPlanId);
    } catch (error) {
      console.error('Error recording visit:', error);
    } finally {
      setRecordingVisit(null);
    }
  };

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

  // Calculate summary stats
  const totalPlans = visitPlansData.length;
  const completedToday = visitPlansData.filter(p => p.visits_today > 0).length;
  const monthlyTargetsMet = visitPlansData.filter(p => p.monthly_target_met).length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-900">{completedToday}</div>
            <div className="text-sm text-blue-700">Visits Today</div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-900">{monthlyTargetsMet}</div>
            <div className="text-sm text-green-700">Monthly Targets Met</div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-900">{totalPlans}</div>
            <div className="text-sm text-purple-700">Total Visit Plans</div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Visit Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Visit Plans Analysis</CardTitle>
          <p className="text-sm text-gray-500">Swipe right on a row to record a visit</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Doctor</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Brick</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Progress</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {visitPlansData.map((plan) => (
                  <tr 
                    key={plan.id} 
                    className={`${getRowColorClass(plan.row_color)} ${
                      plan.can_record_today ? 'cursor-pointer hover:opacity-80' : 'opacity-60'
                    } transition-all duration-200`}
                    onTouchStart={(e) => handleTouchStart(e, plan.id)}
                    onTouchEnd={(e) => handleTouchEnd(e, plan)}
                  >
                    <td className="py-4 px-4 font-medium">
                      {plan.doctor_name}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {plan.brick_name}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center space-x-2">
                        {plan.visits_today > 0 ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                        {plan.monthly_target_met && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="text-sm">
                        <div className="font-medium">
                          {plan.actual_visits[currentMonth - 1] || 0} / {plan.planned_visits[currentMonth - 1] || 0}
                        </div>
                        <div className="text-xs text-gray-500">This month</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {recordingVisit === plan.id ? (
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        </div>
                      ) : plan.can_record_today ? (
                        <button
                          onClick={() => handleRecordVisit(plan.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                        >
                          Record Visit
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">
                          {plan.visits_today > 0 ? 'Visited Today' : 'Target Met'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">How to record visits:</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Green checkmark: Visit recorded today</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Blue dot: Monthly frequency target met</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-1 bg-green-500"></div>
              <span>Green border: Good performance (≥80%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-1 bg-yellow-500"></div>
              <span>Yellow border: Moderate performance (50-79%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-1 bg-red-500"></div>
              <span>Red border: Needs improvement (&lt;50%)</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            💡 Tip: Swipe right on any row to quickly record a visit, or tap the "Record Visit" button
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveVisitTable;
