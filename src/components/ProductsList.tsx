
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Package, TrendingUp, Target, Calendar, MapPin, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProductsListProps {
  onBack: () => void;
}

const ProductsList = ({ onBack }: ProductsListProps) => {
  const [selectedBrick, setSelectedBrick] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('11');

  const produits = [
    {
      id: 1,
      nom: "Nebilet",
      categorie: "Antihypertenseur",
      ventesRealisees: 850000,
      objectifMensuel: 1000000,
      pourcentageObjectif: 85,
      rythmeRecrutement: "142 nouveaux patients/semaine",
      tendance: "+8%",
      couleur: "from-blue-500 to-blue-600"
    },
    {
      id: 2,
      nom: "Nebilet Plus",
      categorie: "Antihypertenseur Combiné",
      ventesRealisees: 620000,
      objectifMensuel: 750000,
      pourcentageObjectif: 83,
      rythmeRecrutement: "98 nouveaux patients/semaine",
      tendance: "+12%",
      couleur: "from-indigo-500 to-indigo-600"
    },
    {
      id: 3,
      nom: "Zantipride",
      categorie: "Antidiabétique",
      ventesRealisees: 920000,
      objectifMensuel: 1000000,
      pourcentageObjectif: 92,
      rythmeRecrutement: "67 nouveaux patients/semaine",
      tendance: "+15%",
      couleur: "from-green-500 to-green-600"
    },
    {
      id: 4,
      nom: "Zantipress",
      categorie: "Antihypertenseur",
      ventesRealisees: 580000,
      objectifMensuel: 750000,
      pourcentageObjectif: 77,
      rythmeRecrutement: "156 nouveaux patients/semaine",
      tendance: "+5%",
      couleur: "from-purple-500 to-purple-600"
    },
    {
      id: 5,
      nom: "Cardiomax",
      categorie: "Cardioprotecteur",
      ventesRealisees: 450000,
      objectifMensuel: 500000,
      pourcentageObjectif: 90,
      rythmeRecrutement: "78 nouveaux patients/semaine",
      tendance: "+18%",
      couleur: "from-red-500 to-red-600"
    },
    {
      id: 6,
      nom: "Diabetol",
      categorie: "Antidiabétique",
      ventesRealisees: 380000,
      objectifMensuel: 450000,
      pourcentageObjectif: 84,
      rythmeRecrutement: "89 nouveaux patients/semaine",
      tendance: "+7%",
      couleur: "from-orange-500 to-orange-600"
    }
  ];

  const getTendanceColor = (tendance: string) => {
    const value = parseInt(tendance.replace('%', '').replace('+', ''));
    if (value >= 10) return 'text-green-600';
    if (value >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceColor = (pourcentage: number) => {
    if (pourcentage >= 90) return 'text-green-600';
    if (pourcentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const totalVentes = produits.reduce((sum, produit) => sum + produit.ventesRealisees, 0);
  const totalObjectifs = produits.reduce((sum, produit) => sum + produit.objectifMensuel, 0);
  const performanceGlobale = Math.round((totalVentes / totalObjectifs) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-green-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack} className="p-2 hover:bg-green-50">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-green-600 to-green-700 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Produits & KPIs</h1>
                  <p className="text-sm text-gray-600">Performance globale: {performanceGlobale}%</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Calendar className="h-3 w-3 mr-1" />
                Novembre 2024
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Ventes Totales</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalVentes)}</div>
              <p className="text-xs text-green-600 font-medium">+9% vs mois dernier</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Objectif Total</CardTitle>
              <Target className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalObjectifs)}</div>
              <p className="text-xs text-gray-600">Cible mensuelle</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Performance</CardTitle>
              <Activity className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getPerformanceColor(performanceGlobale)}`}>
                {performanceGlobale}%
              </div>
              <Progress value={performanceGlobale} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Brick</label>
                <Select value={selectedBrick} onValueChange={setSelectedBrick}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les bricks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les bricks</SelectItem>
                    <SelectItem value="Nord-1">Nord-1</SelectItem>
                    <SelectItem value="Nord-2">Nord-2</SelectItem>
                    <SelectItem value="Sud-1">Sud-1</SelectItem>
                    <SelectItem value="Sud-2">Sud-2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Mois</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner mois" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09">Septembre 2024</SelectItem>
                    <SelectItem value="10">Octobre 2024</SelectItem>
                    <SelectItem value="11">Novembre 2024</SelectItem>
                    <SelectItem value="12">Décembre 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {produits.map((produit) => (
            <Card key={produit.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 bg-gradient-to-r ${produit.couleur} rounded-lg`}>
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-900">{produit.nom}</CardTitle>
                      <p className="text-sm text-gray-600">{produit.categorie}</p>
                    </div>
                  </div>
                  <Badge className={`${getPerformanceColor(produit.pourcentageObjectif)} bg-opacity-10`}>
                    {produit.pourcentageObjectif}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Performance Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Progression vers l'objectif</span>
                    <span className={`text-sm font-bold ${getPerformanceColor(produit.pourcentageObjectif)}`}>
                      {produit.pourcentageObjectif}%
                    </span>
                  </div>
                  <Progress value={produit.pourcentageObjectif} className="h-3" />
                </div>

                {/* Sales Info */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ventes réalisées</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(produit.ventesRealisees)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Objectif mensuel</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(produit.objectifMensuel)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Reste à réaliser</span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(Math.max(0, produit.objectifMensuel - produit.ventesRealisees))}
                    </span>
                  </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-600">Tendance</span>
                    </div>
                    <div className={`text-lg font-bold ${getTendanceColor(produit.tendance)}`}>
                      {produit.tendance}
                    </div>
                  </div>

                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Activity className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-medium text-green-600">Recrutement</span>
                    </div>
                    <div className="text-sm font-bold text-green-700">
                      {produit.rythmeRecrutement}
                    </div>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  Voir détails analytiques
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsList;
