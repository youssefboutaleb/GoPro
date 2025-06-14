import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Target, Filter, MapPin, Package, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface RythmeRecrutementProps {
  onBack: () => void;
}

interface VenteData {
  id: string;
  produitNom: string;
  brickNom: string;
  ventesMensuelles: number;
  ventesYtd: number;
  objectifMensuel: number | null;
  objectifYtd: number | null;
  objectifPourcentage: number | null;
  rythmeRecrutement: number;
  isSecteurTotal?: boolean;
}

const RythmeRecrutement = ({ onBack }: RythmeRecrutementProps) => {
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedBrick, setSelectedBrick] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const { user } = useAuth();

  // Get selected month as number (0-11) for array index
  const currentMonthIndex = parseInt(selectedMonth);
  const m = currentMonthIndex + 1; // Convert to 1-12 for the formula
  const n = 12 - m;

  // Calculate rythme de recrutement using the new formula
  const calculateRythmeRecrutement = (objectifMensuelArray: number[], ventesYtd: number): number => {
    if (!objectifMensuelArray || objectifMensuelArray.length === 0 || n <= 0) return 0;
    
    // Calculate objectif_annuel as sum of all monthly objectives
    const objectifAnnuel = objectifMensuelArray.reduce((sum, val) => sum + (val || 0), 0);
    
    if (objectifAnnuel <= 0) return 0;
    
    const numerator = objectifAnnuel - ventesYtd;
    const denominator = n * (n + 1) / 2;

    if (numerator < 0) return 0;
    return denominator > 0 ? Math.ceil(numerator / denominator) : 0;
  };

  // Calculate sector-wide rythme de recrutement for aggregated values
  const calculateSectorRythmeRecrutement = (allProductObjectives: number[][], allProductVentesYtd: number[]): number => {
    if (n <= 0) return 0;
    
    // Sum objectif_annuel across all products
    const totalObjectifAnnuel = allProductObjectives.reduce((total, productObjectifs) => {
      const productObjectifAnnuel = productObjectifs.reduce((sum, val) => sum + (val || 0), 0);
      return total + productObjectifAnnuel;
    }, 0);
    
    // Sum ventesYtd across all products
    const totalVentesYtd = allProductVentesYtd.reduce((sum, val) => sum + (val || 0), 0);
    
    if (totalObjectifAnnuel <= 0) return 0;
    
    const numerator = totalObjectifAnnuel - totalVentesYtd;
    const denominator = n * (n + 1) / 2;

    if (numerator < 0) return 0;
    return denominator > 0 ? Math.ceil(numerator / denominator) : 0;
  };

  // Calculate YTD values
  const calculateYtdValues = (monthlyArray: number[], selectedMonthIndex: number) => {
    return monthlyArray.slice(0, selectedMonthIndex + 1).reduce((sum, val) => sum + (val || 0), 0);
  };

  // Fetch current user's delegue info
  const { data: currentDelegue } = useQuery({
    queryKey: ['current_delegue', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log('Fetching delegue for user:', user.id);
      
      const { data: delegue, error } = await supabase
        .from('delegues')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching delegue:', error);
        throw error;
      }

      console.log('Found delegue:', delegue);
      return delegue;
    },
    enabled: !!user?.id
  });

  // Fetch secteur name for the current delegue
  const { data: secteurName = 'Secteur' } = useQuery({
    queryKey: ['secteur_name', currentDelegue?.secteur_id],
    queryFn: async () => {
      if (!currentDelegue?.secteur_id) return 'Secteur';
      
      const { data: secteur, error } = await supabase
        .from('secteurs')
        .select('nom')
        .eq('id', currentDelegue.secteur_id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching secteur:', error);
        return 'Secteur';
      }

      return secteur?.nom || 'Secteur';
    },
    enabled: !!currentDelegue?.secteur_id
  });

  // Fetch ventes with product and brick names, filtered by current delegue
  const { data: ventesData = [], isLoading: ventesLoading } = useQuery({
    queryKey: ['ventes_with_details', currentDelegue?.id],
    queryFn: async () => {
      if (!currentDelegue?.id) {
        console.log('No delegue found, returning empty array');
        return [];
      }
      
      console.log('Fetching ventes for delegue:', currentDelegue.id);
      
      const { data: ventes, error: ventesError } = await supabase
        .from('ventes')
        .select(`
          *,
          produits:produit_id(nom),
          bricks:brick_id(nom)
        `)
        .eq('delegue_id', currentDelegue.id);

      if (ventesError) {
        console.error('Error fetching ventes:', ventesError);
        throw ventesError;
      }

      console.log('Fetched ventes with details for delegue:', ventes);
      return ventes || [];
    },
    enabled: !!currentDelegue?.id
  });

  // Fetch objectives with realized sales data
  const { data: objectivesData = [], isLoading: objectivesLoading } = useQuery({
    queryKey: ['objectifs_ventes_with_realized', currentDelegue?.id, selectedMonth],
    queryFn: async () => {
      if (!currentDelegue?.id) {
        console.log('No delegue found for objectives, returning empty array');
        return [];
      }
      
      console.log('Fetching objectives for delegue:', currentDelegue.id);
      
      const { data: objectives, error: objectivesError } = await supabase
        .from('objectifs_ventes')
        .select('*')
        .eq('annee', new Date().getFullYear());

      if (objectivesError) {
        console.error('Error fetching objectives:', objectivesError);
        throw objectivesError;
      }

      console.log('Fetched objectives for delegue:', objectives);
      return objectives || [];
    },
    enabled: !!currentDelegue?.id
  });

  const isLoading = ventesLoading || objectivesLoading || !currentDelegue;

  // Process ventes data to group by product and brick, and get realized sales from objectives
  const processedData: VenteData[] = ventesData.reduce((acc, vente) => {
    const produitNom = vente.produits?.nom || 'Produit inconnu';
    const brickNom = vente.bricks?.nom || 'Brick inconnu';
    
    // For 'Total secteur' grouping, use secteur name instead of brick name
    const displayBrick = selectedBrick === 'total-secteur' ? secteurName : brickNom;
    const key = selectedBrick === 'total-secteur' 
      ? `${vente.produit_id}-secteur` 
      : `${vente.produit_id}-${vente.brick_id}`;

    const existingEntry = acc.find(item => 
      item.produitNom === produitNom && item.brickNom === displayBrick
    );

    // Find matching objective based on vente_id
    const matchingObjective = objectivesData.find(obj => 
      obj.vente_id === vente.id
    );
    
    // Calculate monthly objective from the array
    const objectifMensuelArray = matchingObjective?.objectif_mensuel || [];
    const objectifMensuel = objectifMensuelArray[currentMonthIndex] || 0;
    const objectifYtd = calculateYtdValues(objectifMensuelArray, currentMonthIndex);

    // Get realized sales for selected month and YTD
    const venteRealiseeArray = matchingObjective?.vente_realisee || [];
    const ventesMensuelles = venteRealiseeArray[currentMonthIndex] || 0;
    const ventesYtd = calculateYtdValues(venteRealiseeArray, currentMonthIndex);

    if (existingEntry) {
      // For 'Total secteur', aggregate the values properly
      if (selectedBrick === 'total-secteur') {
        existingEntry.ventesMensuelles += ventesMensuelles;
        existingEntry.ventesYtd += ventesYtd;
        existingEntry.objectifMensuel = (existingEntry.objectifMensuel || 0) + objectifMensuel;
        existingEntry.objectifYtd = (existingEntry.objectifYtd || 0) + objectifYtd;
        
        // For sector totals, we need to recalculate rythme using sector-wide formula
        // Find all ventes for this product to aggregate their objective arrays
        const productVentes = ventesData.filter(v => v.produits?.nom === produitNom);
        const allProductObjectives: number[][] = [];
        const allProductVentesYtd: number[] = [];
        
        // Group by unique products in the sector
        const uniqueProducts = [...new Set(ventesData.map(v => v.produits?.nom))];
        
        uniqueProducts.forEach(productName => {
          const productSpecificVentes = ventesData.filter(v => v.produits?.nom === productName);
          const aggregatedObjectifMensuel = new Array(12).fill(0);
          let aggregatedVentesYtd = 0;
          
          productSpecificVentes.forEach(pv => {
            const obj = objectivesData.find(o => o.vente_id === pv.id);
            if (obj?.objectif_mensuel) {
              obj.objectif_mensuel.forEach((val, idx) => {
                aggregatedObjectifMensuel[idx] += val || 0;
              });
            }
            if (obj?.vente_realisee) {
              aggregatedVentesYtd += calculateYtdValues(obj.vente_realisee, currentMonthIndex);
            }
          });
          
          allProductObjectives.push(aggregatedObjectifMensuel);
          allProductVentesYtd.push(aggregatedVentesYtd);
        });
        
        existingEntry.rythmeRecrutement = calculateSectorRythmeRecrutement(allProductObjectives, allProductVentesYtd);
      } else {
        // Update with realized sales data if we found a better match
        if (matchingObjective && ventesMensuelles > 0) {
          existingEntry.ventesMensuelles = ventesMensuelles;
          existingEntry.ventesYtd = ventesYtd;
        }
        // Update objective if we found a better match or if it was null
        if (objectifMensuel && !existingEntry.objectifMensuel) {
          existingEntry.objectifMensuel = objectifMensuel;
          existingEntry.objectifYtd = objectifYtd;
        }
        // Recalculate rythme with updated data using new formula
        existingEntry.rythmeRecrutement = calculateRythmeRecrutement(objectifMensuelArray, existingEntry.ventesYtd);
      }
      // Recalculate percentage based on updated data
      existingEntry.objectifPourcentage = existingEntry.objectifYtd && existingEntry.objectifYtd > 0 
        ? (existingEntry.ventesYtd / existingEntry.objectifYtd) * 100 
        : null;
    } else {
      // Use realized sales if available, otherwise default to 0
      const objectifPourcentage = objectifYtd && objectifYtd > 0 
        ? (ventesYtd / objectifYtd) * 100 
        : null;

      acc.push({
        id: key,
        produitNom,
        brickNom: displayBrick,
        ventesMensuelles,
        ventesYtd,
        objectifMensuel,
        objectifYtd,
        objectifPourcentage,
        rythmeRecrutement: calculateRythmeRecrutement(objectifMensuelArray, ventesYtd)
      });
    }

    return acc;
  }, [] as VenteData[]);

  // Create sector totals for 'Tous les bricks' filter
  const createSectorTotals = (data: VenteData[]): VenteData[] => {
    const sectorTotals: { [key: string]: VenteData } = {};
    const aggregatedObjectives: { [key: string]: number[] } = {};
    const aggregatedVentesRealisees: { [key: string]: number[] } = {};
    
    data.forEach(item => {
      const produitNom = item.produitNom;
      
      // Find all related ventes for this product to aggregate objectives properly
      const relatedVentes = ventesData.filter(vente => 
        vente.produits?.nom === produitNom
      );
      
      if (sectorTotals[produitNom]) {
        // Aggregate values
        sectorTotals[produitNom].ventesMensuelles += item.ventesMensuelles;
        sectorTotals[produitNom].ventesYtd += item.ventesYtd;
        sectorTotals[produitNom].objectifMensuel = (sectorTotals[produitNom].objectifMensuel || 0) + (item.objectifMensuel || 0);
        sectorTotals[produitNom].objectifYtd = (sectorTotals[produitNom].objectifYtd || 0) + (item.objectifYtd || 0);
      } else {
        // Create new sector total entry
        sectorTotals[produitNom] = {
          id: `${produitNom}-secteur-total`,
          produitNom,
          brickNom: secteurName,
          ventesMensuelles: item.ventesMensuelles,
          ventesYtd: item.ventesYtd,
          objectifMensuel: item.objectifMensuel,
          objectifYtd: item.objectifYtd,
          objectifPourcentage: null,
          rythmeRecrutement: 0,
          isSecteurTotal: true
        };
        
        // Initialize aggregated objectives and ventes realisees arrays
        aggregatedObjectives[produitNom] = new Array(12).fill(0);
        aggregatedVentesRealisees[produitNom] = new Array(12).fill(0);
      }
      
      // Aggregate monthly objectives and ventes realisees for all ventes of this product
      relatedVentes.forEach(vente => {
        const relatedObjective = objectivesData.find(obj => obj.vente_id === vente.id);
        if (relatedObjective?.objectif_mensuel) {
          relatedObjective.objectif_mensuel.forEach((val, index) => {
            aggregatedObjectives[produitNom][index] += val || 0;
          });
        }
        if (relatedObjective?.vente_realisee) {
          relatedObjective.vente_realisee.forEach((val, index) => {
            aggregatedVentesRealisees[produitNom][index] += val || 0;
          });
        }
      });
      
      // Recalculate percentage and rythme for the sector total using aggregated data
      const sectorTotal = sectorTotals[produitNom];
      sectorTotal.objectifPourcentage = sectorTotal.objectifYtd && sectorTotal.objectifYtd > 0 
        ? (sectorTotal.ventesYtd / sectorTotal.objectifYtd) * 100 
        : null;
    });
    
    // Calculate sector-wide rythme using the new formula for all products combined
    const allProductObjectives: number[][] = [];
    const allProductVentesYtd: number[] = [];
    
    Object.keys(sectorTotals).forEach(produitNom => {
      allProductObjectives.push(aggregatedObjectives[produitNom] || []);
      const aggregatedVentesYtd = calculateYtdValues(aggregatedVentesRealisees[produitNom] || [], currentMonthIndex);
      allProductVentesYtd.push(aggregatedVentesYtd);
    });
    
    // Apply the sector-wide rythme calculation to each product's sector total
    const sectorWideRythme = calculateSectorRythmeRecrutement(allProductObjectives, allProductVentesYtd);
    Object.values(sectorTotals).forEach(sectorTotal => {
      sectorTotal.rythmeRecrutement = sectorWideRythme;
    });
    
    return Object.values(sectorTotals);
  };

  console.log('Processed ventes data with YTD calculations:', processedData);

  // Filter data based on selections
  let filteredData = processedData.filter(item => {
    const matchesProduct = selectedProduct === 'all' || item.produitNom === selectedProduct;
    const matchesBrick = selectedBrick === 'all' || selectedBrick === 'total-secteur' || item.brickNom === selectedBrick;
    return matchesProduct && matchesBrick;
  });

  // If 'Tous les bricks' is selected, add sector totals at the top
  if (selectedBrick === 'all') {
    const sectorTotals = createSectorTotals(filteredData);
    filteredData = [
      ...sectorTotals.filter(item => selectedProduct === 'all' || item.produitNom === selectedProduct),
      ...filteredData
    ];
  }

  // Get unique values for filters
  const uniqueProducts = [...new Set(processedData.map(item => item.produitNom))];
  const uniqueBricks = [...new Set(processedData.map(item => item.brickNom))].filter(brick => brick !== secteurName);

  // Generate month options
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

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

  const getStatusPackageColor = (objectifPourcentage: number) => {
    if (objectifPourcentage >= 80) return 'from-green-100 to-green-200';
    if (objectifPourcentage >= 60) return 'from-yellow-100 to-yellow-200';
    return 'from-red-100 to-red-200';
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

  if (!currentDelegue) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Accès non autorisé</h3>
          <p className="text-gray-600 mb-4">
            Vous devez être associé à un délégué pour accéder à cette section.
          </p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    <SelectItem value="total-secteur">Total secteur</SelectItem>
                    {uniqueBricks.map(brick => (
                      <SelectItem key={brick} value={brick}>{brick}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Mois</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un mois" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthNames.map((month, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{month}</span>
                        </div>
                      </SelectItem>
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
                    ? 'Aucune vente trouvée pour ce délégué.'
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
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Ventes Mensuelles</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Ventes YtD</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Objectif Mensuel</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Objectif YtD</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Objectif en %</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Rythme de Recrutement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item) => (
                      <tr key={item.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${getStatusColor(item.objectifPourcentage || 0)} border-2 ${item.isSecteurTotal ? 'bg-blue-50 font-semibold' : ''}`}>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 bg-gradient-to-r ${getStatusPackageColor(item.objectifPourcentage || 0)} rounded-lg`}>
                              <Package className={`h-4 w-4 ${getStatusTextColor(item.objectifPourcentage || 0)}`}/>
                            </div>
                            <span className={`font-medium ${getStatusTextColor(item.objectifPourcentage || 0)}`}>{item.produitNom}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className={`flex items-center space-x-2 ${getStatusTextColor(item.objectifPourcentage || 0)}`}>
                            <MapPin className="h-4 w-4" />
                            <span>{item.brickNom}</span>
                          </div>
                        </td>
                        <td className={`py-4 px-4 text-right font-medium ${getStatusTextColor(item.objectifPourcentage || 0)}`}>
                          {item.ventesMensuelles.toLocaleString()}
                        </td>
                        <td className={`py-4 px-4 text-right font-medium ${getStatusTextColor(item.objectifPourcentage || 0)}`}>
                          {item.ventesYtd.toLocaleString()}
                        </td>
                        <td className={`py-4 px-4 text-right font-medium ${getStatusTextColor(item.objectifPourcentage || 0)}`}>
                          {item.objectifMensuel ? `${item.objectifMensuel.toLocaleString()}` : 'N/A'}
                        </td>
                        <td className={`py-4 px-4 text-right font-medium ${getStatusTextColor(item.objectifPourcentage || 0)}`}>
                          {item.objectifYtd ? `${item.objectifYtd.toLocaleString()}` : 'N/A'}
                        </td>
                        <td className={`py-4 px-4 text-right font-medium ${getStatusTextColor(item.objectifPourcentage || 0)}`}>
                          {item.objectifPourcentage ? `${item.objectifPourcentage.toFixed(1)}%` : 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className={`flex items-center justify-center space-x-1 ${getStatusTextColor(item.objectifPourcentage || 0)}`}>
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
