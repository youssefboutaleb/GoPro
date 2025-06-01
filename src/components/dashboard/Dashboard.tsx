
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Users, 
  UserCheck,
  ShoppingCart,
  BarChart3,
  Activity
} from 'lucide-react';

interface DashboardProps {
  onBack: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onBack }) => {
  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Indice de Retour</CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">78%</div>
            <p className="text-sm text-green-600 mt-1">
              +5% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Médecins Actifs</CardTitle>
            <UserCheck className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">24</div>
            <p className="text-sm text-gray-600 mt-1">
              Sur 30 médecins total
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Visites ce mois</CardTitle>
            <Activity className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">127</div>
            <p className="text-sm text-blue-600 mt-1">
              +12 cette semaine
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Produits Vendus</CardTitle>
            <ShoppingCart className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">1,234</div>
            <p className="text-sm text-green-600 mt-1">
              Objectif: 1,500
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Résumé des Performances</CardTitle>
            </div>
            <CardDescription>Vue d'ensemble rapide des indicateurs clés</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Taux de conversion</span>
              <span className="text-sm font-medium">67%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Médecins excellent</span>
              <span className="text-sm font-medium text-green-600">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Médecins à améliorer</span>
              <span className="text-sm font-medium text-red-600">6</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Nouveaux recrutements</span>
              <span className="text-sm font-medium text-blue-600">3 ce mois</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Actions Rapides</CardTitle>
            </div>
            <CardDescription>Accès direct aux fonctionnalités principales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
              <div className="text-sm font-medium text-blue-900">Planifier une visite</div>
              <div className="text-xs text-blue-600">Ajouter une nouvelle visite médecin</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
              <div className="text-sm font-medium text-green-900">Voir les rapports</div>
              <div className="text-xs text-green-600">Consulter les performances détaillées</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors">
              <div className="text-sm font-medium text-purple-900">Gérer les médecins</div>
              <div className="text-xs text-purple-600">Administration des contacts</div>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
