import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Target, Filter, MapPin, Package, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface RythmeRecrutementProps {
  onBack: () => void;
}

interface VenteData {
  id: string;
  produitNom: string;
  brickNom: string;
  montant: number;
  objectifMensuel: number | null;
  objectifAnnuel: number | null;
  objectifPourcentage: number | null;
  rythmeRecrutement: number;
}

const RythmeRecrutement = ({ onBack }: RythmeRecrutementProps) => {
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedBrick, setSelectedBrick] = useState('all');

  // Get current month number (1-12)
  const currentMonth = new Date().getMonth() + 1;
  const n = 13 - currentMonth;

  // Calculate rythme de recrutement using the new formula
  const calculateRythmeRecrutement = (objectifAnnuel: number | null, montant: number): number => {
    if (!objectifAnnuel || objectifAnnuel <= 0 || n <= 0) return 0;
    
    const numerator = objectifAnnuel - montant;
    const denominator = n * (n + 1) / 2;

    if (numerator < 0) return 0;
    return denominator > 0 ? Math.ceil(numerator / denominator) : 0;
  };

  // Fetch ventes with product and brick names
  const { data: ventesData = [], isLoading: ventesLoading } = useQuery({
    queryKey: ['ventes_with_details'],
    queryFn: async () => {
      console.log('Fetching ventes with product and brick details...');
      
      const { data: ventes, error: ventesError } = await supabase
        .from('ventes_produits')
        .select(`
          *,
          produits:produit_id(nom),
          bricks:brick_id(nom)
        `);

      if (ventesError) {
        console.error('Error fetching ventes:', ventesError);
        throw ventesError;
      }

      console.log('Fetched ventes with details:', ventes);
      return ventes || [];
    }
  });

  // Fetch objectives separately
  const { data: objectivesData = [], isLoading: objectivesLoading } = useQuery({
    queryKey: ['objectifs_produits'],
    queryFn: async () => {
      console.log('Fetching objectives...');
      
      const { data: objectives, error: objectivesError } = await supabase
        .from('objectifs_produits')
        .select('*');

      if (objectivesError) {
        console.error('Error fetching objectives:', objectivesError);
        throw objectivesError;
      }

      console.log('Fetched objectives:', objectives);
      return objectives || [];
    }
  });

  const isLoading = ventesLoading || objectivesLoading;

  // Process ventes data to group by product and brick, and match with objectives
  const processedData: VenteData[] = ventesData.reduce((acc, vente) => {
    const produitNom = vente.produits?.nom || 'Produit inconnu';
    const brickNom = vente.bricks?.nom || 'Brick inconnu';
    const key = `${vente.produit_id}-${vente.brick_id}`;

    const existingEntry = acc.find(item => 
      item.produitNom === produitNom && item.brickNom === brickNom
    );

    const montant = Number(vente.montant) || 0;

    // Find matching objective based on produit_id and brick_id
    const matchingObjective = objectivesData.find(obj => 
      obj.produit_id === vente.produit_id && obj['id-brick'] === vente.brick_id
    );
    const objectifMensuel = matchingObjective?.objectif_mensuel ? Number(matchingObjective.objectif_mensuel) : null;
    const objectifAnnuel = objectifMensuel ? objectifMensuel * 12 : null;
    const objectifPourcentage = objectifAnnuel && objectifAnnuel > 0 ? (montant / objectifAnnuel) * 100 : null;

    if (existingEntry) {
      existingEntry.montant += montant;
      // Update objective if we found a better match or if it was null
      if (objectifMensuel && !existingEntry.objectifMensuel) {
        existingEntry.objectifMensuel = objectifMensuel;
        existingEntry.objectifAnnuel = objectifAnnuel;
      }
      // Recalculate percentage based on updated data
      existingEntry.objectifPourcentage = existingEntry.objectifAnnuel && existingEntry.objectifAnnuel > 0 
        ? (existingEntry.montant / existingEntry.objectifAnnuel) * 100 
        : null;
      // Recalculate rythme based on updated data using new formula
      existingEntry.rythmeRecrutement = calculateRythmeRecrutement(existingEntry.objectifAnnuel, existingEntry.montant);
    } else {
      acc.push({
        id: key,
        produitNom,
        brickNom,
        montant,
        objectifMensuel,
        objectifAnnuel,
        objectifPourcentage,
        rythmeRecrutement: calculateRythmeRecrutement(objectifAnnuel, montant)
      });
    }

    return acc;
  }, [] as VenteData[]);

  console.log('Processed ventes data:', processedData);

  // Filter data based on selections
  const filteredData = processedData.filter(item => {
    const matchesProduct = selectedProduct === 'all' || item.produitNom === selectedProduct;
    const matchesBrick = selectedBrick === 'all' || item.brickNom === selectedBrick;
    return matchesProduct && matchesBrick;
  });

  // Get unique values for filters
  const uniqueProducts = [...new Set(processedData.map(item => item.produitNom))];
  const uniqueBricks = [...new Set(processedData.map(item => item.brickNom))];

  // Calculate totals
  const totalMontant = filteredData.reduce((sum, item) => sum + item.montant, 0);

  // Calculate global objective percentage
  const globalObjectivePercentage = (() => {
    const itemsWithObjectives = filteredData.filter(item => item.objectifAnnuel && item.objectifAnnuel > 0);
    if (itemsWithObjectives.length === 0) return 0;
    
    const totalObjectifAnnuel = itemsWithObjectives.reduce((sum, item) => sum + (item.objectifAnnuel || 0), 0);
    const totalMontantWithObjectives = itemsWithObjectives.reduce((sum, item) => sum + item.montant, 0);
    
    return totalObjectifAnnuel > 0 ? (totalMontantWithObjectives / totalObjectifAnnuel) * 100 : 0;
  })();

  const getStatusColor = (objectifPourcentage: number) => {
    if (objectifPourcentage >= 80) return 'bg-green-100 border-green-300';
    if (objectifPourcentage >= 60) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
  };

  const getStatusTextColor = (objectifPourcentage: number) => {
    if (objectifPourcentage >= 80) return 'text-green-800';
    if (objectifPourcentage >= 60) return 'text-yellow-800';
    return 'text-red-800';
  };

  const getStatusBoxColor = (objectifPourcentage: number) => {
    if (objectifPourcentage >= 80) return 'text-green-800';
    if (objectifPourcentage >= 60) return 'text-yellow-800';
    return 'text-red-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données de ventes...</p>
        </div>
      </div>
    );
  }

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
                  <p className="text-sm text-gray-600">{filteredData.length} entrées trouvées sur {processedData.length} total</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">{globalObjectivePercentage.toFixed(1)}%</div>
                  <div className="text-sm opacity-90">Objectif Global</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Summary Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Résumé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{totalMontant.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Ventes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{filteredData.length}</div>
                <div className="text-sm text-gray-600">Combinaisons Produit-Brick</div>
              </div>
            </div>
          </CardContent>
        </Card>

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
                    {uniqueProducts.map(product => (
                      <SelectItem key={product} value={product}>{product}</SelectItem>
                    ))}
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
                    {uniqueBricks.map(brick => (
                      <SelectItem key={brick} value={brick}>{brick}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Rythme de Recrutement par Ventes</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredData.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune donnée trouvée</h3>
                <p className="text-gray-600">
                  {processedData.length === 0 
                    ? 'Aucune vente trouvée dans la base de données.'
                    : 'Essayez de modifier vos critères de filtrage.'
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Produit</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Brick</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Nombre de Ventes</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Objectif Mensuel</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Objectif Annuel</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Objectif en %</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Rythme de Recrutement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item) => (
                      <tr key={item.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${getStatusColor(item.objectifPourcentage)} border-2`}>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-r from-green-100 to-green-200 rounded-lg">
                              <Package className={'h-4 w-4 ${getStatusTextColor(item.objectifPourcentage)}'} />
                            </div>
                            <span className={`font-medium ${getStatusTextColor(item.objectifPourcentage)}`}>{item.produitNom}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className={`flex items-center space-x-2 ${getStatusTextColor(item.objectifPourcentage)}`}>
                            <MapPin className="h-4 w-4" />
                            <span>{item.brickNom}</span>
                          </div>
                        </td>
                        <td className={`py-4 px-4 text-right font-medium ${getStatusTextColor(item.objectifPourcentage)}`}>
                          {item.montant.toLocaleString()}
                        </td>
                        <td className={`py-4 px-4 text-right font-medium ${getStatusTextColor(item.objectifPourcentage)}`}>
                          {item.objectifMensuel ? `${item.objectifMensuel.toLocaleString()}` : 'N/A'}
                        </td>
                        <td className={`py-4 px-4 text-right font-medium ${getStatusTextColor(item.objectifPourcentage)}`}>
                          {item.objectifAnnuel ? `${item.objectifAnnuel.toLocaleString()}` : 'N/A'}
                        </td>
                        <td className={`py-4 px-4 text-right font-medium ${getStatusTextColor(item.objectifPourcentage)}`}>
                          {item.objectifPourcentage ? `${item.objectifPourcentage.toFixed(1)}%` : 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className={`flex items-center justify-center space-x-1 ${getStatusTextColor(item.objectifPourcentage)}`}>
                            <TrendingUp className="h-4 w-4" />
                            <span className="font-medium">{item.rythmeRecrutement}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Légende */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Légende - Rythme de Recrutement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-200 border-2 border-green-300 rounded"></div>
                <span className="text-sm text-green-800 font-medium">Excellent (≥80%)</span>
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
