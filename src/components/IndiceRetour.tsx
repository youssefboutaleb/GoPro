import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Filter, User, Stethoscope, MapPin, FileText, Check } from 'lucide-react';
import RapportMedecins from './RapportMedecins';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface IndiceRetourProps {
  onBack: () => void;
}

interface Doctor {
  id: string;
  last_name: string;
  first_name: string;
  specialty: string | null;
  brick_id: string | null;
  bricks?: {
    name: string;
    sectors?: {
      name: string;
    };
  };
  // Calculated fields for indice de retour
  indiceRetour: number;
  status: string;
  visites_effectuees: number;
  visites_attendues: number;
  visites_ce_mois: number;
  frequence_visite: number;
}

const IndiceRetour = ({ onBack }: IndiceRetourProps) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('medecins');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedWeek, setSelectedWeek] = useState('1');
  const [selectedTerritory, setSelectedTerritory] = useState('all');
  const [swipedRows, setSwipedRows] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // First, get the current user's profile information
  const { data: currentProfile } = useQuery({
    queryKey: ['current-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log('Fetching profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_type')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      console.log('Current profile:', data);
      return data;
    },
    enabled: !!user?.id
  });

  // Query to get total visits by current user in current year
  const { data: totalVisitesAnnee = 0 } = useQuery({
    queryKey: ['total-visits-year', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const currentYear = new Date().getFullYear();

      const { data: visites, error } = await supabase
        .from('visits')
        .select(`
          id,
          visit_plans!inner (
            delegate_id
          )
        `)
        .eq('visit_plans.delegate_id', user.id)
        .gte('visit_date', `${currentYear}-01-01`)
        .lt('visit_date', `${currentYear + 1}-01-01`);

      if (error) {
        console.error('Error fetching total visits for year:', error);
        return 0;
      }

      return visites?.length || 0;
    },
    enabled: !!user?.id
  });

  const { data: rawDoctors = [], isLoading, error } = useQuery({
    queryKey: ['doctors-indice-retour', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('No user found, returning empty array');
        return [];
      }

      console.log('Fetching doctors for user:', user.id);
      
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          id,
          last_name,
          first_name,
          specialty,
          brick_id,
          bricks:brick_id (
            name,
            sectors:sector_id (
              name
            )
          ),
          visit_plans!inner (
            visit_frequency,
            delegate_id
          )
        `)
        .eq('visit_plans.delegate_id', user.id)
        .order('last_name', { ascending: true });

      if (error) {
        console.error('Error fetching doctors for user:', error);
        throw error;
      }

      console.log('Fetched doctors for user:', data);
      console.log('Number of doctors fetched:', data?.length || 0);
      return data;
    },
    enabled: !!user?.id
  });

  // Transform raw data to include calculated indice retour values
  const { data: doctorsWithIndice = [] } = useQuery({
    queryKey: ['doctors-with-indice', rawDoctors, user?.id],
    queryFn: async () => {
      if (!rawDoctors.length || !user?.id) return [];

      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      
      // Calculate last month and month before last month
      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      const monthBeforeLastMonth = lastMonth === 1 ? 12 : lastMonth - 1;
      const monthBeforeLastYear = lastMonth === 1 ? lastMonthYear - 1 : lastMonthYear;

      const doctorsPromises = rawDoctors.map(async (doctor: any) => {
        // Get visits count for this year EXCLUDING current month
        const { data: visites, error: visitesError } = await supabase
          .from('visits')
          .select(`
            id,
            visit_plans!inner (
              doctor_id,
              delegate_id
            )
          `)
          .eq('visit_plans.doctor_id', doctor.id)
          .eq('visit_plans.delegate_id', user.id)
          .gte('visit_date', `${currentYear}-01-01`)
          .lt('visit_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`);

        if (visitesError) {
          console.error('Error fetching visits for doctor:', doctor.id, visitesError);
        }

        // Get visits count for current month only
        const { data: visitesCeMois, error: visitesCeMoisError } = await supabase
          .from('visits')
          .select(`
            id,
            visit_plans!inner (
              doctor_id,
              delegate_id
            )
          `)
          .eq('visit_plans.doctor_id', doctor.id)
          .eq('visit_plans.delegate_id', user.id)
          .gte('visit_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
          .lt('visit_date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);

        if (visitesCeMoisError) {
          console.error('Error fetching current month visits for doctor:', doctor.id, visitesCeMoisError);
        }

        // Get visits for last month
        const { data: visitesLastMonth, error: visitesLastMonthError } = await supabase
          .from('visits')
          .select(`
            id,
            visit_plans!inner (
              doctor_id,
              delegate_id
            )
          `)
          .eq('visit_plans.doctor_id', doctor.id)
          .eq('visit_plans.delegate_id', user.id)
          .gte('visit_date', `${lastMonthYear}-${lastMonth.toString().padStart(2, '0')}-01`)
          .lt('visit_date', `${lastMonthYear}-${(lastMonth + 1).toString().padStart(2, '0')}-01`);

        if (visitesLastMonthError) {
          console.error('Error fetching last month visits for doctor:', doctor.id, visitesLastMonthError);
        }

        // Get visits for month before last month
        const { data: visitesMonthBeforeLast, error: visitesMonthBeforeLastError } = await supabase
          .from('visits')
          .select(`
            id,
            visit_plans!inner (
              doctor_id,
              delegate_id
            )
          `)
          .eq('visit_plans.doctor_id', doctor.id)
          .eq('visit_plans.delegate_id', user.id)
          .gte('visit_date', `${monthBeforeLastYear}-${monthBeforeLastMonth.toString().padStart(2, '0')}-01`)
          .lt('visit_date', `${monthBeforeLastYear}-${(monthBeforeLastMonth + 1).toString().padStart(2, '0')}-01`);

        if (visitesMonthBeforeLastError) {
          console.error('Error fetching month before last visits for doctor:', doctor.id, visitesMonthBeforeLastError);
        }

        const visitesEffectuees = visites?.length || 0;
        const visitesCeMoisCount = visitesCeMois?.length || 0;
        const visitesLastMonthCount = visitesLastMonth?.length || 0;
        const visitesMonthBeforeLastCount = visitesMonthBeforeLast?.length || 0;

        // Calculate expected visits based on frequency (excluding current month)
        const frequenceVisite = parseInt(doctor.visit_plans[0]?.visit_frequency) || 1;
        const visitesParMois = frequenceVisite;

        // Calculate expected visits for months up to but not including current month
        const visitesAttendues = visitesParMois * (currentMonth - 1);
        const indiceRetour = visitesAttendues > 0 ? Math.round((visitesEffectuees / visitesAttendues) * 100) : 0;
        
        // Determine status based on visit history
        let status = 'red'; // Default: no visits in last two months
        
        if (visitesLastMonthCount > 0) {
          status = 'green'; // Visited last month
        } else if (visitesMonthBeforeLastCount > 0) {
          status = 'yellow'; // Visited month before last but not last month
        }

        return {
          ...doctor,
          indiceRetour,
          status,
          visites_effectuees: visitesEffectuees,
          visites_attendues: visitesAttendues,
          visites_ce_mois: visitesCeMoisCount,
          frequence_visite: frequenceVisite
        };
      });

      const results = await Promise.all(doctorsPromises);
      
      // Filter to show only doctors who haven't met their frequency for current month
      const filteredResults = results.filter(doctor => {
        const frequenceRequise = doctor.frequence_visite || 1;
        return doctor.visites_ce_mois < frequenceRequise;
      });
      
      console.log('Calculated indice retour for doctors (filtered):', filteredResults);
      return filteredResults;
    },
    enabled: !!rawDoctors.length && !!user?.id
  });

  // Mutation to record a visit
  const recordVisitMutation = useMutation({
    mutationFn: async (doctorId: string) => {
      if (!user?.id) throw new Error('No user found');

      const today = new Date().toISOString().split('T')[0];

      // First, find the visit_plan_id for this doctor and user
      const { data: visitPlan, error: planError } = await supabase
        .from('visit_plans')
        .select('id')
        .eq('doctor_id', doctorId)
        .eq('delegate_id', user.id)
        .single();

      if (planError) throw planError;

      const { error } = await supabase
        .from('visits')
        .insert({
          visit_plan_id: visitPlan.id,
          visit_date: today
        });

      if (error) throw error;
    },
    onSuccess: (_, doctorId) => {
      // Add to swiped rows to show visual feedback
      setSwipedRows(prev => new Set(prev).add(doctorId));
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['doctors-with-indice'] });
      queryClient.invalidateQueries({ queryKey: ['total-visits-year'] });
      
      toast.success('Visite enregistrée avec succès!');
      
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
      toast.error('Erreur lors de l\'enregistrement de la visite');
    }
  });

  const doctors: Doctor[] = doctorsWithIndice;

  // Log data for debugging
  console.log('Current doctors with indice retour:', doctors);
  console.log('Is loading:', isLoading);
  console.log('Error:', error);
  console.log('Current profile:', currentProfile);

  // Helper functions for status colors
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
    const fullName = `${doctor.first_name} ${doctor.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty;
    const matchesTerritory = selectedTerritory === 'all' || doctor.bricks?.name === selectedTerritory;
    return matchesSearch && matchesSpecialty && matchesTerritory;
  });

  // Calculate global index with new formula: n/f where
  // n = total visits by current user in current year
  // f = sum of (visit_frequency * current month number) for all associated doctors
  const currentMonth = new Date().getMonth() + 1;
  const totalExpectedVisits = rawDoctors.reduce((sum, doctor) => {
    const frequence = parseInt(doctor.visit_plans[0]?.visit_frequency) || 1;
    return sum + (frequence * currentMonth);
  }, 0);
  
  const indiceRetourGlobal = totalExpectedVisits > 0 
    ? Math.round((totalVisitesAnnee / totalExpectedVisits) * 100)
    : 0;

  // Get unique specialties and territories for filters
  const specialties = [...new Set(doctors.map(d => d.specialty).filter(Boolean))];
  const territories = [...new Set(doctors.map(d => d.bricks?.name).filter(Boolean))];

  // Handle swipe gesture
  const handleSwipe = (doctorId: string) => {
    recordVisitMutation.mutate(doctorId);
  };

  if (activeTab === 'rapport') {
    return <RapportMedecins onBack={() => setActiveTab('medecins')} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('returnIndex.loadingReturnData')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{t('common.error')}: {error.message}</p>
          <Button onClick={onBack}>{t('common.back')}</Button>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{t('returnIndex.noDelegateFound')}</p>
          <Button onClick={onBack}>{t('common.back')}</Button>
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
                  <h1 className="text-2xl font-bold text-gray-900">{t('returnIndex.title')}</h1>
                  <p className="text-sm text-gray-600">
                    {filteredDoctors.length} {t('returnIndex.doctorsNeedingVisits')}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {t('returnIndex.swipeHint')}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">{indiceRetourGlobal}%</div>
                  <div className="text-sm opacity-90">{t('returnIndex.globalIndex')}</div>
                </div>
              </div>
              <Button 
                onClick={() => setActiveTab('rapport')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                {t('returnIndex.detailedReport')}
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
              <CardTitle className="text-lg text-gray-900">{t('common.filters')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t('common.search')}</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t('doctors.doctorName')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t('common.specialty')}</label>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.allSpecialties')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.allSpecialties')}</SelectItem>
                    {specialties.map(specialty => (
                      <SelectItem key={specialty} value={specialty!}>{specialty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t('common.territory')}</label>
                <Select value={selectedTerritory} onValueChange={setSelectedTerritory}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.allTerritories')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.allTerritories')}</SelectItem>
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
        {doctors.length === 0 && currentProfile && (
          <Card className="bg-yellow-50 border-yellow-200 mb-6">
            <CardContent className="pt-6">
              <p className="text-yellow-800">
                {t('returnIndex.allDoctorsReachedFrequency')}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">{t('returnIndex.doctorsNeedingVisitsThisMonth')}</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDoctors.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {doctors.length === 0 ? t('returnIndex.noDoctorsNeedingVisits') : t('doctors.noDoctorsFound')}
                </h3>
                <p className="text-gray-600">
                  {doctors.length === 0 
                    ? t('returnIndex.allDoctorsReachedFrequency')
                    : t('common.tryModifyingCriteria')
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('returnIndex.firstName')}</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('returnIndex.lastName')}</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('common.specialty')}</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('common.territory')}</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('returnIndex.visitFrequency')}</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('returnIndex.visitsToMake')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDoctors.map((doctor) => {
                      const frequenceRequise = doctor.frequence_visite || 1;
                      const visitesRestantes = frequenceRequise - doctor.visites_ce_mois;
                      
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
                                {doctor.first_name}
                              </span>
                              {swipedRows.has(doctor.id) && (
                                <div className="flex items-center space-x-1 text-green-600">
                                  <Check className="h-4 w-4" />
                                  <span className="text-sm font-medium">{t('returnIndex.visitRecorded')}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className={`py-4 px-4 font-medium ${getStatusTextColor(doctor.status)}`}>
                            {doctor.last_name}
                          </td>
                          <td className={`py-4 px-4 ${getStatusTextColor(doctor.status)}`}>
                            {doctor.specialty || t('doctors.specialtyNotSpecified')}
                          </td>
                          <td className="py-4 px-4">
                            <div className={`flex items-center space-x-2 ${getStatusTextColor(doctor.status)}`}>
                              <MapPin className="h-4 w-4" />
                              <span>{doctor.bricks?.name || t('doctors.territoryNotAssigned')}</span>
                            </div>
                          </td>
                          <td className={`py-4 px-4 ${getStatusTextColor(doctor.status)}`}>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                              {frequenceRequise} {t('returnIndex.perMonth')}
                            </span>
                          </td>
                          <td className={`py-4 px-4 ${getStatusTextColor(doctor.status)}`}>
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm font-medium">
                              {visitesRestantes}
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

export default IndiceRetour;
