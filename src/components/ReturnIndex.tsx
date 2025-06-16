
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Filter, User, Stethoscope, MapPin, FileText, Check } from 'lucide-react';
import VisitReport from './VisitReport';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ReturnIndexProps {
  onBack: () => void;
}

interface Doctor {
  id: string;
  name: string;
  first_name: string;
  specialty: string | null;
  territory_id: string | null;
  territories?: {
    name: string;
    sector?: {
      name: string;
    };
  };
  // Calculated fields for return index
  returnIndex: number;
  status: string;
  visits_completed: number;
  visits_expected: number;
  visits_this_month: number;
  visit_frequency: number;
}

const ReturnIndex = ({ onBack }: ReturnIndexProps) => {
  const [activeTab, setActiveTab] = useState('doctors');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedWeek, setSelectedWeek] = useState('1');
  const [selectedTerritory, setSelectedTerritory] = useState('all');
  const [swipedRows, setSwipedRows] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // First, get the current user's delegate information
  const { data: currentDelegate } = useQuery({
    queryKey: ['current-delegate', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log('Fetching delegate for user:', user.id);
      
      const { data, error } = await supabase
        .from('delegates')
        .select('id, name, first_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching delegate:', error);
        throw error;
      }

      console.log('Current delegate:', data);
      return data;
    },
    enabled: !!user?.id
  });

  // Query to get total visits by current delegate in current year
  const { data: totalVisitsYear = 0 } = useQuery({
    queryKey: ['total-visits-year', currentDelegate?.id],
    queryFn: async () => {
      if (!currentDelegate?.id) return 0;

      const currentYear = new Date().getFullYear();

      const { data: visits, error } = await supabase
        .from('visits')
        .select(`
          id,
          visit_frequencies!inner (
            delegate_id
          )
        `)
        .eq('visit_frequencies.delegate_id', currentDelegate.id)
        .gte('visit_date', `${currentYear}-01-01`)
        .lt('visit_date', `${currentYear + 1}-01-01`);

      if (error) {
        console.error('Error fetching total visits for year:', error);
        return 0;
      }

      return visits?.length || 0;
    },
    enabled: !!currentDelegate?.id
  });

  const { data: rawDoctors = [], isLoading, error } = useQuery({
    queryKey: ['doctors-return-index', currentDelegate?.id],
    queryFn: async () => {
      if (!currentDelegate?.id) {
        console.log('No delegate found, returning empty array');
        return [];
      }

      console.log('Fetching doctors for delegate:', currentDelegate.id);
      
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          id,
          name,
          first_name,
          specialty,
          territory_id,
          territories:territory_id (
            name,
            sectors:sector_id (
              name
            )
          ),
          visit_frequencies!inner (
            visit_frequency,
            delegate_id
          )
        `)
        .eq('visit_frequencies.delegate_id', currentDelegate.id)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching doctors for delegate:', error);
        throw error;
      }

      console.log('Fetched doctors for delegate:', data);
      console.log('Number of doctors fetched:', data?.length || 0);
      return data;
    },
    enabled: !!currentDelegate?.id
  });

  // Transform raw data to include calculated return index values
  const { data: doctorsWithIndex = [] } = useQuery({
    queryKey: ['doctors-with-index', rawDoctors, currentDelegate?.id],
    queryFn: async () => {
      if (!rawDoctors.length || !currentDelegate?.id) return [];

      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      
      // Calculate last month and month before last month
      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      const monthBeforeLastMonth = lastMonth === 1 ? 12 : lastMonth - 1;
      const monthBeforeLastYear = lastMonth === 1 ? lastMonthYear - 1 : lastMonthYear;

      const doctorsPromises = rawDoctors.map(async (doctor: any) => {
        // Get visits count for this year EXCLUDING current month
        const { data: visits, error: visitsError } = await supabase
          .from('visits')
          .select(`
            id,
            visit_frequencies!inner (
              doctor_id,
              delegate_id
            )
          `)
          .eq('visit_frequencies.doctor_id', doctor.id)
          .eq('visit_frequencies.delegate_id', currentDelegate.id)
          .gte('visit_date', `${currentYear}-01-01`)
          .lt('visit_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`);

        if (visitsError) {
          console.error('Error fetching visits for doctor:', doctor.id, visitsError);
        }

        // Get visits count for current month only
        const { data: visitsThisMonth, error: visitsThisMonthError } = await supabase
          .from('visits')
          .select(`
            id,
            visit_frequencies!inner (
              doctor_id,
              delegate_id
            )
          `)
          .eq('visit_frequencies.doctor_id', doctor.id)
          .eq('visit_frequencies.delegate_id', currentDelegate.id)
          .gte('visit_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
          .lt('visit_date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);

        if (visitsThisMonthError) {
          console.error('Error fetching current month visits for doctor:', doctor.id, visitsThisMonthError);
        }

        // Get visits for last month
        const { data: visitsLastMonth, error: visitsLastMonthError } = await supabase
          .from('visits')
          .select(`
            id,
            visit_frequencies!inner (
              doctor_id,
              delegate_id
            )
          `)
          .eq('visit_frequencies.doctor_id', doctor.id)
          .eq('visit_frequencies.delegate_id', currentDelegate.id)
          .gte('visit_date', `${lastMonthYear}-${lastMonth.toString().padStart(2, '0')}-01`)
          .lt('visit_date', `${lastMonthYear}-${(lastMonth + 1).toString().padStart(2, '0')}-01`);

        if (visitsLastMonthError) {
          console.error('Error fetching last month visits for doctor:', doctor.id, visitsLastMonthError);
        }

        // Get visits for month before last month
        const { data: visitsMonthBeforeLast, error: visitsMonthBeforeLastError } = await supabase
          .from('visits')
          .select(`
            id,
            visit_frequencies!inner (
              doctor_id,
              delegate_id
            )
          `)
          .eq('visit_frequencies.doctor_id', doctor.id)
          .eq('visit_frequencies.delegate_id', currentDelegate.id)
          .gte('visit_date', `${monthBeforeLastYear}-${monthBeforeLastMonth.toString().padStart(2, '0')}-01`)
          .lt('visit_date', `${monthBeforeLastYear}-${(monthBeforeLastMonth + 1).toString().padStart(2, '0')}-01`);

        if (visitsMonthBeforeLastError) {
          console.error('Error fetching month before last visits for doctor:', doctor.id, visitsMonthBeforeLastError);
        }

        const visitsCompleted = visits?.length || 0;
        const visitsThisMonthCount = visitsThisMonth?.length || 0;
        const visitsLastMonthCount = visitsLastMonth?.length || 0;
        const visitsMonthBeforeLastCount = visitsMonthBeforeLast?.length || 0;

        // Calculate expected visits based on frequency (excluding current month)
        const visitFrequency = doctor.visit_frequencies[0]?.visit_frequency || 1;
        const visitsPerMonth = visitFrequency;

        // Calculate expected visits for months up to but not including current month
        const visitsExpected = visitsPerMonth * (currentMonth - 1);
        const returnIndex = visitsExpected > 0 ? Math.round((visitsCompleted / visitsExpected) * 100) : 0;
        
        // Determine status based on visit history
        let status = 'red'; // Default: no visits in last two months
        
        if (visitsLastMonthCount > 0) {
          status = 'green'; // Visited last month
        } else if (visitsMonthBeforeLastCount > 0) {
          status = 'yellow'; // Visited month before last but not last month
        }

        return {
          ...doctor,
          returnIndex,
          status,
          visits_completed: visitsCompleted,
          visits_expected: visitsExpected,
          visits_this_month: visitsThisMonthCount,
          visit_frequency: visitFrequency
        };
      });

      const results = await Promise.all(doctorsPromises);
      
      // Filter to show only doctors who haven't met their frequency for current month
      const filteredResults = results.filter(doctor => {
        const frequencyRequired = doctor.visit_frequency || 1;
        return doctor.visits_this_month < frequencyRequired;
      });
      
      console.log('Calculated return index for doctors (filtered):', filteredResults);
      return filteredResults;
    },
    enabled: !!rawDoctors.length && !!currentDelegate?.id
  });

  // Mutation to record a visit
  const recordVisitMutation = useMutation({
    mutationFn: async (doctorId: string) => {
      if (!currentDelegate?.id) throw new Error('No delegate found');

      const today = new Date().toISOString().split('T')[0];

      // First, find the visit_objective_id for this doctor and delegate
      const { data: visitObjective, error: objectiveError } = await supabase
        .from('visit_frequencies')
        .select('id')
        .eq('doctor_id', doctorId)
        .eq('delegate_id', currentDelegate.id)
        .single();

      if (objectiveError) throw objectiveError;

      const { error } = await supabase
        .from('visits')
        .insert({
          visit_objective_id: visitObjective.id,
          visit_date: today
        });

      if (error) throw error;
    },
    onSuccess: (_, doctorId) => {
      // Add to swiped rows to show visual feedback
      setSwipedRows(prev => new Set(prev).add(doctorId));
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['doctors-with-index'] });
      queryClient.invalidateQueries({ queryKey: ['total-visits-year'] });
      
      toast.success('Visit recorded successfully!');
      
      // Remove from swiped rows after 2 seconds
      setTimeout(() => {
        setSwipedRows(prev => {
          const newSet = new Set(prev);
          newSet.delete(doctorId);
          return newSet;
        });
      }, 2000);
    },
    onError: (error) => {
      console.error('Error recording visit:', error);
      toast.error('Error recording visit');
    }
  });

  const doctors: Doctor[] = doctorsWithIndex;

  // Log data for debugging
  console.log('Current doctors with return index:', doctors);
  console.log('Is loading:', isLoading);
  console.log('Error:', error);
  console.log('Current delegate:', currentDelegate);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green':
        return 'bg-green-100 border-green-300';
      case 'yellow':
        return 'bg-yellow-100 border-yellow-300';
      case 'red':
        return 'bg-red-100 border-red-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'green':
        return 'text-green-800';
      case 'yellow':
        return 'text-yellow-800';
      case 'red':
        return 'text-red-800';
      default:
        return 'text-gray-800';
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const fullName = `${doctor.first_name} ${doctor.name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty;
    const matchesTerritory = selectedTerritory === 'all' || doctor.territories?.name === selectedTerritory;
    return matchesSearch && matchesSpecialty && matchesTerritory;
  });

  // Calculate global index with new formula: n/f where
  // n = total visits by current delegate in current year
  // f = sum of (visit_frequency * current month number) for all associated doctors
  const currentMonth = new Date().getMonth() + 1;
  const totalExpectedVisits = rawDoctors.reduce((sum, doctor) => {
    const frequency = doctor.visit_frequencies[0]?.visit_frequency || 1;
    return sum + (frequency * currentMonth);
  }, 0);
  
  const globalReturnIndex = totalExpectedVisits > 0 
    ? Math.round((totalVisitsYear / totalExpectedVisits) * 100)
    : 0;

  // Get unique specialties and territories for filters
  const specialties = [...new Set(doctors.map(d => d.specialty).filter(Boolean))];
  const territories = [...new Set(doctors.map(d => d.territories?.name).filter(Boolean))];

  // Handle swipe gesture
  const handleSwipe = (doctorId: string) => {
    recordVisitMutation.mutate(doctorId);
  };

  if (activeTab === 'report') {
    return <VisitReport onBack={() => setActiveTab('doctors')} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading return index data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading data: {error.message}</p>
          <Button onClick={onBack}>Back</Button>
        </div>
      </div>
    );
  }

  if (!currentDelegate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">No delegate found for this user.</p>
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
                <div className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Return Index</h1>
                  <p className="text-sm text-gray-600">
                    {filteredDoctors.length} doctors needing visits this month - Delegate: {currentDelegate?.first_name} {currentDelegate?.name}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    💡 Swipe a row to the right to record a visit today
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">{globalReturnIndex}%</div>
                  <div className="text-sm opacity-90">Global Index</div>
                </div>
              </div>
              <Button 
                onClick={() => setActiveTab('report')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                Detailed report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg text-gray-900">Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Doctor name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Specialty</label>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger>
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Territory</label>
                <Select value={selectedTerritory} onValueChange={setSelectedTerritory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All territories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All territories</SelectItem>
                    {territories.map(territory => (
                      <SelectItem key={territory} value={territory!}>{territory}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Information */}
        {doctors.length === 0 && currentDelegate && (
          <Card className="bg-yellow-50 border-yellow-200 mb-6">
            <CardContent className="pt-6">
              <p className="text-yellow-800">
                No doctors needing visits this month for this delegate ({currentDelegate.first_name} {currentDelegate.name}). 
                All doctors have reached their visit frequency for this month.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Doctors needing visits this month</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDoctors.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {doctors.length === 0 ? 'No doctors needing visits' : 'No doctors found'}
                </h3>
                <p className="text-gray-600">
                  {doctors.length === 0 
                    ? 'All doctors have reached their visit frequency for this month.'
                    : 'Try modifying your search criteria.'
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Specialty</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Territory</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Visit frequency</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Visits to do</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDoctors.map((doctor) => {
                      const frequencyRequired = doctor.visit_frequency || 1;
                      const visitsRemaining = frequencyRequired - doctor.visits_this_month;
                      
                      return (
                        <tr 
                          key={doctor.id} 
                          className={`border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer relative ${getStatusColor(doctor.status)} border-2 ${
                            swipedRows.has(doctor.id) ? 'bg-green-50 border-green-300' : ''
                          }`}
                          onClick={() => handleSwipe(doctor.id)}
                          style={{
                            touchAction: 'pan-y'
                          }}
                          onTouchStart={(e) => {
                            const touch = e.touches[0];
                            (e.currentTarget as any).startX = touch.clientX;
                          }}
                          onTouchEnd={(e) => {
                            const touch = e.changedTouches[0];
                            const startX = (e.currentTarget as any).startX;
                            const endX = touch.clientX;
                            const diff = endX - startX;
                            
                            if (diff > 100) { // Swipe right threshold
                              handleSwipe(doctor.id);
                            }
                          }}
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg">
                                <Stethoscope className="h-4 w-4 text-purple-600" />
                              </div>
                              <span className={`font-medium ${getStatusTextColor(doctor.status)}`}>
                                {doctor.first_name} {doctor.name}
                              </span>
                              {swipedRows.has(doctor.id) && (
                                <div className="flex items-center space-x-1 text-green-600">
                                  <Check className="h-4 w-4" />
                                  <span className="text-sm font-medium">Visit recorded</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className={`py-4 px-4 ${getStatusTextColor(doctor.status)}`}>
                            {doctor.specialty || 'Not specified'}
                          </td>
                          <td className="py-4 px-4">
                            <div className={`flex items-center space-x-2 ${getStatusTextColor(doctor.status)}`}>
                              <MapPin className="h-4 w-4" />
                              <span>{doctor.territories?.name || 'Not assigned'}</span>
                            </div>
                          </td>
                          <td className={`py-4 px-4 ${getStatusTextColor(doctor.status)}`}>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                              {frequencyRequired} / month
                            </span>
                          </td>
                          <td className={`py-4 px-4 ${getStatusTextColor(doctor.status)}`}>
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm font-medium">
                              {visitsRemaining}
                            </span>
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

      </div>
    </div>
  );
};

export default ReturnIndex;
