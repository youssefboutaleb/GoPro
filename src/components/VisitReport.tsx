import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calendar, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface VisitReportProps {
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

const VisitReport = ({ onBack }: VisitReportProps) => {
  const [selectedMonth, setSelectedMonth] = useState('january');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [reportData, setReportData] = useState<DoctorVisitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const months = [
    { value: 'january', label: 'January', num: 1 },
    { value: 'february', label: 'February', num: 2 },
    { value: 'march', label: 'March', num: 3 },
    { value: 'april', label: 'April', num: 4 },
    { value: 'may', label: 'May', num: 5 },
    { value: 'june', label: 'June', num: 6 },
    { value: 'july', label: 'July', num: 7 },
    { value: 'august', label: 'August', num: 8 },
    { value: 'september', label: 'September', num: 9 },
    { value: 'october', label: 'October', num: 10 },
    { value: 'november', label: 'November', num: 11 },
    { value: 'december', label: 'December', num: 12 }
  ];

  // Get current month to determine which months to show
  const currentMonth = new Date().getMonth() + 1;
  const monthsToShow = months.filter(month => month.num <= currentMonth);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        console.log('Fetching user profile for user:', user.id);

        // First, get the current user's profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setError('Error retrieving user profile');
          return;
        }

        if (!profileData) {
          console.log('No profile found for user:', user.id);
          setError('No profile found for this user. Please contact administrator.');
          return;
        }

        console.log('Profile found:', profileData);

        // Get all visit_plans for the current user
        const { data: visitPlans, error: vpError } = await supabase
          .from('visit_plans')
          .select(`
            doctor_id,
            visit_frequency
          `)
          .eq('delegate_id', user.id);

        if (vpError) {
          console.error('Error fetching visit_plans:', vpError);
          setError('Error retrieving assigned doctors');
          return;
        }

        console.log('Visit plans found:', visitPlans);

        if (!visitPlans || visitPlans.length === 0) {
          console.log('No visit plans found for user');
          setReportData([]);
          return;
        }

        // Get all doctors referenced in visit plans
        const doctorIds = visitPlans.map(vp => vp.doctor_id).filter(Boolean);
        
        let doctorsData = [];
        if (doctorIds.length > 0) {
          const { data: doctors, error: doctorsError } = await supabase
            .from('doctors')
            .select(`
              id,
              last_name,
              first_name,
              specialty
            `)
            .in('id', doctorIds);

          if (doctorsError) {
            console.error('Error fetching doctors:', doctorsError);
            setError('Error retrieving doctor information');
            return;
          }

          doctorsData = doctors || [];
        }

        console.log('Doctors found:', doctorsData);

        // Get all visits for the current year for these visit plans
        const currentYear = new Date().getFullYear();
        const startOfYear = `${currentYear}-01-01`;
        const endOfYear = `${currentYear}-12-31`;

        const visitPlanIds = visitPlans.map(vp => vp.id).filter(Boolean);
        
        let visitsData = [];
        if (visitPlanIds.length > 0) {
          const { data: visits, error: visitsError } = await supabase
            .from('visits')
            .select(`
              visit_date,
              visit_plan_id
            `)
            .in('visit_plan_id', visitPlanIds)
            .gte('visit_date', startOfYear)
            .lte('visit_date', endOfYear);

          if (visitsError) {
            console.error('Error fetching visits:', visitsError);
            setError('Error retrieving visits');
            return;
          }

          visitsData = visits || [];
        }

        console.log('Visits found:', visitsData);

        // Process the data
        const processedData: DoctorVisitData[] = visitPlans.map(vp => {
          const doctor = doctorsData.find(d => d.id === vp.doctor_id);
          if (!doctor) return null;

          // Count visits per month for this doctor
          const visitsPerMonth: { [key: string]: number } = {};
          
          // Initialize all months to 0
          monthsToShow.forEach(month => {
            visitsPerMonth[month.value] = 0;
          });

          // Count visits for this visit plan
          visitsData.forEach(visit => {
            if (visit.visit_plan_id === vp.id) {
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
        }).filter(Boolean) as DoctorVisitData[];

        console.log('Processed report data:', processedData);
        setReportData(processedData);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [user]);

  // Filter data by specialty
  const filteredReportData = reportData.filter(doctor => {
    if (selectedSpecialty === 'all') return true;
    return doctor.doctor_specialty === selectedSpecialty;
  });

  // Get unique specialties for filter
  const specialties = [...new Set(reportData.map(d => d.doctor_specialty).filter(Boolean))];

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="bg-white shadow-lg border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack} className="p-2 hover:bg-blue-50">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Visit Report</h1>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
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
                  <h1 className="text-2xl font-bold text-gray-900">Visit Report</h1>
                  <p className="text-sm text-gray-600">Number of visits per doctor and per month</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthsToShow.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All specialties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All specialties</SelectItem>
                    {specialties.map(specialty => (
                      <SelectItem key={specialty} value={specialty!}>{specialty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Report Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">
              Visit report - {monthsToShow.find(m => m.value === selectedMonth)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredReportData.length === 0 ? (
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
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Visit frequency</th>
                      {monthsToShow.map((month) => (
                        <th key={month.value} className="text-center py-3 px-4 font-medium text-gray-700">
                          {month.label}
                        </th>
                      ))}
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Total</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Visits</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Return Index</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReportData.map((doctor) => {
                      const total = Object.values(doctor.visits_per_month).reduce((sum, visits) => sum + visits, 0);
                      return (
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
                              {doctor.visit_frequency}/month
                            </span>
                          </td>
                          {monthsToShow.map((month) => (
                            <td key={month.value} className={`py-4 px-4 text-center ${getStatusTextColor(doctor)}`}>
                              <span className={`px-2 py-1 rounded ${selectedMonth === month.value ? 'bg-blue-200 font-bold' : ''}`}>
                                {doctor.visits_per_month[month.value] || 0}
                              </span>
                            </td>
                          ))}
                          <td className={`py-4 px-4 text-center font-bold ${getStatusTextColor(doctor)}`}>
                            {total}
                          </td>
                          <td className={`py-4 px-4 text-center ${getStatusTextColor(doctor)}`}>
                            <span className="text-sm">
                              {doctor.visits_completed} / {doctor.visits_expected}
                            </span>
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
                      );
                    })}
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

export default VisitReport;
