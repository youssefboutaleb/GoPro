
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Index = () => {
  const { user, signOut, loading, signOutLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Index page - Auth state:', { user: user?.id, loading });
    
    if (!loading && !user) {
      console.log('No user found, redirecting to auth');
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    console.log('Sign out button clicked');
    
    const { error } = await signOut();
    
    if (error) {
      console.error('Sign out failed:', error);
      toast.error('Erreur lors de la déconnexion');
    } else {
      console.log('Sign out successful, waiting for auth state change');
      // Don't show success toast immediately - wait for actual sign out
      
      // Add a backup navigation if auth state change doesn't redirect
      setTimeout(() => {
        if (!user) {
          console.log('Backup navigation to /auth');
          navigate('/auth');
        }
      }, 2000);
    }
  };

  if (loading) {
    console.log('Index page showing loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    console.log('Index page - no user, should redirect');
    return null;
  }

  console.log('Index page rendering main content for user:', user.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header with signout button */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
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
          <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Indice de Retour</CardTitle>
                  <CardDescription>Analyser l'efficacité des visites</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Cliquez pour accéder à l'analyse</p>
            </CardContent>
          </Card>

          {/* Rythme de Recrutement Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Rythme de Recrutement</CardTitle>
                  <CardDescription>Analyser le recrutement par ventes</CardDescription>
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
