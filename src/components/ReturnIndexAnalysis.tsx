
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ReturnIndexAnalysisProps {
  onBack: () => void;
}

interface DoctorVisitData {
  doctor_id: string;
  doctor_name: string;
  doctor_first_name: string;
  doctor_specialty: string | null;
  visit_frequency: number;
  visits_per_month: { [key: string]: number };
  visits_completed: number;
  visits_expected: number;
  returnIndex: number;
}

const ReturnIndexAnalysis: React.FC<ReturnIndexAnalysisProps> = ({ onBack }) => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const months = [
    { value: 'january', label: 'Jan', num: 1 },
    { value: 'february', label: 'Feb', num: 2 },
    { value: 'march', label: 'Mar', num: 3 },
    { value: 'april', label: 'Apr', num: 4 },
    { value: 'may', label: 'May', num: 5 },
    { value: 'june', label: 'Jun', num: 6 },
    { value: 'july', label: 'Jul', num: 7 },
    { value: 'august', label: 'Aug', num: 8 },
    { value: 'september', label: 'Sep', num: 9 },
    { value: 'october', label: 'Oct', num: 10 },
    { value: 'november', label: 'Nov', num: 11 },
    { value: 'december', label: 'Dec', num: 12 }
  ];

  // Get current month to determine which months to show
  const currentMonth = new Date().getMonth() + 1;
  const monthsToShow = months.filter(month => month.num <= currentMonth);

  // Fetch visit plans for the current delegate
  const { data: visitPlans, isLoading: plansLoading } = useQuery({
    queryKey: ['delegate_visit_plans', user?.id],
    queryFn: async () => {
      if (!user?.id || profile?.user_type !== 'Delegate') return [];
      
      const { data, error } = await supabase
        .from('visit_plans')
        .select(`
          doctor_id,
          visit_frequency,
          doctors (
            id,
            last_name,
            first_name,
            specialty
          )
        `)
        .eq('delegate_id', user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && profile?.user_type === 'Delegate',
  });

  // Fetch visits for the current year for this delegate
  const { data: visitsData, isLoading: visitsLoading } = useQuery({
    queryKey: ['delegate_visits', user?.id],
    queryFn: async () => {
      if (!user?.id || profile?.user_type !== 'Delegate') return [];

      const currentYear = new Date().getFullYear();
      const startOfYear = `${currentYear}-01-01`;
      const endOfYear = `${currentYear}-12-31`;

      const { data, error } = await supabase
        .from('visits')
        .select(`
          visit_date,
          visit_plans!inner (
            doctor_id,
            delegate_id
          )
        `)
        .gte('visit_date', startOfYear)
        .lte('visit_date', endOfYear)
        .eq('visit_plans.delegate_id', user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && profile?.user_type === 'Delegate',
  });

  // Process data for the table
  const processedData: DoctorVisitData[] = visitPlans?.map(vp => {
    const doctor = vp.doctors;
    if (!doctor) return null;

    // Count visits per month for this doctor
    const visitsPerMonth: { [key: string]: number } = {};
    
    // Initialize all months to 0
    monthsToShow.forEach(month => {
      visitsPerMonth[month.value] = 0;
    });

    // Count visits
    visitsData?.forEach(visit => {
      if (visit.visit_plans?.doctor_id === vp.doctor_id) {
        const visitDate = new Date(visit.visit_date);
        const visitMonth = visitDate.getMonth() + 1;
        const monthKey = months.find(m => m.num === visitMonth)?.value;
        if (monthKey && visitsPerMonth.hasOwnProperty(monthKey)) {
          visitsPerMonth[monthKey]++;
        }
      }
    });

    // Calculate return index data
    const visitsCompleted = Object.values(visitsPerMonth).reduce((sum, visits) => sum + visits, 0);
    const frequency = parseInt(vp.visit_frequency) || 1;
    const visitsExpected = frequency * currentMonth;
    const returnIndex = visitsExpected > 0 ? Math.round((visitsCompleted / visitsExpected) * 100) : 0;

    return {
      doctor_id: vp.doctor_id,
      doctor_name: doctor.last_name,
      doctor_first_name: doctor.first_name,
      doctor_specialty: doctor.specialty,
      visit_frequency: frequency,
      visits_per_month: visitsPerMonth,
      visits_completed: visitsCompleted,
      visits_expected: visitsExpected,
      returnIndex
    };
  }).filter(Boolean) as DoctorVisitData[] || [];

  const getStatusColor = (doctor: DoctorVisitData) => {
    const percentage = doctor.returnIndex;
    if (percentage >= 80) return 'bg-green-100 border-green-300';
    if (percentage >= 50) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
  };

  const getStatusTextColor = (doctor: DoctorVisitData) => {
    const percentage = doctor.returnIndex;
    if (percentage >= 80) return 'text-green-800';
    if (percentage >= 50) return 'text-yellow-800';
    return 'text-red-800';
  };

  if (profile?.user_type !== 'Delegate') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              This page is only available for delegates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (plansLoading || visitsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your visit data...</p>
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
                <div className="p-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Return Index Analysis</h1>
                  <p className="text-sm text-gray-600">Your visit performance analysis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{processedData.length}</div>
              <p className="text-xs text-muted-foreground">Assigned to you</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {processedData.reduce((sum, doctor) => sum + doctor.visits_completed, 0)}
              </div>
              <p className="text-xs text-muted-foreground">This year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Return Index</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {processedData.length > 0 
                  ? Math.round(processedData.reduce((sum, doctor) => sum + doctor.returnIndex, 0) / processedData.length)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Overall performance</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Visit Performance by Doctor</CardTitle>
            <CardDescription>Monthly visit tracking and return index calculation</CardDescription>
          </CardHeader>
          <CardContent>
            {processedData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No assigned doctors found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Doctor</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Specialty</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Frequency/Month</th>
                      {monthsToShow.map((month) => (
                        <th key={month.value} className="text-center py-3 px-4 font-medium text-gray-700">
                          {month.label}
                        </th>
                      ))}
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Total</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Expected</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Return Index</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedData.map((doctor) => (
                      <tr key={doctor.doctor_id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${getStatusColor(doctor)} border-2`}>
                        <td className="py-4 px-4">
                          <span className={`font-medium ${getStatusTextColor(doctor)}`}>
                            Dr. {doctor.doctor_first_name} {doctor.doctor_name}
                          </span>
                        </td>
                        <td className={`py-4 px-4 ${getStatusTextColor(doctor)}`}>
                          {doctor.doctor_specialty || 'Not specified'}
                        </td>
                        <td className={`py-4 px-4 text-center ${getStatusTextColor(doctor)}`}>
                          <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 font-medium">
                            {doctor.visit_frequency}
                          </span>
                        </td>
                        {monthsToShow.map((month) => (
                          <td key={month.value} className={`py-4 px-4 text-center ${getStatusTextColor(doctor)}`}>
                            <span className="px-2 py-1 rounded">
                              {doctor.visits_per_month[month.value] || 0}
                            </span>
                          </td>
                        ))}
                        <td className={`py-4 px-4 text-center font-bold ${getStatusTextColor(doctor)}`}>
                          {doctor.visits_completed}
                        </td>
                        <td className={`py-4 px-4 text-center ${getStatusTextColor(doctor)}`}>
                          {doctor.visits_expected}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                              doctor.returnIndex >= 80 ? 'bg-green-500' :
                              doctor.returnIndex >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                            <span className={`font-semibold ${getStatusTextColor(doctor)}`}>
                              {doctor.returnIndex}%
                            </span>
                          </div>
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
            <CardTitle className="text-lg text-gray-900">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-200 border-2 border-green-300 rounded"></div>
                <span className="text-sm text-green-800 font-medium">Excellent (80%+)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-200 border-2 border-yellow-300 rounded"></div>
                <span className="text-sm text-yellow-800 font-medium">Average (50-79%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-200 border-2 border-red-300 rounded"></div>
                <span className="text-sm text-red-800 font-medium">Low (&lt;50%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReturnIndexAnalysis;
