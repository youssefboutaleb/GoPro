
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LanguageSelector from '@/components/LanguageSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, TrendingUp, Calendar, BarChart3, Users, Settings } from 'lucide-react';
import VisitReport from '@/components/VisitReport';
import ReturnIndexAnalysis from '@/components/ReturnIndexAnalysis';

const Index = () => {
  const { user, signOut, profile, isAdmin } = useAuth();
  const [activeView, setActiveView] = useState<'home' | 'visit-report' | 'return-index'>('home');

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Connexion requise</CardTitle>
            <CardDescription>
              Veuillez vous connecter pour accéder à l'application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/auth'} className="w-full">
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activeView === 'visit-report') {
    return <VisitReport onBack={() => setActiveView('home')} />;
  }

  if (activeView === 'return-index') {
    return <ReturnIndexAnalysis onBack={() => setActiveView('home')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">GOPRO Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Bienvenue, {user.email} ({profile?.user_type})
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              {isAdmin && (
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/admin'}
                  className="flex items-center space-x-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                </Button>
              )}
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Visit Report Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow transform hover:scale-105"
                onClick={() => setActiveView('visit-report')}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Rapport de Visites</CardTitle>
                  <CardDescription>Analyser vos visites mensuelles</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Consultez le détail de vos visites par médecin et par mois
              </p>
            </CardContent>
          </Card>

          {/* Return Index Analysis Card - Only for Delegates */}
          {profile?.user_type === 'Delegate' && (
            <Card className="cursor-pointer hover:shadow-lg transition-shadow transform hover:scale-105"
                  onClick={() => setActiveView('return-index')}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Indice de Retour</CardTitle>
                    <CardDescription>Analyse de performance des visites</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Consultez votre indice de retour et performance de visite
                </p>
              </CardContent>
            </Card>
          )}

          {/* Statistics Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Statistiques</CardTitle>
                  <CardDescription>Vue d'ensemble de vos données</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Consultez vos statistiques de performance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions for different user types */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {profile?.user_type === 'Delegate' && (
              <>
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Planifier une visite</span>
                  </div>
                </Card>
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Mes médecins</span>
                  </div>
                </Card>
              </>
            )}
            {(profile?.user_type === 'Supervisor' || profile?.user_type === 'Admin') && (
              <>
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Rapports équipe</span>
                  </div>
                </Card>
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-orange-600" />
                    <span className="font-medium">Gérer délégués</span>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
