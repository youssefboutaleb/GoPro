
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, TrendingUp, Users, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ReturnIndexAnalysisProps {
  onBack: () => void;
}

interface DoctorData {
  id: string;
  first_name: string;
  last_name: string;
  specialty: string | null;
  brick_name: string | null;
  visit_frequency: string;
  monthly_visits: number[];
  total_visits: number;
  expected_visits: number;
  return_index: number;
  row_color: 'red' | 'yellow' | 'green';
}

const ReturnIndexAnalysis: React.FC<ReturnIndexAnalysisProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedBrick, setSelectedBrick] = useState<string>('all');

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-based
  const monthsElapsed = currentMonth;

  // Generate month names for table headers
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const displayMonths = monthNames.slice(0, currentMonth);

  // Fetch visit plans with doctor and brick information
  const { data: doctorsData = [], isLoading } = useQuery({
    queryKey: ['return-index-analysis', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      console.log('🔍 Fetching visit plans for delegate:', user.id);

      // First, get visit plans for current user
      const { data: visitPlans, error: visitPlansError } = await supabase
        .from('visit_plans')
        .select('id, visit_frequency, doctor_id, delegate_id')
        .eq('delegate_id', user.id);

      if (visitPlansError) {
        console.error('❌ Error fetching visit plans:', visitPlansError);
        throw visitPlansError;
      }

      if (!visitPlans || visitPlans.length === 0) {
        console.log('⚠️ No visit plans found for delegate');
        return [];
      }

      console.log('📋 Visit plans found:', visitPlans.length, visitPlans);

      // Get doctor IDs from visit plans
      const doctorIds = visitPlans.map(vp => vp.doctor_id).filter(Boolean);

      if (doctorIds.length === 0) {
        console.log('⚠️ No doctor IDs found in visit plans');
        return [];
      }

      // Fetch doctors information
      const { data: doctors, error: doctorsError } = await supabase
        .from('doctors')
        .select(`
          id,
          first_name,
          last_name,
          specialty,
          brick_id,
          bricks:brick_id (
            name
          )
        `)
        .in('id', doctorIds);

      if (doctorsError) {
        console.error('❌ Error fetching doctors:', doctorsError);
        throw doctorsError;
      }

      console.log('👨‍⚕️ Doctors found:', doctors?.length || 0, doctors);

      // Get all visit plan IDs to fetch visits
      const visitPlanIds = visitPlans.map(vp => vp.id);

      // Fetch all visits for these visit plans in the current year
      const { data: visits, error: visitsError } = await supabase
        .from('visits')
        .select('visit_plan_id, visit_date')
        .in('visit_plan_id', visitPlanIds)
        .gte('visit_date', `${currentYear}-01-01`)
        .lte('visit_date', `${currentYear}-12-31`);

      if (visitsError) {
        console.error('❌ Error fetching visits:', visitsError);
        throw visitsError;
      }

      console.log('📅 Visits found:', visits?.length || 0, visits);

      // Process each doctor's data
      const processedData: DoctorData[] = [];

      for (const doctor of doctors || []) {
        // Find the visit plan for this doctor
        const visitPlan = visitPlans.find(vp => vp.doctor_id === doctor.id);
        if (!visitPlan) continue;

        const doctorVisits = visits?.filter(v => v.visit_plan_id === visitPlan.id) || [];

        // Calculate monthly visits
        const monthlyVisits = new Array(currentMonth).fill(0);
        doctorVisits.forEach(visit => {
          const visitDate = new Date(visit.visit_date);
          const visitMonth = visitDate.getMonth(); // 0-based
          if (visitMonth < currentMonth) {
            monthlyVisits[visitMonth]++;
          }
        });

        const totalVisits = doctorVisits.length;
        const frequencyPerMonth = parseInt(visitPlan.visit_frequency) || 1;
        const expectedVisits = frequencyPerMonth * monthsElapsed;
        const returnIndex = expectedVisits > 0 ? Math.round((totalVisits / expectedVisits) * 100) : 0;

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
          id: doctor.id,
          first_name: doctor.first_name,
          last_name: doctor.last_name,
          specialty: doctor.specialty,
          brick_name: doctor.bricks?.name || null,
          visit_frequency: visitPlan.visit_frequency,
          monthly_visits: monthlyVisits,
          total_visits: totalVisits,
          expected_visits: expectedVisits,
          return_index: returnIndex,
          row_color: rowColor
        });
      }

      console.log('📊 Processed doctor data:', processedData);
      return processedData;
    },
    enabled: !!user?.id
  });

  // Filter doctors based on specialty and brick
  const filteredDoctors = doctorsData.filter(doctor => {
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty;
    const matchesBrick = selectedBrick === 'all' || doctor.brick_name === selectedBrick;
    return matchesSpecialty && matchesBrick;
  });

  // Get unique specialties and bricks for filters
  const specialties = [...new Set(doctorsData.map(d => d.specialty).filter(Boolean))];
  const bricks = [...new Set(doctorsData.map(d => d.brick_name).filter(Boolean))];

  // Calculate average return index
  const averageReturnIndex = filteredDoctors.length > 0 
    ? Math.round(filteredDoctors.reduce((sum, doctor) => sum + doctor.return_index, 0) / filteredDoctors.length)
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
                <h1 className="text-2xl font-bold text-gray-900">Return Index Analysis</h1>
                <p className="text-sm text-gray-600">
                  Tracking {filteredDoctors.length} targeted doctors
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Specialty</label>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Specialties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    {specialties.map(specialty => (
                      <SelectItem key={specialty} value={specialty!}>{specialty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Brick</label>
                <Select value={selectedBrick} onValueChange={setSelectedBrick}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Bricks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Bricks</SelectItem>
                    {bricks.map(brick => (
                      <SelectItem key={brick} value={brick!}>{brick}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{filteredDoctors.length}</div>
              <p className="text-xs text-muted-foreground">Targeted doctors</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {filteredDoctors.reduce((sum, doctor) => sum + doctor.total_visits, 0)}
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

        {/* Doctors Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Doctor Visit Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDoctors.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Doctors Found</h3>
                <p className="text-gray-600">
                  No targeted doctors match the selected criteria.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>Brick</TableHead>
                      <TableHead>Frequency</TableHead>
                      {displayMonths.map(month => (
                        <TableHead key={month} className="text-center min-w-[60px]">{month}</TableHead>
                      ))}
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">Expected</TableHead>
                      <TableHead className="text-center">Return Index</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDoctors.map((doctor) => (
                      <TableRow key={doctor.id} className={getRowColorClass(doctor.row_color)}>
                        <TableCell className="font-medium">
                          {doctor.first_name} {doctor.last_name}
                        </TableCell>
                        <TableCell>{doctor.specialty || 'N/A'}</TableCell>
                        <TableCell>{doctor.brick_name || 'N/A'}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {doctor.visit_frequency}x/month
                          </span>
                        </TableCell>
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
