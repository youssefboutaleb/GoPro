
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calendar, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RapportMedecinsProps {
  onBack: () => void;
}

interface MedecinVisiteData {
  medecin_id: string;
  medecin_nom: string;
  medecin_prenom: string;
  frequence_visite: string;
  visites_par_mois: { [key: string]: number };
}

const RapportMedecins = ({ onBack }: RapportMedecinsProps) => {
  const [selectedMonth, setSelectedMonth] = useState('janvier');
  const [rapportData, setRapportData] = useState<MedecinVisiteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const months = [
    { value: 'janvier', label: 'Janvier', num: 1 },
    { value: 'fevrier', label: 'Février', num: 2 },
    { value: 'mars', label: 'Mars', num: 3 },
    { value: 'avril', label: 'Avril', num: 4 },
    { value: 'mai', label: 'Mai', num: 5 },
    { value: 'juin', label: 'Juin', num: 6 },
    { value: 'juillet', label: 'Juillet', num: 7 },
    { value: 'aout', label: 'Août', num: 8 },
    { value: 'septembre', label: 'Septembre', num: 9 },
    { value: 'octobre', label: 'Octobre', num: 10 },
    { value: 'novembre', label: 'Novembre', num: 11 },
    { value: 'decembre', label: 'Décembre', num: 12 }
  ];

  // Get current month to determine which months to show
  const currentMonth = new Date().getMonth() + 1;
  const monthsToShow = months.filter(month => month.num <= currentMonth);

  useEffect(() => {
    const fetchRapportData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        console.log('Fetching delegue for user:', user.id);

        // First, get the current user's delegue record
        const { data: delegueData, error: delegueError } = await supabase
          .from('delegues')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (delegueError) {
          console.error('Error fetching delegue:', delegueError);
          setError('Erreur lors de la récupération des données du délégué');
          return;
        }

        if (!delegueData) {
          console.log('No delegue found for user:', user.id);
          setError('Aucun délégué trouvé pour cet utilisateur. Veuillez contacter l\'administrateur pour vous assigner un profil de délégué.');
          return;
        }

        console.log('Delegue found:', delegueData);

        // Get all medecins assigned to this delegue with their frequence_visite
        const { data: delegueMedecins, error: dmError } = await supabase
          .from('delegue_medecins')
          .select(`
            medecin_id,
            frequence_visite,
            medecins (
              id,
              nom,
              prenom
            )
          `)
          .eq('delegue_id', delegueData.id);

        if (dmError) {
          console.error('Error fetching delegue_medecins:', dmError);
          setError('Erreur lors de la récupération des médecins assignés');
          return;
        }

        console.log('Delegue medecins found:', delegueMedecins);

        // Get all visits for this delegue for the current year
        const currentYear = new Date().getFullYear();
        const startOfYear = `${currentYear}-01-01`;
        const endOfYear = `${currentYear}-12-31`;

        const { data: visitesData, error: visitesError } = await supabase
          .from('visites')
          .select('medecin_id, date_visite')
          .eq('delegue_id', delegueData.id)
          .gte('date_visite', startOfYear)
          .lte('date_visite', endOfYear);

        if (visitesError) {
          console.error('Error fetching visites:', visitesError);
          setError('Erreur lors de la récupération des visites');
          return;
        }

        console.log('Visites found:', visitesData);

        // Process the data
        const processedData: MedecinVisiteData[] = delegueMedecins?.map(dm => {
          const medecin = dm.medecins;
          if (!medecin) return null;

          // Count visits per month for this medecin
          const visitesParMois: { [key: string]: number } = {};
          
          // Initialize all months to 0
          monthsToShow.forEach(month => {
            visitesParMois[month.value] = 0;
          });

          // Count visits
          visitesData?.forEach(visite => {
            if (visite.medecin_id === dm.medecin_id) {
              const visitDate = new Date(visite.date_visite);
              const visitMonth = visitDate.getMonth() + 1;
              const monthKey = months.find(m => m.num === visitMonth)?.value;
              if (monthKey && visitesParMois.hasOwnProperty(monthKey)) {
                visitesParMois[monthKey]++;
              }
            }
          });

          return {
            medecin_id: dm.medecin_id,
            medecin_nom: medecin.nom,
            medecin_prenom: medecin.prenom,
            frequence_visite: dm.frequence_visite || '1',
            visites_par_mois: visitesParMois
          };
        }).filter(Boolean) as MedecinVisiteData[];

        console.log('Processed rapport data:', processedData);
        setRapportData(processedData);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Une erreur inattendue s\'est produite');
      } finally {
        setLoading(false);
      }
    };

    fetchRapportData();
  }, [user]);

  const getStatusColor = (medecin: MedecinVisiteData) => {
    const total = Object.values(medecin.visites_par_mois).reduce((sum, visites) => sum + visites, 0);
    const frequence = parseInt(medecin.frequence_visite);
    const expectedTotal = frequence * currentMonth;
    const percentage = expectedTotal > 0 ? (total / expectedTotal) * 100 : 0;

    if (percentage >= 80) return 'bg-green-100 border-green-300';
    if (percentage >= 50) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
  };

  const getStatusTextColor = (medecin: MedecinVisiteData) => {
    const total = Object.values(medecin.visites_par_mois).reduce((sum, visites) => sum + visites, 0);
    const frequence = parseInt(medecin.frequence_visite);
    const expectedTotal = frequence * currentMonth;
    const percentage = expectedTotal > 0 ? (total / expectedTotal) * 100 : 0;

    if (percentage >= 80) return 'text-green-800';
    if (percentage >= 50) return 'text-yellow-800';
    return 'text-red-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="bg-white shadow-lg border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack} className="p-2 hover:bg-blue-50">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Rapport des Visites</h1>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Réessayer
                </Button>
              </div>
            </CardContent>
          </Card>
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
                <div className="p-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Rapport des Visites</h1>
                  <p className="text-sm text-gray-600">Nombre de visites par médecin et par mois</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sélectionner le mois" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthsToShow.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Rapport Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">
              Rapport des visites - {monthsToShow.find(m => m.value === selectedMonth)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rapportData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Aucun médecin assigné trouvé</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Médecin</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Fréquence de visite</th>
                      {monthsToShow.map((month) => (
                        <th key={month.value} className="text-center py-3 px-4 font-medium text-gray-700">
                          {month.label}
                        </th>
                      ))}
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rapportData.map((medecin) => {
                      const total = Object.values(medecin.visites_par_mois).reduce((sum, visites) => sum + visites, 0);
                      return (
                        <tr key={medecin.medecin_id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${getStatusColor(medecin)} border-2`}>
                          <td className="py-4 px-4">
                            <span className={`font-medium ${getStatusTextColor(medecin)}`}>
                              Dr. {medecin.medecin_prenom} {medecin.medecin_nom}
                            </span>
                          </td>
                          <td className={`py-4 px-4 text-center ${getStatusTextColor(medecin)}`}>
                            <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 font-medium">
                              {medecin.frequence_visite}/mois
                            </span>
                          </td>
                          {monthsToShow.map((month) => (
                            <td key={month.value} className={`py-4 px-4 text-center ${getStatusTextColor(medecin)}`}>
                              <span className={`px-2 py-1 rounded ${selectedMonth === month.value ? 'bg-blue-200 font-bold' : ''}`}>
                                {medecin.visites_par_mois[month.value] || 0}
                              </span>
                            </td>
                          ))}
                          <td className={`py-4 px-4 text-center font-bold ${getStatusTextColor(medecin)}`}>
                            {total}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

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
                <span className="text-sm text-yellow-800 font-medium">Moyen (50-79%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-200 border-2 border-red-300 rounded"></div>
                <span className="text-sm text-red-800 font-medium">Faible (&lt;50%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RapportMedecins;
