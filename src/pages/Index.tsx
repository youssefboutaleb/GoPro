import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Calendar,
  Settings,
  LogOut,
  UserCheck,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

// Import existing components
import IndiceRetour from '@/components/IndiceRetour';
import RythmeRecrutement from '@/components/RythmeRecrutement';
import MedecinsList from '@/components/MedecinsList';
import ProductsList from '@/components/ProductsList';
import RapportMedecins from '@/components/RapportMedecins';

// Import admin components
import BricksManager from '@/components/admin/BricksManager';
import DoctorsManager from '@/components/admin/DoctorsManager';
import ProductsManager from '@/components/admin/ProductsManager';
import VisitsManager from '@/components/admin/VisitsManager';
import UsersManager from '@/components/admin/UsersManager';
import ReportsManager from '@/components/admin/ReportsManager';

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  const mainMenuItems = [
    {
      title: "Tableau de bord",
      icon: TrendingUp,
      id: "dashboard"
    },
    {
      title: "Visites médecins",
      icon: UserCheck,
      id: "doctors-visits"
    },
    {
      title: "Ventes produits",
      icon: ShoppingCart,
      id: "products-sales"
    }
  ];

  const adminMenuItems = [
    {
      title: "Gestion des Bricks",
      icon: Target,
      id: "bricks"
    },
    {
      title: "Gestion des Médecins",
      icon: Users,
      id: "doctors"
    },
    {
      title: "Gestion des Produits",
      icon: ShoppingCart,
      id: "products"
    },
    {
      title: "Gestion des Visites",
      icon: Calendar,
      id: "visits"
    },
    {
      title: "Gestion des Utilisateurs",
      icon: Users,
      id: "users"
    },
    {
      title: "Rapports",
      icon: TrendingUp,
      id: "reports"
    }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarContent>
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">GOPRO</h1>
                  <p className="text-xs text-gray-600">Goal Performance Reporting</p>
                </div>
              </div>
            </div>

            <SidebarGroup>
              <SidebarGroupLabel>Navigation principale</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {mainMenuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(item.id)}
                        isActive={activeTab === item.id}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Administration</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminMenuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(item.id)}
                        isActive={activeTab === item.id}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="mt-auto p-4">
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1">
          <div className="sticky top-0 z-40 bg-white border-b">
            <div className="flex h-16 items-center px-4">
              <SidebarTrigger />
              <div className="ml-4">
                <h1 className="text-lg font-semibold">
                  {mainMenuItems.find(item => item.id === activeTab)?.title ||
                   adminMenuItems.find(item => item.id === activeTab)?.title ||
                   'GOPRO Dashboard'}
                </h1>
              </div>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Indice de Retour</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <IndiceRetour />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Rythme de Recrutement</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <RythmeRecrutement />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Médecins Actifs</CardTitle>
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <MedecinsList />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Produits</CardTitle>
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <ProductsList />
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Rapport des Médecins</CardTitle>
                    <CardDescription>Vue d'ensemble des performances par médecin</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RapportMedecins />
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'doctors-visits' && (
              <div>
                <Button 
                  onClick={() => navigate('/doctors-visits')} 
                  className="mb-4"
                >
                  Voir la page complète des visites
                </Button>
                {/* You can embed a preview or redirect to the full page */}
              </div>
            )}

            {activeTab === 'products-sales' && (
              <div>
                <Button 
                  onClick={() => navigate('/products-sales')} 
                  className="mb-4"
                >
                  Voir la page complète des ventes
                </Button>
                {/* You can embed a preview or redirect to the full page */}
              </div>
            )}

            {activeTab === 'bricks' && <BricksManager />}
            {activeTab === 'doctors' && <DoctorsManager />}
            {activeTab === 'products' && <ProductsManager />}
            {activeTab === 'visits' && <VisitsManager />}
            {activeTab === 'users' && <UsersManager />}
            {activeTab === 'reports' && <ReportsManager />}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
