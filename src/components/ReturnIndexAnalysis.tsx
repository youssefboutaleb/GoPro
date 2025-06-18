
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, TrendingUp, Users, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
}

const ReturnIndexAnalysis: React.FC<ReturnIndexAnalysisProps> = ({ onBack }) => {
  const { user } = useAuth();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-based
  const monthsElapsed = currentMonth;

  // Generate month names for table headers
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const displayMonths = monthNames.slice(0, currentMonth);

  const { data: visitPlansData = [], isLoading } = useQuery({
    queryKey: ['visit-plans-analysis', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      try {
        const { data: visitPlansData, error: visitPlansError } = await supabase
          .from('visit_plans')
          .select(`
            id,
            visit_frequency,
            doctor_id,
            doctors:doctor_id (
              id,
              first_name,
              last_name,
              specialty,
              brick_id,
              bricks:brick_id (
                name
              )
            ),
            visits (
              id,
              visit_date
            )
          `)
          .eq('delegate_id', user.id);

        if (visitPlansError) {
          throw visitPlansError;
        }

        if (!visitPlansData || visitPlansData.length === 0) {
          return [];
        }

        const processedData: VisitPlanData[] = [];

        for (const visitPlan of visitPlansData) {
          if (!visitPlan.doctors) {
            continue;
          }

          const doctor = visitPlan.doctors;
          const visits = visitPlan.visits || [];

          // Filter visits for current year
          const currentYearVisits = visits.filter(visit => {
            const visitDate = new Date(visit.visit_date);
            return visitDate.getFullYear() === currentYear;
          });

          // Calculate monthly visits
          const monthlyVisits = new Array(currentMonth).fill(0);
          currentYearVisits.forEach(visit => {
            const visitDate = new Date(visit.visit_date);
            const visitMonth = visitDate.getMonth(); // 0-based
            if (visitMonth < currentMonth) {
              monthlyVisits[visitMonth]++;
            }
          });

          const totalVisits = currentYearVisits.length;
          const visitFrequency = parseInt(visitPlan.visit_frequency) || 1;
          const expectedVisits = visitFrequency * monthsElapsed;
          const returnIndex = expectedVisits > 0 ? Math.round((totalVisits / expectedVisits) * 100) : 0;

          // Calculate remaining visits for this month (current month)
          const currentMonthVisits = monthlyVisits[currentMonth - 1] || 0;
          const remainingVisitsThisMonth = Math.abs(visitFrequency - currentMonthVisits);

          // Determine row color based on last month and month before last
          let rowColor: 'red' | 'yellow' | 'green' = 'red';
          const lastMonth = currentMonth - 1; // Current month - 1 (1-based to 0-based)
          const monthBeforeLast = currentMonth - 2; // Current month - 2 (1-based to 0-based)

          const visitedLastMonth = lastMonth >= 0 ? monthlyVisits[lastMonth] > 0 : false;
          const visitedMonthBeforeLast = monthBeforeLast >= 0 ? monthlyVisits[monthBeforeLast] > 0 : false;

          if (visitedLastMonth) {
            rowColor = 'green';
          } else if (visitedMonthBeforeLast) {
            rowColor = 'yellow';
          }

          processedData.push({
            id: visitPlan.id,
            doctor_name: `${doctor.first_name} ${doctor.last_name}`,
            visit_frequency: visitFrequency,
            remaining_visits_this_month: remainingVisitsThisMonth,
            monthly_visits: monthlyVisits,
            total_visits: totalVisits,
            expected_visits: expectedVisits,
            return_index: returnIndex,
            row_color: rowColor
          });
        }

        return processedData;

      } catch (error) {
        throw error;
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Calculate average return index
  const averageReturnIndex = visitPlansData.length > 0 
    ? Math.round(visitPlansData.reduce((sum, plan) => sum + plan.return_index, 0) / visitPlansData.length)
    : 0;

  // Helper functions for row styling
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading return index analysis...</p>
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
                  Tracking {visitPlansData.length} visit plans
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
              <div className="text-2xl font-bold text-blue-600">{visitPlansData.length}</div>
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
                {visitPlansData.reduce((sum, plan) => sum + plan.total_visits, 0)}
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
          </CardHeader>
          <CardContent>
            {visitPlansData.length === 0 ? (
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
                    {visitPlansData.map((plan) => (
                      <TableRow key={plan.id} className={getRowColorClass(plan.row_color)}>
                        <TableCell className="font-medium">
                          {plan.doctor_name}
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {plan.visit_frequency}x/month
                          </span>
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {plan.remaining_visits_this_month}
                        </TableCell>
                        {plan.monthly_visits.map((visits, index) => (
                          <TableCell key={index} className="text-center">
                            {visits}
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-medium">{plan.total_visits}</TableCell>
                        <TableCell className="text-center">{plan.expected_visits}</TableCell>
                        <TableCell className="text-center">
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
            <CardTitle className="text-sm">Color Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-50 border-l-4 border-l-green-500"></div>
                <span>Green: Visited last month</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-50 border-l-4 border-l-yellow-500"></div>
                <span>Yellow: Visited month before last, but not last month</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-50 border-l-4 border-l-red-500"></div>
                <span>Red: Not visited in last two months</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReturnIndexAnalysis;
