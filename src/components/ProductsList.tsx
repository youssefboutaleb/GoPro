
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Package, TrendingUp, Target, Calendar, MapPin, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface ProductsListProps {
  onBack: () => void;
}

interface ProductData {
  id: string;
  nom: string;
  classe_therapeutique: string | null;
  totalVentes: number;
  totalObjectifs: number;
  pourcentageObjectif: number;
  nombreBricks: number;
}

const ProductsList = ({ onBack }: ProductsListProps) => {
  const [selectedBrick, setSelectedBrick] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('11');

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products-sales-data', selectedMonth],
    queryFn: async () => {
      console.log('Fetching products and sales data from Supabase...');
      
      // Get current date for filtering (using November 2024 as example)
      const currentDate = `2024-${selectedMonth.padStart(2, '0')}-01`;
      
      // Fetch products
      const { data: produits, error: produitsError } = await supabase
        .from('produits')
        .select('*')
        .eq('actif', true);

      if (produitsError) {
        console.error('Error fetching products:', produitsError);
        throw produitsError;
      }

      // For each product, get sales and objectives data
      const productsWithData = await Promise.all(
        produits.map(async (produit) => {
          // Get sales data for this product
          const { data: ventes, error: ventesError } = await supabase
            .from('ventes_produits')
            .select('montant, brick_id')
            .eq('produit_id', produit.id)
            .gte('periode', currentDate)
            .lt('periode', `2024-${(parseInt(selectedMonth) + 1).toString().padStart(2, '0')}-01`);

          if (ventesError) {
            console.error('Error fetching sales:', ventesError);
          }

          // Get objectives data for this product
          const { data: objectifs, error: objectifsError } = await supabase
            .from('objectifs_produits')
            .select('objectif_mensuel, objectif_annuel')
            .eq('produit_id', produit.id)
            .gte('periode', currentDate)
            .lt('periode', `2024-${(parseInt(selectedMonth) + 1).toString().padStart(2, '0')}-01`);

          if (objectifsError) {
            console.error('Error fetching objectives:', objectifsError);
          }

          const totalVentes = ventes?.reduce((sum, vente) => sum + Number(vente.montant || 0), 0) || 0;
          const totalObjectifs = objectifs?.reduce((sum, obj) => sum + Number(obj.objectif_mensuel || 0), 0) || 1;
          const uniqueBricks = new Set(ventes?.map(v => v.brick_id).filter(Boolean)).size;

          return {
            id: produit.id,
            nom: produit.nom,
            classe_therapeutique: produit.classe_therapeutique,
            totalVentes,
            totalObjectifs,
            pourcentageObjectif: totalObjectifs > 0 ? Math.round((totalVentes / totalObjectifs) * 100) : 0,
            nombreBricks: uniqueBricks
          };
        })
      );

      console.log('Products with sales data:', productsWithData);
      return productsWithData as ProductData[];
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTendanceColor = (pourcentage: number) => {
    if (pourcentage >= 90) return 'text-green-600';
    if (pourcentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceColor = (pourcentage: number) => {
    if (pourcentage >= 90) return 'text-green-600';
    if (pourcentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const totalVentes = products.reduce((sum, produit) => sum + produit.totalVentes, 0);
  const totalObjectifs = products.reduce((sum, produit) => sum + produit.totalObjectifs, 0);
  const performanceGlobale = totalObjectifs > 0 ? Math.round((totalVentes / totalObjectifs) * 100) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données produits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur lors du chargement des données produits</p>
          <Button onClick={onBack}>Retour</Button>
        </div>
      </div>
    );
  }

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
                {selectedMonth === '11' ? 'Novembre' : 'Décembre'} 2024
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
              <p className="text-xs text-green-600 font-medium">Données réelles Supabase</p>
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
          {products.map((produit, index) => {
            const couleurs = [
              'from-blue-500 to-blue-600',
              'from-indigo-500 to-indigo-600', 
              'from-green-500 to-green-600',
              'from-purple-500 to-purple-600',
              'from-red-500 to-red-600',
              'from-orange-500 to-orange-600'
            ];
            const couleur = couleurs[index % couleurs.length];
            
            return (
              <Card key={produit.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 bg-gradient-to-r ${couleur} rounded-lg`}>
                        <Package className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900">{produit.nom}</CardTitle>
                        <p className="text-sm text-gray-600">{produit.classe_therapeutique || 'Classe non renseignée'}</p>
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
                      <span className="font-semibold text-gray-900">{formatCurrency(produit.totalVentes)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Objectif mensuel</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(produit.totalObjectifs)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Reste à réaliser</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(Math.max(0, produit.totalObjectifs - produit.totalVentes))}
                      </span>
                    </div>
                  </div>

                  {/* KPIs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-600">Bricks</span>
                      </div>
                      <div className="text-lg font-bold text-blue-700">
                        {produit.nombreBricks}
                      </div>
                    </div>

                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <Activity className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-medium text-green-600">Statut</span>
                      </div>
                      <div className="text-sm font-bold text-green-700">
                        {produit.totalVentes > 0 ? 'Actif' : 'Inactif'}
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
            );
          })}
        </div>

        {products.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
              <p className="text-gray-600">Aucune donnée disponible pour la période sélectionnée.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProductsList;
