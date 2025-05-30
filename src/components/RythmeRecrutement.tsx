
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Target, Filter, MapPin, Package, TrendingUp } from 'lucide-react';

interface RythmeRecrutementProps {
  onBack: () => void;
}

const RythmeRecrutement = ({ onBack }: RythmeRecrutementProps) => {
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedBrick, setSelectedBrick] = useState('all');

  const produitsData = [
    {
      id: 1,
      nom: "Nebilet",
      brick: "Nord-1",
      venteRealisee: 850,
      objectif: 1000,
      pourcentage: 85,
      rythmeNecessaire: 3
    },
    {
      id: 2,
      nom: "Nebilet Plus",
      brick: "Nord-1",
      venteRealisee: 620,
      objectif: 800,
      pourcentage: 77.5,
      rythmeNecessaire: 4
    },
    {
      id: 3,
      nom: "Zantipres",
      brick: "Nord-2",
      venteRealisee: 450,
      objectif: 700,
      pourcentage: 64.3,
      rythmeNecessaire: 6
    },
    {
      id: 4,
      nom: "Zantipride",
      brick: "Nord-2",
      venteRealisee: 380,
      objectif: 600,
      pourcentage: 63.3,
      rythmeNecessaire: 5
    },
    {
      id: 5,
      nom: "Nebilet",
      brick: "Sud-1",
      venteRealisee: 720,
      objectif: 900,
      pourcentage: 80,
      rythmeNecessaire: 4
    },
    {
      id: 6,
      nom: "Nebilet Plus",
      brick: "Sud-1",
      venteRealisee: 540,
      objectif: 750,
      pourcentage: 72,
      rythmeNecessaire: 5
    },
    {
      id: 7,
      nom: "Zantipres",
      brick: "Sud-2",
      venteRealisee: 410,
      objectif: 650,
      pourcentage: 63.1,
      rythmeNecessaire: 6
    },
    {
      id: 8,
      nom: "Zantipride",
      brick: "Sud-2",
      venteRealisee: 290,
      objectif: 500,
      pourcentage: 58,
      rythmeNecessaire: 7
    }
  ];

  const getStatusColor = (pourcentage: number) => {
    if (pourcentage >= 80) return 'bg-green-100 border-green-300';
    if (pourcentage >= 60) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
  };

  const getStatusTextColor = (pourcentage: number) => {
    if (pourcentage >= 80) return 'text-green-800';
    if (pourcentage >= 60) return 'text-yellow-800';
    return 'text-red-800';
  };

  const filteredProduits = produitsData.filter(produit => {
    const matchesProduct = selectedProduct === 'all' || produit.nom === selectedProduct;
    const matchesBrick = selectedBrick === 'all' || produit.brick === selectedBrick;
    return matchesProduct && matchesBrick;
  });

  // Calcul des totaux
  const totalVente = filteredProduits.reduce((sum, produit) => sum + produit.venteRealisee, 0);
  const totalObjectif = filteredProduits.reduce((sum, produit) => sum + produit.objectif, 0);
  const pourcentageGlobal = Math.round((totalVente / totalObjectif) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack} className="p-2 hover:bg-blue-50">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-green-600 to-green-700 rounded-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Rythme de Recrutement</h1>
                  <p className="text-sm text-gray-600">{filteredProduits.length} produits trouvés</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">{pourcentageGlobal}%</div>
                  <div className="text-sm opacity-90">Objectif Global</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg text-gray-900">Filtres</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Produit</label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les produits" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les produits</SelectItem>
                    <SelectItem value="Nebilet">Nebilet</SelectItem>
                    <SelectItem value="Nebilet Plus">Nebilet Plus</SelectItem>
                    <SelectItem value="Zantipres">Zantipres</SelectItem>
                    <SelectItem value="Zantipride">Zantipride</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Suivi des Ventes par Produit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Produit</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Brick</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Vente Réalisée (unités)</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Objectif (unités)</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">% Objectif</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Nouvelles Prescriptions/mois</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProduits.map((produit) => (
                    <tr key={produit.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${getStatusColor(produit.pourcentage)} border-2`}>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-r from-green-100 to-green-200 rounded-lg">
                            <Package className="h-4 w-4 text-green-600" />
                          </div>
                          <span className={`font-medium ${getStatusTextColor(produit.pourcentage)}`}>{produit.nom}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className={`flex items-center space-x-2 ${getStatusTextColor(produit.pourcentage)}`}>
                          <MapPin className="h-4 w-4" />
                          <span>{produit.brick}</span>
                        </div>
                      </td>
                      <td className={`py-4 px-4 text-right font-medium ${getStatusTextColor(produit.pourcentage)}`}>
                        {produit.venteRealisee.toLocaleString()}
                      </td>
                      <td className={`py-4 px-4 text-right font-medium ${getStatusTextColor(produit.pourcentage)}`}>
                        {produit.objectif.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <div className={`w-16 bg-gray-200 rounded-full h-2`}>
                            <div 
                              className={`h-2 rounded-full ${
                                produit.pourcentage >= 80 ? 'bg-green-600' :
                                produit.pourcentage >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                              }`}
                              style={{ width: `${Math.min(produit.pourcentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-semibold ${getStatusTextColor(produit.pourcentage)}`}>
                            {produit.pourcentage}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className={`flex items-center justify-center space-x-1 ${getStatusTextColor(produit.pourcentage)}`}>
                          <TrendingUp className="h-4 w-4" />
                          <span className="font-medium">{produit.rythmeNecessaire}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {filteredProduits.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mt-6">
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
              <p className="text-gray-600">Essayez de modifier vos critères de recherche.</p>
            </CardContent>
          </Card>
        )}

        {/* Légende */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Légende</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-200 border-2 border-green-300 rounded"></div>
                <span className="text-sm text-green-800 font-medium">Excellent (80%+)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-200 border-2 border-yellow-300 rounded"></div>
                <span className="text-sm text-yellow-800 font-medium">Moyen (60-79%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-200 border-2 border-red-300 rounded"></div>
                <span className="text-sm text-red-800 font-medium">Faible (&lt;60%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RythmeRecrutement;
