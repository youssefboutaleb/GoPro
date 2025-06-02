
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, TrendingUp, Calendar, MapPin, Target, Settings, LogIn } from 'lucide-react';
import IndiceRetour from '@/components/IndiceRetour';
import RythmeRecrutement from '@/components/RythmeRecrutement';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Header for non-authenticated users */}
        <div className="bg-white shadow-lg border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">GOPRO</h1>
                  <p className="text-sm text-gray-600">Goal Performance Reporting Outil</p>
                </div>
              </div>
              <Button onClick={() => navigate('/auth')} className="flex items-center space-x-2">
                <LogIn className="h-4 w-4" />
                <span>Se connecter</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Bienvenue dans GOPRO
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Votre outil de reporting de performance et de gestion des objectifs médicaux
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <RotateCcw className="h-5 w-5 text-purple-600" />
                  <span>Indice de Retour</span>
                </CardTitle>
                <CardDescription>
                  Analysez les données des médecins par spécialité et zone géographique
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <span>Rythme de Recrutement</span>
                </CardTitle>
                <CardDescription>
                  Suivez les ventes et objectifs par produit et zone
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
          <Button onClick={() => navigate('/auth')} size="lg" className="px-8">
            Commencer maintenant
          </Button>
        </div>
      </div>
    );
  }

  if (activeTab === 'indice-retour') {
    return <IndiceRetour onBack={() => setActiveTab('dashboard')} />;
  }

  if (activeTab === 'rythme-recrutement') {
    return <RythmeRecrutement onBack={() => setActiveTab('dashboard')} />;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">GOPRO</h1>
                <p className="text-sm text-gray-600">Goal Performance Reporting Outil</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>Semaine 1</span>
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>Région Nord</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {profile?.role && (profile.role === 'admin' || profile.role === 'superuser') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/admin')}
                    className="flex items-center space-x-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Admin</span>
                  </Button>
                )}
                <div className="text-sm text-gray-600">
                  {profile?.first_name} {profile?.last_name}
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Indice de Retour Card */}
          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105"
                onClick={() => setActiveTab('indice-retour')}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <RotateCcw className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white">Indice de Retour</CardTitle>
                  <CardDescription className="text-purple-100">
                    Analyse des médecins par spécialité et brick
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-purple-100">Total médecins</span>
                  <div className="bg-white/20 text-white px-2 py-1 rounded text-sm">10</div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-100">Par spécialité</span>
                  <div className="bg-white/20 text-white px-2 py-1 rounded text-sm">3</div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-100">Par brick</span>
                  <div className="bg-white/20 text-white px-2 py-1 rounded text-sm">4</div>
                </div>
              </div>
              <Button variant="secondary" className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white border-white/30">
                Consulter l'indice
              </Button>
            </CardContent>
          </Card>

          {/* Rythme de Recrutement Card */}
          <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105"
                onClick={() => setActiveTab('rythme-recrutement')}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Target className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white">Rythme de Recrutement</CardTitle>
                  <CardDescription className="text-green-100">
                    Suivi des ventes et objectifs par produit
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-green-100">Produits</span>
                  <div className="bg-white/20 text-white px-2 py-1 rounded text-sm">4</div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-100">Objectif moyen</span>
                  <div className="bg-white/20 text-white px-2 py-1 rounded text-sm">75%</div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-100">Par brick</span>
                  <div className="bg-white/20 text-white px-2 py-1 rounded text-sm">4</div>
                </div>
              </div>
              <Button variant="secondary" className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white border-white/30">
                Consulter le rythme
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
