
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Package, TrendingUp, Target, Calendar, MapPin, RotateCcw, UserPlus } from 'lucide-react';
import MedecinsList from '@/components/MedecinsList';
import ProductsList from '@/components/ProductsList';
import IndiceRetour from '@/components/IndiceRetour';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const stats = [
    {
      title: "Médecins Ciblés",
      value: "342",
      change: "+12%",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Produits Actifs",
      value: "8",
      change: "+2",
      icon: Package,
      color: "text-green-600"
    },
    {
      title: "Objectif Mensuel",
      value: "85%",
      change: "+5%",
      icon: Target,
      color: "text-purple-600"
    },
    {
      title: "Performance",
      value: "78%",
      change: "+8%",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  if (activeTab === 'medecins') {
    return <MedecinsList onBack={() => setActiveTab('dashboard')} />;
  }

  if (activeTab === 'produits') {
    return <ProductsList onBack={() => setActiveTab('dashboard')} />;
  }

  if (activeTab === 'indice-retour') {
    return <IndiceRetour onBack={() => setActiveTab('dashboard')} />;
  }

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
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Calendar className="h-3 w-3 mr-1" />
                Semaine 47
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <MapPin className="h-3 w-3 mr-1" />
                Région Nord
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-green-600 font-medium">
                  {stat.change} vs mois dernier
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105"
                onClick={() => setActiveTab('medecins')}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Users className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white">Médecins Ciblés</CardTitle>
                  <CardDescription className="text-blue-100">
                    Gestion et suivi des médecins par spécialité
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Cardiologues</span>
                  <Badge variant="secondary" className="bg-white/20 text-white">89</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Généralistes</span>
                  <Badge variant="secondary" className="bg-white/20 text-white">156</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Diabétologues</span>
                  <Badge variant="secondary" className="bg-white/20 text-white">97</Badge>
                </div>
              </div>
              <Button variant="secondary" className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white border-white/30">
                Voir la liste complète
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105"
                onClick={() => setActiveTab('produits')}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Package className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white">Produits & KPIs</CardTitle>
                  <CardDescription className="text-green-100">
                    Performance des ventes par produit
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-green-100">Nebilet</span>
                  <Badge variant="secondary" className="bg-white/20 text-white">85%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-100">Zantipride</span>
                  <Badge variant="secondary" className="bg-white/20 text-white">92%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-100">Zantipress</span>
                  <Badge variant="secondary" className="bg-white/20 text-white">78%</Badge>
                </div>
              </div>
              <Button variant="secondary" className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white border-white/30">
                Analyser les performances
              </Button>
            </CardContent>
          </Card>

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
                  <Badge variant="secondary" className="bg-white/20 text-white">342</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-100">Par spécialité</span>
                  <Badge variant="secondary" className="bg-white/20 text-white">3</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-100">Par brick</span>
                  <Badge variant="secondary" className="bg-white/20 text-white">4</Badge>
                </div>
              </div>
              <Button variant="secondary" className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white border-white/30">
                Consulter l'indice
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-12 flex items-center justify-center space-x-2 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                  <Calendar className="h-4 w-4" />
                  <span>Rapport Hebdomadaire</span>
                </Button>
                <Button variant="outline" className="h-12 flex items-center justify-center space-x-2 hover:bg-green-50 hover:border-green-300 transition-colors">
                  <TrendingUp className="h-4 w-4" />
                  <span>Analyse Tendances</span>
                </Button>
                <Button variant="outline" className="h-12 flex items-center justify-center space-x-2 hover:bg-purple-50 hover:border-purple-300 transition-colors">
                  <Target className="h-4 w-4" />
                  <span>Objectifs Mensuel</span>
                </Button>
                <Button variant="outline" className="h-12 flex items-center justify-center space-x-2 hover:bg-orange-50 hover:border-orange-300 transition-colors">
                  <UserPlus className="h-4 w-4" />
                  <span>Rythme Recrutement</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
