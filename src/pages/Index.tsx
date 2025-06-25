import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Users, Settings, Building, UserCheck, Calendar, Package, TrendingUp, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import RythmeRecrutement from '@/components/RythmeRecrutement';
import ReturnIndexAnalysis from '@/components/ReturnIndexAnalysis';
import AdminDashboard from '@/components/AdminDashboard';
import SupervisorKPIsDashboard from '@/components/SupervisorKPIsDashboard';
import SalesDirectorKPIsDashboard from '@/components/SalesDirectorKPIsDashboard';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const { user, profile, signOut, loading, signOutLoading } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>('');

  useEffect(() => {
    console.log('📊 Index page - Auth state:', { 
      user: user?.id, 
      profile: profile ? `${profile.first_name} ${profile.last_name} (ID: ${profile.id})` : 'No profile',
      loading 
    });
    
    if (!loading && !user) {
      console.log('🔄 No user found, redirecting to auth');
      navigate('/auth');
    }
    
    if (user && profile) {
      console.log('🎉 Successfully connected! Welcome:', profile.first_name, profile.last_name);
      console.log('🔍 Profile ID vs User ID:', { profileId: profile.id, userId: user.id });
    }
  }, [user, profile, loading, navigate]);

  // Determine if profile is ready for queries
  const isProfileReady = !loading && !!profile?.id && !!user;

  // Fetch supervised delegates for Supervisor role
  const { 
    data: supervisedDelegates = [], 
    isLoading: delegatesLoading, 
    error: delegatesError,
    refetch: refetchDelegates
  } = useQuery({
    queryKey: ['supervised-delegates', profile?.id, profile?.role],
    queryFn: async () => {
      console.log('🔍 Starting supervised delegates query with:', {
        profileId: profile?.id,
        role: profile?.role,
        isProfileReady
      });

      if (!profile?.id || profile.role !== 'Supervisor') {
        console.log('❌ Query conditions not met:', {
          hasProfileId: !!profile?.id,
          isSupervisor: profile?.role === 'Supervisor',
          profileRole: profile?.role
        });
        return [];
      }
      
      console.log('🔍 Fetching supervised delegates for supervisor ID:', profile.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, supervisor_id, role')
        .eq('supervisor_id', profile.id)
        .eq('role', 'Delegate');

      if (error) {
        console.error('❌ Error fetching supervised delegates:', error);
        throw error;
      }

      console.log('✅ Supervised delegates query result:', {
        count: data?.length || 0,
        data: data,
        supervisorId: profile.id
      });
      
      return data || [];
    },
    enabled: isProfileReady && profile?.role === 'Supervisor',
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch supervised supervisors for Sales Director role
  const { 
    data: supervisedSupervisors = [], 
    isLoading: supervisorsLoading,
    error: supervisorsError,
    refetch: refetchSupervisors
  } = useQuery({
    queryKey: ['supervised-supervisors', profile?.id, profile?.role],
    queryFn: async () => {
      console.log('🔍 Starting supervised supervisors query with:', {
        profileId: profile?.id,
        role: profile?.role,
        isProfileReady
      });

      if (!profile?.id || profile.role !== 'Sales Director') {
        console.log('❌ No profile ID or not a sales director, skipping supervised supervisors query');
        return [];
      }
      
      console.log('🔍 Fetching supervised supervisors for sales director ID:', profile.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, supervisor_id, role')
        .eq('supervisor_id', profile.id)
        .eq('role', 'Supervisor');

      if (error) {
        console.error('❌ Error fetching supervised supervisors:', error);
        throw error;
      }

      console.log('✅ Supervised supervisors found:', data?.length || 0, data);
      return data || [];
    },
    enabled: isProfileReady && profile?.role === 'Sales Director',
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000,
  });

  // Auto-select first supervisor when data loads for Sales Director
  useEffect(() => {
    if (profile?.role === 'Sales Director' && supervisedSupervisors.length > 0 && !selectedSupervisor) {
      console.log('🎯 Auto-selecting first supervisor:', supervisedSupervisors[0].id);
      setSelectedSupervisor(supervisedSupervisors[0].id);
    }
  }, [supervisedSupervisors, selectedSupervisor, profile?.role]);

  // Fetch delegates under selected supervisor for Sales Director role
  const { 
    data: delegatesUnderSupervisor = [], 
    isLoading: delegatesUnderSupervisorLoading,
    error: delegatesUnderSupervisorError,
    refetch: refetchDelegatesUnderSupervisor
  } = useQuery({
    queryKey: ['delegates-under-supervisor', selectedSupervisor],
    queryFn: async () => {
      if (!selectedSupervisor) return [];
      
      console.log('🔍 Fetching delegates under supervisor:', selectedSupervisor);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('supervisor_id', selectedSupervisor)
        .eq('role', 'Delegate');

      if (error) {
        console.error('Error fetching delegates under supervisor:', error);
        throw error;
      }

      console.log('✅ Delegates under supervisor found:', data?.length || 0, data);
      return data || [];
    },
    enabled: !!selectedSupervisor,
    retry: 2,
    retryDelay: 1000,
  });

  // Fetch delegates for ALL supervisors (for Sales Director double-grouped view)
  const { 
    data: allDelegatesBySupervisor = new Map(), 
    isLoading: allDelegatesLoading,
    error: allDelegatesError,
    refetch: refetchAllDelegates
  } = useQuery({
    queryKey: ['all-delegates-by-supervisor', supervisedSupervisors.map(s => s.id)],
    queryFn: async () => {
      if (supervisedSupervisors.length === 0) return new Map();
      
      console.log('🔍 Fetching all delegates for all supervisors');
      
      const delegatesBySupervidor = new Map();
      
      // Fetch delegates for each supervisor
      for (const supervisor of supervisedSupervisors) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .eq('supervisor_id', supervisor.id)
          .eq('role', 'Delegate');

        if (error) {
          console.error(`Error fetching delegates for supervisor ${supervisor.id}:`, error);
          continue;
        }

        delegatesBySupervidor.set(supervisor.id, data || []);
      }
      
      console.log('✅ All delegates by supervisor fetched:', delegatesBySupervidor);
      return delegatesBySupervidor;
    },
    enabled: supervisedSupervisors.length > 0,
    retry: 2,
    retryDelay: 1000,
  });

  const handleSignOut = async () => {
    console.log('🚪 Sign out button clicked');
    
    const { error } = await signOut();
    
    if (error) {
      console.error('❌ Sign out failed with error:', error);
      toast.error('Erreur lors de la déconnexion');
    } else {
      console.log('✅ Sign out completed successfully');
    }
  };

  const handleCardClick = (view: string) => {
    setCurrentView(view);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  if (loading) {
    console.log('⏳ Index page showing loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-lg">{t('common:loading')}</div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ Index page - no user, should redirect');
    return null;
  }

  // Handle view routing for Delegate role
  if (currentView === 'recruitment' && profile?.role === 'Delegate') {
    return <RythmeRecrutement onBack={handleBackToDashboard} delegateIds={[user.id]} />;
  }

  if (currentView === 'return-index' && profile?.role === 'Delegate') {
    return <ReturnIndexAnalysis onBack={handleBackToDashboard} delegateIds={[user.id]} />;
  }

  // Handle view routing for Supervisor KPIs
  if (currentView === 'team-kpis' && profile?.role === 'Supervisor') {
    return <SupervisorKPIsDashboard onBack={handleBackToDashboard} />;
  }

  // Handle view routing for Supervisor role with individual delegate tabs
  if ((currentView === 'recruitment' || currentView === 'return-index') && profile?.role === 'Supervisor') {
    const Component = currentView === 'recruitment' ? RythmeRecrutement : ReturnIndexAnalysis;
    const title = currentView === 'recruitment' ? t('dashboard:recruitmentRhythm') : t('dashboard:returnIndex');

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="bg-white shadow-lg border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={handleBackToDashboard} className="p-2 hover:bg-blue-50">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 py-8">
          {delegatesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t('dashboard:loadingSupervisedDelegates')}</p>
              <p className="text-sm text-gray-500 mt-2">
                Profile: {profile?.first_name} {profile?.last_name} (ID: {profile?.id})
              </p>
            </div>
          ) : delegatesError ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('dashboard:errorLoadingDelegates')}</h3>
              <p className="text-red-600 mb-4">{delegatesError.message}</p>
              <Button onClick={() => refetchDelegates()}>{t('common:retry')}</Button>
            </div>
          ) : supervisedDelegates.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('dashboard:noDelegatesFound')}</h3>
              <p className="text-gray-600">{t('dashboard:noDelegatesFoundDescription')}</p>
              <div className="text-sm text-gray-500 mt-4 space-y-1">
                <p>Profile ID: {profile?.id} | Role: {profile?.role}</p>
                <p>Query enabled: {isProfileReady && profile?.role === 'Supervisor' ? 'Yes' : 'No'}</p>
                <p>Profile ready: {isProfileReady ? 'Yes' : 'No'}</p>
              </div>
              <Button onClick={() => refetchDelegates()} className="mt-4">
                {t('common:refresh')}
              </Button>
            </div>
          ) : (
            <Tabs defaultValue={supervisedDelegates[0]?.id} className="w-full">
              <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-6">
                {supervisedDelegates.map((delegate) => (
                  <TabsTrigger key={delegate.id} value={delegate.id}>
                    {delegate.first_name} {delegate.last_name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {supervisedDelegates.map((delegate) => (
                <TabsContent key={delegate.id} value={delegate.id}>
                  <Component 
                    onBack={handleBackToDashboard} 
                    delegateIds={[delegate.id]}
                    supervisorName={`${delegate.first_name} ${delegate.last_name}`}
                  />
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </div>
    );
  }

  // Handle view routing for Sales Director role with double-grouped structure
  if ((currentView === 'recruitment' || currentView === 'return-index') && profile?.role === 'Sales Director') {
    const Component = currentView === 'recruitment' ? RythmeRecrutement : ReturnIndexAnalysis;
    const title = currentView === 'recruitment' ? t('dashboard:recruitmentRhythm') : t('dashboard:returnIndex');

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="bg-white shadow-lg border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={handleBackToDashboard} className="p-2 hover:bg-blue-50">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 py-8">
          {supervisorsLoading || allDelegatesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t('dashboard:loadingSupervisedSupervisors')}</p>
              <p className="text-sm text-gray-500 mt-2">
                Profile: {profile?.first_name} {profile?.last_name} (ID: {profile?.id})
              </p>
            </div>
          ) : supervisorsError || allDelegatesError ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('dashboard:errorLoadingData')}</h3>
              <p className="text-red-600 mb-4">{supervisorsError?.message || allDelegatesError?.message}</p>
              <Button onClick={() => {
                refetchSupervisors();
                refetchAllDelegates();
              }}>{t('common:retry')}</Button>
            </div>
          ) : supervisedSupervisors.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('dashboard:noSupervisorsFound')}</h3>
              <p className="text-gray-600">{t('dashboard:noSupervisorsFoundDescription')}</p>
              <div className="text-sm text-gray-500 mt-4 space-y-1">
                <p>Profile ID: {profile?.id} | Role: {profile?.role}</p>
                <p>Query enabled: {isProfileReady && profile?.role === 'Sales Director' ? 'Yes' : 'No'}</p>
                <p>Sales Director setup: Check if supervisors have their supervisor_id set to your profile ID</p>
              </div>
              <Button onClick={() => refetchSupervisors()} className="mt-4">
                {t('common:refresh')}
              </Button>
            </div>
          ) : (
            <Tabs value={selectedSupervisor} onValueChange={setSelectedSupervisor} className="w-full">
              <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 lg:grid-cols-4 mb-6">
                {supervisedSupervisors.map((supervisor) => {
                  const delegateCount = allDelegatesBySupervisor.get(supervisor.id)?.length || 0;
                  return (
                    <TabsTrigger key={supervisor.id} value={supervisor.id}>
                      {supervisor.first_name} {supervisor.last_name} ({delegateCount})
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              
              {supervisedSupervisors.map((supervisor) => {
                const supervisorDelegates = allDelegatesBySupervisor.get(supervisor.id) || [];
                
                return (
                  <TabsContent key={supervisor.id} value={supervisor.id}>
                    {selectedSupervisor === supervisor.id && (
                      <>
                        {supervisorDelegates.length === 0 ? (
                          <div className="text-center py-8">
                            <Users className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                            <h4 className="text-md font-medium text-gray-900 mb-2">{t('dashboard:noDelegatesFound')}</h4>
                            <p className="text-gray-600">
                              {t('dashboard:supervisor')} {supervisor.first_name} {supervisor.last_name} {t('dashboard:noDelegatesFoundSupervisor')}
                            </p>
                            <Button onClick={() => refetchAllDelegates()} size="sm" className="mt-4">
                              {t('common:refresh')}
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Supervisor context header */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                              <h3 className="text-lg font-semibold text-blue-900">
                                {supervisor.first_name} {supervisor.last_name}'s Team
                              </h3>
                              <p className="text-sm text-blue-700">
                                {supervisorDelegates.length} {supervisorDelegates.length !== 1 ? t('dashboard:delegates') : t('dashboard:delegate')}
                              </p>
                            </div>
                            
                            {/* Nested delegate tabs */}
                            <Tabs defaultValue={supervisorDelegates[0]?.id} className="w-full">
                              <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 h-auto p-2 bg-gray-100">
                                {supervisorDelegates.map((delegate) => (
                                  <TabsTrigger 
                                    key={delegate.id} 
                                    value={delegate.id}
                                    className="text-sm py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                                  >
                                    {delegate.first_name} {delegate.last_name}
                                  </TabsTrigger>
                                ))}
                              </TabsList>
                              
                              {supervisorDelegates.map((delegate) => (
                                <TabsContent key={delegate.id} value={delegate.id} className="mt-6">
                                  <Component 
                                    onBack={handleBackToDashboard} 
                                    delegateIds={[delegate.id]}
                                    supervisorName={`${delegate.first_name} ${delegate.last_name} (${supervisor.first_name} ${supervisor.last_name}'s team)`}
                                  />
                                </TabsContent>
                              ))}
                            </Tabs>
                          </div>
                        )}
                      </>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          )}
        </div>
      </div>
    );
  }

  // Handle view routing for Sales Director KPIs
  if (currentView === 'sales-director-kpis' && profile?.role === 'Sales Director') {
    return <SalesDirectorKPIsDashboard onBack={handleBackToDashboard} />;
  }

  console.log('🖥️ Index page rendering main content for user:', user.id);

  // Admin Dashboard
  if (profile?.role === 'Admin') {
    return <AdminDashboard onSignOut={handleSignOut} signOutLoading={signOutLoading} profile={profile} />;
  }

  // Default Dashboard for Delegate, Supervisor, and Sales Director
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header with welcome message and signout button */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('dashboard:dashboard')}</h1>
              {profile ? (
                <p className="text-lg text-gray-600 mt-1">
                  {t('common:welcome')}, {profile.first_name} {profile.last_name} ({profile.role})
                </p>
              ) : (
                <p className="text-lg text-gray-600 mt-1">
                  {t('common:welcome')}! (Profile loading...)
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                disabled={signOutLoading}
              >
                {signOutLoading ? t('common:signingOut') : t('common:signOut')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with the cards */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className={`grid grid-cols-1 ${(profile?.role === 'Supervisor' || profile?.role === 'Sales Director') ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
          {/* Indice de Retour Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-0"
            onClick={() => handleCardClick('return-index')}
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{t('dashboard:returnIndex')}</CardTitle>
                  <CardDescription>
                    {profile?.role === 'Sales Director' 
                      ? t('dashboard:returnIndexDescriptionSalesDirector')
                      : profile?.role === 'Supervisor'
                      ? t('dashboard:returnIndexDescriptionSupervisor')
                      : t('dashboard:returnIndexDescription')
                    }
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{t('common:clickToAccess')} l'analyse</p>
            </CardContent>
          </Card>

          {/* Rythme de Recrutement Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-0"
            onClick={() => handleCardClick('recruitment')}
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{t('dashboard:recruitmentRhythm')}</CardTitle>
                  <CardDescription>
                    {profile?.role === 'Sales Director' 
                      ? t('dashboard:recruitmentRhythmDescriptionSalesDirector')
                      : profile?.role === 'Supervisor'
                      ? t('dashboard:recruitmentRhythmDescriptionSupervisor')
                      : t('dashboard:recruitmentRhythmDescription')
                    }
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{t('common:clickToAccess')} l'analyse</p>
            </CardContent>
          </Card>

          {/* Team KPIs Card - Only for Supervisors */}
          {profile?.role === 'Supervisor' && (
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-0"
              onClick={() => handleCardClick('team-kpis')}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{t('dashboard:teamKPIs')}</CardTitle>
                    <CardDescription>
                      {t('dashboard:teamKPIsDescription')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{t('common:clickToView')} les indicateurs</p>
              </CardContent>
            </Card>
          )}

          {/* Sales Director KPIs Card - Only for Sales Directors */}
          {profile?.role === 'Sales Director' && (
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-0"
              onClick={() => handleCardClick('sales-director-kpis')}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Building className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{t('dashboard:salesDirectorKPIs')}</CardTitle>
                    <CardDescription>
                      {t('dashboard:salesDirectorKPIsDescription')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{t('common:clickToView')} les {t('dashboard:consolidatedIndicators')}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
