import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, TrendingUp, Users, Target, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ReturnIndexAnalysisProps {
  onBack: () => void;
}

interface VisitPlanData {
  id: string;
  doctor_name: string;
  visit_frequency: number;
  remaining_visits_this_month: number;
  monthly_visits: number[];
  total_visits: number;
  expected_visits: number;
  return_index: number;
  row_color: 'red' | 'yellow' | 'green';
  has_visit_today: boolean;
  is_frequency_met: boolean;
}

interface SwipeState {
  isActive: boolean;
  startX: number;
  currentX: number;
  planId: string | null;
}

const ReturnIndexAnalysis: React.FC<ReturnIndexAnalysisProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [swipeState, setSwipeState] = useState<SwipeState>({
    isActive: false,
    startX: 0,
    currentX: 0,
    planId: null
  });

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const monthsElapsed = currentMonth;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const displayMonths = monthNames.slice(0, currentMonth);

  // Fetch visit plans first
  const { data: visitPlans = [], isLoading: visitPlansLoading, error: visitPlansError } = useQuery({
    queryKey: ['visit-plans', user?.id],
    queryFn: async () => {
      console.log('Fetching visit plans for user:', user?.id);
      
      if (!user?.id) {
        console.log('No user ID found');
        return [];
      }

      try {
        const { data, error } = await supabase
          .from('visit_plans')
          .select('id, doctor_id, delegate_id, visit_frequency')
          .eq('delegate_id', user.id);

        if (error) {
          console.error('Visit plans query error:', error);
          throw error;
        }

        console.log('Visit plans fetched:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('Error in visit plans query:', error);
        throw error;
      }
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch doctors separately
  const { data: doctors = [], isLoading: doctorsLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      console.log('Fetching doctors');
      
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('id, first_name, last_name, specialty');

        if (error) {
          console.error('Doctors query error:', error);
          throw error;
        }

        console.log('Doctors fetched:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('Error in doctors query:', error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 10 * 60 * 1000,
  });

  // Fetch visits separately
  const { data: visits = [], isLoading: visitsLoading } = useQuery({
    queryKey: ['visits-data', visitPlans.map(p => p.id), currentYear],
    queryFn: async () => {
      console.log('Fetching visits data for plans:', visitPlans.length);
      
      if (visitPlans.length === 0) {
        console.log('No visit plans to fetch visits for');
        return [];
      }

      try {
        const visitPlanIds = visitPlans.map(plan => plan.id);
        
        const { data, error } = await supabase
          .from('visits')
          .select('id, visit_plan_id, visit_date')
          .in('visit_plan_id', visitPlanIds)
          .gte('visit_date', `${currentYear}-01-01`);

        if (error) {
          console.error('Visits query error:', error);
          throw error;
        }

        console.log('Visits fetched:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('Error in visits query:', error);
        throw error;
      }
    },
    enabled: visitPlans.length > 0,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  // Process data when all queries are complete
  const { data: processedData = [], isLoading: isProcessing } = useQuery({
    queryKey: ['processed-visit-data', visitPlans, doctors, visits],
    queryFn: async () => {
      console.log('Processing visit data...');
      
      if (!visitPlans.length || !doctors.length) {
        console.log('Missing required data for processing');
        return [];
      }

      const processed: VisitPlanData[] = [];
      const today = new Date().toISOString().split('T')[0];

      for (const visitPlan of visitPlans) {
        const doctor = doctors.find(d => d.id === visitPlan.doctor_id);
        
        if (!doctor) {
          console.log('Missing doctor data for plan:', visitPlan.id);
          continue;
        }

        const planVisits = visits.filter(visit => visit.visit_plan_id === visitPlan.id);

        const monthlyVisits = new Array(currentMonth).fill(0);
        let hasVisitToday = false;
        
        planVisits.forEach(visit => {
          const visitDate = new Date(visit.visit_date);
          const visitMonth = visitDate.getMonth();
          if (visitMonth < currentMonth) {
            monthlyVisits[visitMonth]++;
          }
          
          // Check if there's a visit today
          if (visit.visit_date === today) {
            hasVisitToday = true;
          }
        });

        const totalVisits = planVisits.length;
        const visitFrequency = parseInt(visitPlan.visit_frequency) || 1;
        const expectedVisits = visitFrequency * monthsElapsed;
        const returnIndex = expectedVisits > 0 ? Math.round((totalVisits / expectedVisits) * 100) : 0;

        const currentMonthIndex = currentMonth - 1;
        const lastMonth = currentMonth - 2;
        const monthBeforeLast = currentMonth - 3;

        const visitedCurrentMonth = currentMonthIndex >= 0 ? monthlyVisits[currentMonthIndex] > 0 : false;
        const visitedLastMonth = lastMonth >= 0 ? monthlyVisits[lastMonth] > 0 : false;
        const visitedMonthBeforeLast = monthBeforeLast >= 0 ? monthlyVisits[monthBeforeLast] > 0 : false;

        let rowColor: 'red' | 'yellow' | 'green' = 'red';
        if (visitedCurrentMonth || visitedLastMonth) {
          rowColor = 'green';
        } else if (visitedMonthBeforeLast) {
          rowColor = 'yellow';
        }

        processed.push({
          id: visitPlan.id,
          doctor_name: `${doctor.first_name} ${doctor.last_name}`,
          visit_frequency: visitFrequency,
          remaining_visits_this_month: remainingVisitsThisMonth,
          monthly_visits: monthlyVisits,
          total_visits: totalVisits,
          expected_visits: expectedVisits,
          return_index: returnIndex,
          row_color: rowColor,
          has_visit_today: hasVisitToday,
          is_frequency_met: isFrequencyMet
        });
      }

      console.log('Processed visit data:', processed.length, 'items');
      return processed;
    },
    enabled: !visitPlansLoading && !doctorsLoading && !visitsLoading,
    staleTime: 5 * 60 * 1000,
  });

  // Record visit mutation with enhanced debugging
  const recordVisitMutation = useMutation({
    mutationFn: async (visitPlanId: string) => {
      const today = new Date().toISOString().split('T')[0];
      
      console.log('=== VISIT RECORDING DEBUG ===');
      console.log('Visit plan ID:', visitPlanId);
      console.log('Today:', today);
      console.log('User ID:', user?.id);
      console.log('Supabase client:', !!supabase);
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Check if a visit already exists for today for this plan
      console.log('Checking for existing visit...');
      const { data: existingVisit, error: checkError } = await supabase
        .from('visits')
        .select('id')
        .eq('visit_plan_id', visitPlanId)
        .eq('visit_date', today)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing visit:', checkError);
        throw checkError;
      }

      if (existingVisit) {
        console.log('Visit already exists:', existingVisit);
        throw new Error('A visit has already been recorded for today for this doctor');
      }

      console.log('No existing visit found, inserting new visit...');
      
      // Insert the new visit
      const insertData = {
        visit_plan_id: visitPlanId,
        visit_date: today
      };
      
      console.log('Insert data:', insertData);
      console.log('Inserting into visits table...');

      const { data, error } = await supabase
        .from('visits')
        .insert([insertData])
        .select('*');

      if (error) {
        console.error('Error inserting visit:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        throw new Error(`Failed to record visit: ${error.message}`);
      }

      console.log('Visit recorded successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Visit mutation success:', data);
      
      // Invalidate and refetch all related queries
      queryClient.invalidateQueries({ queryKey: ['visits-data'] });
      queryClient.invalidateQueries({ queryKey: ['processed-visit-data'] });
      
      // Force immediate refetch
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['visits-data'] });
        queryClient.refetchQueries({ queryKey: ['processed-visit-data'] });
      }, 100);
      
      toast({
        title: "Visit recorded",
        description: "Visit has been successfully recorded for today",
      });
    },
    onError: (error: any) => {
      console.error('Visit mutation error:', error);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      toast({
        title: "Error recording visit",
        description: error.message || "Failed to record visit. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent, planId: string) => {
    const plan = processedData.find(p => p.id === planId);
    if (plan && (plan.has_visit_today || plan.is_frequency_met)) {
      return; // Don't allow swipe for disabled rows
    }
    
    const touch = e.touches[0];
    setSwipeState({
      isActive: true,
      startX: touch.clientX,
      currentX: touch.clientX,
      planId
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipeState.isActive) return;
    
    const touch = e.touches[0];
    setSwipeState(prev => ({
      ...prev,
      currentX: touch.clientX
    }));
  };

  const handleTouchEnd = () => {
    if (!swipeState.isActive || !swipeState.planId) return;

    const swipeDistance = swipeState.currentX - swipeState.startX;
    const threshold = 100; // pixels

    if (swipeDistance > threshold) {
      // Swiped right - record visit
      recordVisitMutation.mutate(swipeState.planId);
    }

    setSwipeState({
      isActive: false,
      startX: 0,
      currentX: 0,
      planId: null
    });
  };

  const getSwipeOffset = (planId: string) => {
    if (swipeState.planId !== planId || !swipeState.isActive) return 0;
    const offset = Math.max(0, swipeState.currentX - swipeState.startX);
    return Math.min(offset, 120); // Max offset
  };

  const getSwipeOpacity = (planId: string) => {
    const offset = getSwipeOffset(planId);
    return Math.min(offset / 100, 1);
  };

  const isLoading = visitPlansLoading || doctorsLoading || visitsLoading || isProcessing;
  const error = visitPlansError;

  const averageReturnIndex = processedData.length > 0 
    ? Math.round(processedData.reduce((sum, plan) => sum + plan.return_index, 0) / processedData.length)
    : 0;

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

  const getDisabledRowClass = (plan: VisitPlanData) => {
    if (plan.has_visit_today || plan.is_frequency_met) {
      return 'opacity-50 bg-gray-100 cursor-not-allowed';
    }
    return 'cursor-pointer';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading return index analysis...</p>
          <p className="text-sm text-gray-500 mt-2">
            Loading: {visitPlansLoading && 'Plans'} {doctorsLoading && 'Doctors'} {visitsLoading && 'Visits'} {isProcessing && 'Processing'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Component error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading return index data</p>
          <p className="text-sm text-gray-600 mb-4">{error.message}</p>
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
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack} className="p-2 hover:bg-blue-50">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Indice de Retour</h1>
                <p className="text-sm text-gray-600">
                  Tracking {processedData.length} visit plans
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Visit Plans</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{processedData.length}</div>
              <p className="text-xs text-muted-foreground">Active plans</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {processedData.reduce((sum, plan) => sum + plan.total_visits, 0)}
              </div>
              <p className="text-xs text-muted-foreground">This year</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Return Index</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getReturnIndexColor(averageReturnIndex).split(' ')[0]}`}>
                {averageReturnIndex}%
              </div>
              <p className="text-xs text-muted-foreground">Overall performance</p>
            </CardContent>
          </Card>
        </div>

        {/* Visit Plans Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Visit Plans Analysis</CardTitle>
            <p className="text-sm text-gray-600">Swipe right on any row to record a visit for today</p>
          </CardHeader>
          <CardContent>
            {processedData.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Visit Plans Found</h3>
                <p className="text-gray-600">
                  No visit plans found for your profile. Please contact your administrator.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead>Doctor Name</TableHead>
                      <TableHead>Visit Frequency</TableHead>
                      <TableHead>Remaining This Month</TableHead>
                      {displayMonths.map(month => (
                        <TableHead key={month} className="text-center min-w-[60px]">{month}</TableHead>
                      ))}
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">Expected</TableHead>
                      <TableHead className="text-center">Return Index</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedData.map((plan) => (
                      <TableRow
                        key={plan.id}
                        className={`${getRowColorClass(plan.row_color)} ${getDisabledRowClass(plan)} touch-pan-y relative overflow-hidden select-none`}
                        style={{ 
                          transform: `translateX(${getSwipeOffset(plan.id)}px)`,
                          transition: swipeState.planId === plan.id && swipeState.isActive ? 'none' : 'transform 0.2s ease-out'
                        }}
                        onTouchStart={(e) => handleTouchStart(e, plan.id)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                      >
                        {/* Swipe action background - positioned absolutely behind the row */}
                        {!plan.has_visit_today && !plan.is_frequency_met && (
                          <div 
                            className="absolute inset-y-0 left-0 bg-green-500 flex items-center justify-start px-4 pointer-events-none"
                            style={{ 
                              width: `${getSwipeOffset(plan.id)}px`,
                              opacity: getSwipeOpacity(plan.id),
                              zIndex: 0
                            }}
                          >
                            <Check className="h-6 w-6 text-white" />
                            <span className="text-white font-medium ml-2">Record Visit</span>
                          </div>
                        )}

                        <TableCell className="w-8 relative z-10">
                          {plan.has_visit_today && (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                          {plan.is_frequency_met && !plan.has_visit_today && (
                            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">✓</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium relative z-10">
                          {plan.doctor_name}
                        </TableCell>
                        <TableCell className="relative z-10">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {plan.visit_frequency}x/month
                          </span>
                        </TableCell>
                        <TableCell className="text-center font-medium relative z-10">
                          {plan.remaining_visits_this_month}
                        </TableCell>
                        {plan.monthly_visits.map((visits, monthIndex) => (
                          <TableCell key={monthIndex} className="text-center relative z-10">
                            {visits}
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-medium relative z-10">{plan.total_visits}</TableCell>
                        <TableCell className="text-center relative z-10">{plan.expected_visits}</TableCell>
                        <TableCell className="text-center relative z-10">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReturnIndexColor(plan.return_index)}`}>
                            {plan.return_index}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Instructions & Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>How to record a visit:</strong> Swipe right on any row in the table to record a visit for today. The table will update automatically.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-50 border-l-4 border-l-green-500"></div>
                <span>Green: Visited current or last month</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-50 border-l-4 border-l-yellow-500"></div>
                <span>Yellow: Visited month before last, but not current/last month</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-50 border-l-4 border-l-red-500"></div>
                <span>Red: Not visited in last three months</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Visit recorded today</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span>Monthly frequency met</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <span>Disabled (cannot record more visits)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReturnIndexAnalysis;
