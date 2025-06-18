
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, MapPin, Stethoscope, Package, BarChart3, Calendar, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BricksManager from '@/components/admin/BricksManager';
import DoctorsManager from '@/components/admin/DoctorsManager';
import ProductsManager from '@/components/admin/ProductsManager';
import VisitsManager from '@/components/admin/VisitsManager';
import ReportsManager from '@/components/admin/ReportsManager';
import UsersManager from '@/components/admin/UsersManager';
import EquipesManager from '@/components/admin/EquipesManager';

const Admin = () => {
  const { profile, signOut, isAdmin, loading, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Accès refusé</CardTitle>
            <CardDescription>
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const components = {
    users: <UsersManager onBack={() => setActiveTab('overview')} />,
    bricks: <BricksManager onBack={() => setActiveTab('overview')} />,
    doctors: <DoctorsManager onBack={() => setActiveTab('overview')} />,
    products: <ProductsManager onBack={() => setActiveTab('overview')} />,
    visits: <VisitsManager onBack={() => setActiveTab('overview')} />,
    reports: <ReportsManager onBack={() => setActiveTab('overview')} />,
    equipes: <EquipesManager onBack={() => setActiveTab('overview')} />,
  };
  
  if (activeTab !== 'overview') {
    return components[activeTab as keyof typeof components] || null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Retour</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Administration GOPRO</h1>
                <p className="text-sm text-gray-600">
                  Connecté en tant que {profile?.first_name} {profile?.last_name} ({profile?.role})
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Users Management */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveTab('users')}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Gestion des Utilisateurs</CardTitle>
                  <CardDescription>Gérer les comptes et les rôles</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Bricks Management */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveTab('bricks')}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Gestion des Bricks</CardTitle>
                  <CardDescription>Gérer les zones géographiques</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Doctors Management */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveTab('doctors')}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Stethoscope className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Gestion des Médecins</CardTitle>
                  <CardDescription>Gérer la base de données médicale</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Products Management */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveTab('products')}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Package className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Gestion des Produits</CardTitle>
                  <CardDescription>Gérer le catalogue produits</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Visits Management */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveTab('visits')}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-teal-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Gestion des Visites</CardTitle>
                  <CardDescription>Planifier et suivre les visites</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Equipes Management */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveTab('equipes')}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Gestion des Équipes</CardTitle>
                  <CardDescription>Gérer les équipes et assigner les délégués</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Reports Management */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveTab('reports')}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-red-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Rapports</CardTitle>
                  <CardDescription>Générer et consulter les rapports</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
