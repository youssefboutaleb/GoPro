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
  totalVisits: number;
  expectedVisits: number;
  frequenceVisite: number;
}

const IndiceRetour = ({ onBack }: IndiceRetourProps) => {
  const [activeTab, setActiveTab] = useState('medecins');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedWeek, setSelectedWeek] = useState('1');
  const [selectedBrick, setSelectedBrick] = useState('all');
  const { user } = useAuth();

  const { data: medecins = [], isLoading, error } = useQuery({
    queryKey: ['medecins-indice-retour', user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log('Fetching indice retour data for user:', user.id);

      // First, get the current user's delegue record
      const { data: delegueData, error: delegueError } = await supabase
        .from('delegues')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (delegueError) {
        console.error('Error fetching delegue:', delegueError);
        throw delegueError;
      }

      if (!delegueData) {
        console.log('No delegue found for user:', user.id);
        return [];
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
            prenom,
            specialite,
            brick_id,
            bricks:brick_id (
              nom,
              secteur:secteur_id (
                nom
              )
            )
          )
        `)
        .eq('delegue_id', delegueData.id);

      if (dmError) {
        console.error('Error fetching delegue_medecins:', dmError);
        throw dmError;
      }

      console.log('Delegue medecins found:', delegueMedecins);

      if (!delegueMedecins || delegueMedecins.length === 0) {
        return [];
      }

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
        throw visitesError;
      }

      console.log('Visites found:', visitesData);

      // Calculate current month number (1-12)
      const currentMonth = new Date().getMonth() + 1;

      // Process the data to calculate real indice de retour
      const processedMedecins: Medecin[] = delegueMedecins.map(dm => {
        const medecin = dm.medecins;
        if (!medecin) return null;

        // Count total visits for this medecin in the current year
        const totalVisits = visitesData?.filter(v => v.medecin_id === dm.medecin_id).length || 0;
        
        // Calculate expected visits from beginning of year to current month
        const frequenceVisite = parseInt(dm.frequence_visite || '1');
        const expectedVisits = frequenceVisite * currentMonth;
        
        // Calculate indice de retour as percentage
        const indiceRetour = expectedVisits > 0 ? Math.round((totalVisits / expectedVisits) * 100) : 0;
        
        // Determine status based on percentage
        let status = 'faible';
        if (indiceRetour >= 80) status = 'excellent';
        else if (indiceRetour >= 60) status = 'moyen';

        return {
          id: medecin.id,
          nom: medecin.nom,
          prenom: medecin.prenom,
          specialite: medecin.specialite,
          brick_id: medecin.brick_id,
          bricks: medecin.bricks,
          indiceRetour,
          status,
          totalVisits,
          expectedVisits,
          frequenceVisite
        };
      }).filter(Boolean) as Medecin[];

      console.log('Processed medecins with real indice retour:', processedMedecins);
      return processedMedecins;
    },
    enabled: !!user
  });

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

  // Calcul de l'indice de retour global moyen
  const indiceRetourGlobal = Math.round(
    filteredMedecins.reduce((sum, medecin) => sum + medecin.indiceRetour, 0) / filteredMedecins.length
  ) || 0;

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
                  <p className="text-sm text-gray-600">{filteredMedecins.length} médecins trouvés sur {medecins.length} total</p>
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
                <label className="text-sm font-medium text-gray-700">Semaine</label>
                <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner semaine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semaine 1</SelectItem>
                    <SelectItem value="2">Semaine 2</SelectItem>
                    <SelectItem value="3">Semaine 3</SelectItem>
                    <SelectItem value="4">Semaine 4</SelectItem>
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
        {medecins.length === 0 && (
          <Card className="bg-yellow-50 border-yellow-200 mb-6">
            <CardContent className="pt-6">
              <p className="text-yellow-800">
                Debug: Aucune donnée trouvée. Vérifiez qu'un délégué est assigné à cet utilisateur et que des médecins sont assignés au délégué.
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
                  {medecins.length === 0 ? 'Aucune donnée dans la base' : 'Aucun médecin trouvé'}
                </h3>
                <p className="text-gray-600">
                  {medecins.length === 0 
                    ? 'Aucun délégué ou médecin assigné trouvé pour cet utilisateur.'
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
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Visites</th>
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
                        <td className={`py-4 px-4 text-center ${getStatusTextColor(medecin.status)}`}>
                          <div className="text-sm">
                            <div className="font-medium">{medecin.totalVisits} / {medecin.expectedVisits}</div>
                            <div className="text-xs opacity-75">réalisées / attendues</div>
                          </div>
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
