
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Users, Settings, Building, UserCheck, Calendar, Package, TrendingUp } from 'lucide-react';
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
      profile: profile ? `${profile.first_name} ${profile.last_name}` : 'No profile',
      loading 
    });
    
    if (!loading && !user) {
      console.log('🔄 No user found, redirecting to auth');
      navigate('/auth');
    }
    
    if (user && profile) {
      console.log('🎉 Successfully connected! Welcome:', profile.first_name, profile.last_name);
    }
  }, [user, profile, loading, navigate]);

  // Fetch supervised delegates for Supervisor role
  const { data: supervisedDelegates = [] } = useQuery({
    queryKey: ['supervised-delegates', user?.id],
    queryFn: async () => {
      if (!user?.id || !profile || profile.role !== 'Supervisor') return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('supervisor_id', user.id)
        .eq('role', 'Delegate');

      if (error) {
        console.error('Error fetching supervised delegates:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user?.id && profile?.role === 'Supervisor',
  });

  // Fetch supervised supervisors for Sales Director role
  const { data: supervisedSupervisors = [] } = useQuery({
    queryKey: ['supervised-supervisors', user?.id],
    queryFn: async () => {
      if (!user?.id || !profile || profile.role !== 'Sales Director') return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('supervisor_id', user.id)
        .eq('role', 'Supervisor');

      if (error) {
        console.error('Error fetching supervised supervisors:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user?.id && profile?.role === 'Sales Director',
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

  // Handle view routing for Delegate and Supervisor roles
  if (currentView === 'recruitment' && (profile?.role === 'Delegate' || profile?.role === 'Supervisor')) {
    const delegateIds = profile.role === 'Delegate' 
      ? [user.id] 
      : supervisedDelegates.map(d => d.id);
    
    return <RythmeRecrutement onBack={handleBackToDashboard} delegateIds={delegateIds} />;
  }

  if (currentView === 'return-index' && (profile?.role === 'Delegate' || profile?.role === 'Supervisor')) {
    const delegateIds = profile.role === 'Delegate' 
      ? [user.id] 
      : supervisedDelegates.map(d => d.id);
    
    return <ReturnIndexAnalysis onBack={handleBackToDashboard} delegateIds={delegateIds} />;
  }

  // Handle view routing for Sales Director role with tabs
  if ((currentView === 'recruitment' || currentView === 'return-index') && profile?.role === 'Sales Director') {
    const Component = currentView === 'recruitment' ? RythmeRecrutement : ReturnIndexAnalysis;
    const delegateIds = selectedSupervisor ? delegatesUnderSupervisor.map(d => d.id) : [];

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="bg-white shadow-lg border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={handleBackToDashboard} className="p-2 hover:bg-blue-50">
                  ← Back to Dashboard
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
                    delegateIds={delegateIds}
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
                      ? 'Analyser l\'efficacité des visites de votre équipe'
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
                      ? 'Analyser le recrutement de votre équipe'
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
