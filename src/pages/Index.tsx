import React, { useEffect, useState } from 'react';
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

const Index = () => {
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

  // Fetch supervised delegates for Supervisor role
  const { data: supervisedDelegates = [] } = useQuery({
    queryKey: ['supervised-delegates', profile?.id],
    queryFn: async () => {
      if (!profile?.id || profile.role !== 'Supervisor') {
        console.log('❌ No profile ID or not a supervisor, skipping supervised delegates query');
        return [];
      }
      
      console.log('🔍 Fetching supervised delegates for supervisor ID:', profile.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('supervisor_id', profile.id)
        .eq('role', 'Delegate');

      if (error) {
        console.error('❌ Error fetching supervised delegates:', error);
        return [];
      }

      console.log('✅ Supervised delegates found:', data?.length || 0, data);
      return data || [];
    },
    enabled: !!profile?.id && profile?.role === 'Supervisor',
  });

  // Fetch supervised supervisors for Sales Director role
  const { data: supervisedSupervisors = [] } = useQuery({
    queryKey: ['supervised-supervisors', profile?.id],
    queryFn: async () => {
      if (!profile?.id || profile.role !== 'Sales Director') {
        console.log('❌ No profile ID or not a sales director, skipping supervised supervisors query');
        return [];
      }
      
      console.log('🔍 Fetching supervised supervisors for sales director ID:', profile.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('supervisor_id', profile.id)
        .eq('role', 'Supervisor');

      if (error) {
        console.error('❌ Error fetching supervised supervisors:', error);
        return [];
      }

      console.log('✅ Supervised supervisors found:', data?.length || 0, data);
      return data || [];
    },
    enabled: !!profile?.id && profile?.role === 'Sales Director',
  });

  // Fetch delegates under selected supervisor for Sales Director role
  const { data: delegatesUnderSupervisor = [] } = useQuery({
    queryKey: ['delegates-under-supervisor', selectedSupervisor],
    queryFn: async () => {
      if (!selectedSupervisor) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('supervisor_id', selectedSupervisor)
        .eq('role', 'Delegate');

      if (error) {
        console.error('Error fetching delegates under supervisor:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!selectedSupervisor,
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
        <div className="text-lg">Loading...</div>
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

  // Handle view routing for Supervisor role with individual delegate tabs
  if ((currentView === 'recruitment' || currentView === 'return-index') && profile?.role === 'Supervisor') {
    const Component = currentView === 'recruitment' ? RythmeRecrutement : ReturnIndexAnalysis;
    const title = currentView === 'recruitment' ? 'Rythme de Recrutement' : 'Indice de Retour';

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
          {supervisedDelegates.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Delegates Found</h3>
              <p className="text-gray-600">You don't have any supervised delegates yet.</p>
              <p className="text-sm text-gray-500 mt-2">
                Profile ID: {profile?.id} | Role: {profile?.role}
              </p>
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

  // Handle view routing for Sales Director role with tabs
  if ((currentView === 'recruitment' || currentView === 'return-index') && profile?.role === 'Sales Director') {
    const Component = currentView === 'recruitment' ? RythmeRecrutement : ReturnIndexAnalysis;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="bg-white shadow-lg border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={handleBackToDashboard} className="p-2 hover:bg-blue-50">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentView === 'recruitment' ? 'Rythme de Recrutement' : 'Indice de Retour'}
                </h1>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Tabs value={selectedSupervisor} onValueChange={setSelectedSupervisor}>
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 lg:grid-cols-4 mb-6">
              {supervisedSupervisors.map((supervisor) => (
                <TabsTrigger key={supervisor.id} value={supervisor.id}>
                  {supervisor.first_name} {supervisor.last_name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {supervisedSupervisors.map((supervisor) => (
              <TabsContent key={supervisor.id} value={supervisor.id}>
                {selectedSupervisor === supervisor.id && (
                  <Component 
                    onBack={handleBackToDashboard} 
                    delegateIds={delegatesUnderSupervisor.map(d => d.id)}
                    supervisorName={`${supervisor.first_name} ${supervisor.last_name}`}
                  />
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    );
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
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              {profile ? (
                <p className="text-lg text-gray-600 mt-1">
                  Bienvenue, {profile.first_name} {profile.last_name} ({profile.role})
                </p>
              ) : (
                <p className="text-lg text-gray-600 mt-1">
                  Bienvenue! (Profile loading...)
                </p>
              )}
            </div>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              disabled={signOutLoading}
            >
              {signOutLoading ? 'Déconnexion...' : 'Déconnexion'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content with the two cards */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <CardTitle className="text-lg">Indice de Retour</CardTitle>
                  <CardDescription>
                    {profile?.role === 'Sales Director' 
                      ? 'Analyser l\'efficacité des visites par superviseur'
                      : profile?.role === 'Supervisor'
                      ? 'Analyser l\'efficacité des visites de vos délégués'
                      : 'Analyser l\'efficacité des visites'
                    }
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Cliquez pour accéder à l'analyse</p>
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
                  <CardTitle className="text-lg">Rythme de Recrutement</CardTitle>
                  <CardDescription>
                    {profile?.role === 'Sales Director' 
                      ? 'Analyser le recrutement par superviseur'
                      : profile?.role === 'Supervisor'
                      ? 'Analyser le recrutement de vos délégués'
                      : 'Analyser le recrutement par ventes'
                    }
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Cliquez pour accéder à l'analyse</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
