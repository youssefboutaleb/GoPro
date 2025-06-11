import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Filter, User, Stethoscope, MapPin, FileText } from 'lucide-react';
import RapportMedecins from './RapportMedecins';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface IndiceRetourProps {
  onBack: () => void;
}

interface Medecin {
  id: string;
  nom: string;
  prenom: string;
  specialite: string | null;
  brick_id: string | null;
  bricks?: {
    nom: string;
    secteur?: {
      nom: string;
    };
  };
  // Calculated fields for indice de retour
  indiceRetour: number;
  status: string;
  visites_effectuees: number;
  visites_attendues: number;
  frequence_visite: string;
}

const IndiceRetour = ({ onBack }: IndiceRetourProps) => {
  const [activeTab, setActiveTab] = useState('medecins');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedWeek, setSelectedWeek] = useState('1');
  const [selectedBrick, setSelectedBrick] = useState('all');
  const { user } = useAuth();

  // First, get the current user's delegue information
  const { data: currentDelegue } = useQuery({
    queryKey: ['current-delegue', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log('Fetching delegue for user:', user.id);
      
      const { data, error } = await supabase
        .from('delegues')
        .select('id, nom, prenom')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching delegue:', error);
        throw error;
      }

      console.log('Current delegue:', data);
      return data;
    },
    enabled: !!user?.id
  });

  const { data: rawMedecins = [], isLoading, error } = useQuery({
    queryKey: ['medecins-indice-retour', currentDelegue?.id],
    queryFn: async () => {
      if (!currentDelegue?.id) {
        console.log('No delegue found, returning empty array');
        return [];
      }

      console.log('Fetching medecins for delegue:', currentDelegue.id);
      
      const { data, error } = await supabase
        .from('medecins')
        .select(`
          id,
          nom,
          prenom,
          specialite,
          brick_id,
          bricks:brick_id (
            nom,
            secteur:secteur_id (
              nom
            )
          ),
          delegue_medecins!inner (
            frequence_visite,
            delegue_id
          )
        `)
        .eq('delegue_medecins.delegue_id', currentDelegue.id)
        .order('nom', { ascending: true });

      if (error) {
        console.error('Error fetching medecins for delegue:', error);
        throw error;
      }

      console.log('Fetched medecins for delegue:', data);
      console.log('Number of medecins fetched:', data?.length || 0);
      return data;
    },
    enabled: !!currentDelegue?.id
  });

  // Transform raw data to include calculated indice retour values
  const { data: medecinsWithIndice = [] } = useQuery({
    queryKey: ['medecins-with-indice', rawMedecins, currentDelegue?.id],
    queryFn: async () => {
      if (!rawMedecins.length || !currentDelegue?.id) return [];

      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      const medecinsPromises = rawMedecins.map(async (medecin: any) => {
        // Get visits count for this year
        const { data: visites, error: visitesError } = await supabase
          .from('visites')
          .select('id')
          .eq('medecin_id', medecin.id)
          .eq('delegue_id', currentDelegue.id)
          .gte('date_visite', `${currentYear}-01-01`)
          .lte('date_visite', `${currentYear}-12-31`);

        if (visitesError) {
          console.error('Error fetching visits for medecin:', medecin.id, visitesError);
        }

        const visitesEffectuees = visites?.length || 0;

        // Calculate expected visits based on frequency
        const frequenceVisite = medecin.delegue_medecins[0]?.frequence_visite || '1';
        let visitesParMois = 1;
        
        switch (frequenceVisite) {
          case '1':
            visitesParMois = 1;
            break;
          case '2':
            visitesParMois = 2;
            break;
          case '3':
            visitesParMois = 3;
            break;
          case '4':
            visitesParMois = 4;
            break;
          default:
            visitesParMois = 1;
        }

        const visitesAttendues = visitesParMois * currentMonth;
        const indiceRetour = visitesAttendues > 0 ? Math.round((visitesEffectuees / visitesAttendues) * 100) : 0;
        
        let status = 'faible';
        if (indiceRetour >= 80) status = 'excellent';
        else if (indiceRetour >= 50) status = 'moyen';

        return {
          ...medecin,
          indiceRetour,
          status,
          visites_effectuees: visitesEffectuees,
          visites_attendues: visitesAttendues,
          frequence_visite: frequenceVisite
        };
      });

      const results = await Promise.all(medecinsPromises);
      console.log('Calculated indice retour for medecins:', results);
      return results;
    },
    enabled: !!rawMedecins.length && !!currentDelegue?.id
  });

  const medecins: Medecin[] = medecinsWithIndice;

  // Log data for debugging
  console.log('Current medecins with indice retour:', medecins);
  console.log('Is loading:', isLoading);
  console.log('Error:', error);
  console.log('Current delegue:', currentDelegue);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-100 border-green-300';
      case 'moyen':
        return 'bg-yellow-100 border-yellow-300';
      case 'faible':
        return 'bg-red-100 border-red-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-800';
      case 'moyen':
        return 'text-yellow-800';
      case 'faible':
        return 'text-red-800';
      default:
        return 'text-gray-800';
    }
  };

  const filteredMedecins = medecins.filter(medecin => {
    const fullName = `${medecin.prenom} ${medecin.nom}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || medecin.specialite === selectedSpecialty;
    const matchesBrick = selectedBrick === 'all' || medecin.bricks?.nom === selectedBrick;
    return matchesSearch && matchesSpecialty && matchesBrick;
  });

  // Calculate global index with new formula
  const currentMonth = new Date().getMonth() + 1;
  const totalVisitesEffectuees = filteredMedecins.reduce((sum, medecin) => sum + medecin.visites_effectuees, 0);
  const totalVisitesPossibles = filteredMedecins.reduce((sum, medecin) => {
    const frequence = parseInt(medecin.frequence_visite) || 1;
    return sum + (frequence * currentMonth);
  }, 0);
  
  const indiceRetourGlobal = totalVisitesPossibles > 0 
    ? Math.round((totalVisitesEffectuees / totalVisitesPossibles) * 100)
    : 0;

  // Get unique specialties and bricks for filters
  const specialties = [...new Set(medecins.map(m => m.specialite).filter(Boolean))];
  const bricks = [...new Set(medecins.map(m => m.bricks?.nom).filter(Boolean))];

  if (activeTab === 'rapport') {
    return <RapportMedecins onBack={() => setActiveTab('medecins')} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données d'indice de retour...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur lors du chargement des données: {error.message}</p>
          <Button onClick={onBack}>Retour</Button>
        </div>
      </div>
    );
  }

  if (!currentDelegue) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Aucun délégué trouvé pour cet utilisateur.</p>
          <Button onClick={onBack}>Retour</Button>
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
                <div className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Indice de Retour</h1>
                  <p className="text-sm text-gray-600">
                    {filteredMedecins.length} médecins trouvés sur {medecins.length} total - Délégué: {currentDelegue.prenom} {currentDelegue.nom}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">{indiceRetourGlobal}%</div>
                  <div className="text-sm opacity-90">Indice Global</div>
                </div>
              </div>
              <Button 
                onClick={() => setActiveTab('rapport')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                Rapport détaillé
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg text-gray-900">Filtres</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Recherche</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nom du médecin..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Spécialité</label>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes spécialités" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes spécialités</SelectItem>
                    {specialties.map(specialty => (
                      <SelectItem key={specialty} value={specialty!}>{specialty}</SelectItem>
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
                    {bricks.map(brick => (
                      <SelectItem key={brick} value={brick!}>{brick}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Information */}
        {medecins.length === 0 && currentDelegue && (
          <Card className="bg-yellow-50 border-yellow-200 mb-6">
            <CardContent className="pt-6">
              <p className="text-yellow-800">
                Aucun médecin assigné à ce délégué ({currentDelegue.prenom} {currentDelegue.nom}). 
                Vérifiez les assignations dans la table 'delegue_medecins'.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Liste des Médecins</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredMedecins.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {medecins.length === 0 ? 'Aucun médecin assigné' : 'Aucun médecin trouvé'}
                </h3>
                <p className="text-gray-600">
                  {medecins.length === 0 
                    ? 'Aucun médecin n\'est assigné à votre délégué. Contactez votre administrateur.'
                    : 'Essayez de modifier vos critères de recherche.'
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Nom</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Spécialité</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Brick</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Fréquence/mois</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Visites</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Indice de Retour</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMedecins.map((medecin) => (
                      <tr key={medecin.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${getStatusColor(medecin.status)} border-2`}>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg">
                              <Stethoscope className="h-4 w-4 text-purple-600" />
                            </div>
                            <span className={`font-medium ${getStatusTextColor(medecin.status)}`}>
                              {medecin.prenom} {medecin.nom}
                            </span>
                          </div>
                        </td>
                        <td className={`py-4 px-4 ${getStatusTextColor(medecin.status)}`}>
                          {medecin.specialite || 'Non renseigné'}
                        </td>
                        <td className="py-4 px-4">
                          <div className={`flex items-center space-x-2 ${getStatusTextColor(medecin.status)}`}>
                            <MapPin className="h-4 w-4" />
                            <span>{medecin.bricks?.nom || 'Non assigné'}</span>
                          </div>
                        </td>
                        <td className={`py-4 px-4 ${getStatusTextColor(medecin.status)}`}>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                            {medecin.frequence_visite}/mois
                          </span>
                        </td>
                        <td className={`py-4 px-4 ${getStatusTextColor(medecin.status)}`}>
                          <span className="text-sm">
                            {medecin.visites_effectuees} / {medecin.visites_attendues}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                              medecin.status === 'excellent' ? 'bg-green-500' :
                              medecin.status === 'moyen' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                            <span className={`font-semibold ${getStatusTextColor(medecin.status)}`}>
                              {medecin.indiceRetour}%
                            </span>
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

      </div>
    </div>
  );
};

export default IndiceRetour;
