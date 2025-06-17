
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, TrendingUp, Users, Calendar, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ReturnIndexAnalysisProps {
  onBack: () => void;
}

interface DoctorVisitData {
  doctor_id: string;
  doctor_name: string;
  visit_frequency: string;
  monthly_visits: number[];
  total_visits: number;
  expected_visits: number;
  return_index: number;
}

const ReturnIndexAnalysis: React.FC<ReturnIndexAnalysisProps> = ({ onBack }) => {
  const { user, profile } = useAuth();

  // Get current month (0-based)
  const currentMonth = new Date().getMonth();
  const monthsElapsed = currentMonth + 1;

  // Generate month names for headers
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYearMonths = monthNames.slice(0, monthsElapsed);

  // Fetch visit plans and related data for the current delegate
  const { data: visitData, isLoading, error } = useQuery({
    queryKey: ['delegate-visits', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('No user ID available');
        return [];
      }

      console.log('Fetching visit plans for delegate:', user.id);

      try {
        // Fetch visit plans for the current delegate
        const { data: visitPlans, error: visitPlansError } = await supabase
          .from('visit_plans')
          .select(`
            id,
            visit_frequency,
            doctor_id,
            doctors!inner (
              id,
              first_name,
              last_name
            )
          `)
          .eq('delegate_id', user.id);

        if (visitPlansError) {
          console.error('Error fetching visit plans:', visitPlansError);
          throw visitPlansError;
        }

        console.log('Visit plans fetched:', visitPlans);

        if (!visitPlans || visitPlans.length === 0) {
          console.log('No visit plans found for delegate');
          return [];
        }

        // Fetch visits for each visit plan
        const visitPlanIds = visitPlans.map(vp => vp.id);
        console.log('Visit plan IDs:', visitPlanIds);

        const { data: visits, error: visitsError } = await supabase
          .from('visits')
          .select('visit_plan_id, visit_date')
          .in('visit_plan_id', visitPlanIds)
          .gte('visit_date', `${new Date().getFullYear()}-01-01`)
          .lte('visit_date', new Date().toISOString().split('T')[0]);

        if (visitsError) {
          console.error('Error fetching visits:', visitsError);
          throw visitsError;
        }

        console.log('Visits fetched:', visits);

        // Process the data to calculate return index
        const processedData: DoctorVisitData[] = visitPlans.map(plan => {
          const doctorVisits = visits?.filter(v => v.visit_plan_id === plan.id) || [];
          
          // Calculate monthly visits
          const monthlyVisits = new Array(monthsElapsed).fill(0);
          doctorVisits.forEach(visit => {
            const visitMonth = new Date(visit.visit_date).getMonth();
            if (visitMonth < monthsElapsed) {
              monthlyVisits[visitMonth]++;
            }
          });

          const totalVisits = doctorVisits.length;
          
          // Calculate expected visits based on frequency (only handle valid enum values)
          let expectedVisitsPerMonth = 0;
          let frequencyLabel = '';
          
          switch (plan.visit_frequency) {
            case '1':
              expectedVisitsPerMonth = 1;
              frequencyLabel = 'Monthly';
              break;
            case '2':
              expectedVisitsPerMonth = 2;
              frequencyLabel = 'Bi-weekly';
              break;
            default:
              expectedVisitsPerMonth = 1;
              frequencyLabel = 'Monthly';
          }

          const expectedVisits = Math.round(expectedVisitsPerMonth * monthsElapsed);
          const returnIndex = expectedVisits > 0 ? Math.round((totalVisits / expectedVisits) * 100) : 0;

          return {
            doctor_id: plan.doctor_id,
            doctor_name: plan.doctors ? `${plan.doctors.first_name} ${plan.doctors.last_name}` : 'Unknown Doctor',
            visit_frequency: frequencyLabel,
            monthly_visits: monthlyVisits,
            total_visits: totalVisits,
            expected_visits: expectedVisits,
            return_index: returnIndex
          };
        });

        console.log('Processed visit data:', processedData);
        return processedData;
      } catch (error) {
        console.error('Error in query function:', error);
        throw error;
      }
    },
    enabled: !!user?.id,
  });

  // Log any query errors
  if (error) {
    console.error('Query error:', error);
  }

  // Calculate summary statistics
  const totalDoctors = visitData?.length || 0;
  const totalVisits = visitData?.reduce((sum, data) => sum + data.total_visits, 0) || 0;
  const averageReturnIndex = totalDoctors > 0 
    ? Math.round(visitData!.reduce((sum, data) => sum + data.return_index, 0) / totalDoctors)
    : 0;

  // Helper function to get color based on return index
  const getReturnIndexColor = (returnIndex: number) => {
    if (returnIndex >= 80) return 'text-green-600 bg-green-50';
    if (returnIndex >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

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
                <h1 className="text-2xl font-bold text-gray-900">Return Index Analysis</h1>
                <p className="text-sm text-gray-600">Delegate performance tracking</p>
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
              <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalDoctors}</div>
              <p className="text-xs text-muted-foreground">
                Assigned to you
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalVisits}</div>
              <p className="text-xs text-muted-foreground">
                This year so far
              </p>
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
              <p className="text-xs text-muted-foreground">
                Overall performance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Doctor Visit Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading visit data...</div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-600 mb-2">Error loading data</div>
                <p className="text-sm text-gray-600">{error.message}</p>
              </div>
            ) : !visitData || visitData.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Visit Plans Found</h3>
                <p className="text-gray-600">
                  No visit plans have been assigned to you yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doctor Name</TableHead>
                      <TableHead>Frequency</TableHead>
                      {currentYearMonths.map(month => (
                        <TableHead key={month} className="text-center">{month}</TableHead>
                      ))}
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">Expected</TableHead>
                      <TableHead className="text-center">Return Index</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visitData.map((doctor) => (
                      <TableRow key={doctor.doctor_id}>
                        <TableCell className="font-medium">{doctor.doctor_name}</TableCell>
                        <TableCell>{doctor.visit_frequency}</TableCell>
                        {doctor.monthly_visits.map((visits, index) => (
                          <TableCell key={index} className="text-center">
                            {visits}
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-medium">{doctor.total_visits}</TableCell>
                        <TableCell className="text-center">{doctor.expected_visits}</TableCell>
                        <TableCell className="text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReturnIndexColor(doctor.return_index)}`}>
                            {doctor.return_index}%
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
      </div>
    </div>
  );
};

export default ReturnIndexAnalysis;
