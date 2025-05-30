import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Filter, User, Stethoscope, MapPin, FileText } from 'lucide-react';
import RapportMedecins from './RapportMedecins';

interface IndiceRetourProps {
  onBack: () => void;
}

const IndiceRetour = ({ onBack }: IndiceRetourProps) => {
  const [activeTab, setActiveTab] = useState('medecins');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedWeek, setSelectedWeek] = useState('1');
  const [selectedBrick, setSelectedBrick] = useState('all');

  const medecins = [
    {
      id: 1,
      nom: "Dr. Martin Dubois",
      specialite: "Cardiologie",
      brick: "Nord-1",
      indiceRetour: 85,
      status: "excellent"
    },
    {
      id: 2,
      nom: "Dr. Sophie Laurent",
      specialite: "Médecine Générale",
      brick: "Nord-2",
      indiceRetour: 92,
      status: "excellent"
    },
    {
      id: 3,
      nom: "Dr. Pierre Moreau",
      specialite: "Diabétologie",
      brick: "Sud-1",
      indiceRetour: 68,
      status: "moyen"
    },
    {
      id: 4,
      nom: "Dr. Marie Leroy",
      specialite: "Cardiologie",
      brick: "Nord-1",
      indiceRetour: 45,
      status: "faible"
    },
    {
      id: 5,
      nom: "Dr. Jean Dupont",
      specialite: "Médecine Générale",
      brick: "Sud-2",
      indiceRetour: 78,
      status: "moyen"
    },
    {
      id: 6,
      nom: "Dr. Anne Rousseau",
      specialite: "Diabétologie",
      brick: "Nord-2",
      indiceRetour: 88,
      status: "excellent"
    },
    {
      id: 7,
      nom: "Dr. Paul Bernard",
      specialite: "Cardiologie",
      brick: "Sud-1",
      indiceRetour: 35,
      status: "faible"
    },
    {
      id: 8,
      nom: "Dr. Claire Petit",
      specialite: "Médecine Générale",
      brick: "Nord-1",
      indiceRetour: 95,
      status: "excellent"
    },
    {
      id: 9,
      nom: "Dr. Marc Fournier",
      specialite: "Diabétologie",
      brick: "Sud-2",
      indiceRetour: 72,
      status: "moyen"
    },
    {
      id: 10,
      nom: "Dr. Julie Martinez",
      specialite: "Cardiologie",
      brick: "Nord-2",
      indiceRetour: 25,
      status: "faible"
    }
  ];

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
    const matchesSearch = medecin.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || medecin.specialite === selectedSpecialty;
    const matchesBrick = selectedBrick === 'all' || medecin.brick === selectedBrick;
    return matchesSearch && matchesSpecialty && matchesBrick;
  });

  // Calcul de l'indice de retour global moyen
  const indiceRetourGlobal = Math.round(
    filteredMedecins.reduce((sum, medecin) => sum + medecin.indiceRetour, 0) / filteredMedecins.length
  );

  if (activeTab === 'rapport') {
    return <RapportMedecins onBack={() => setActiveTab('medecins')} />;
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
                  <p className="text-sm text-gray-600">{filteredMedecins.length} médecins trouvés</p>
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
                    <SelectItem value="Cardiologie">Cardiologie</SelectItem>
                    <SelectItem value="Médecine Générale">Médecine Générale</SelectItem>
                    <SelectItem value="Diabétologie">Diabétologie</SelectItem>
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
            <CardTitle className="text-lg text-gray-900">Liste des Médecins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Nom</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Spécialité</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Brick</th>
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
                          <span className={`font-medium ${getStatusTextColor(medecin.status)}`}>{medecin.nom}</span>
                        </div>
                      </td>
                      <td className={`py-4 px-4 ${getStatusTextColor(medecin.status)}`}>{medecin.specialite}</td>
                      <td className="py-4 px-4">
                        <div className={`flex items-center space-x-2 ${getStatusTextColor(medecin.status)}`}>
                          <MapPin className="h-4 w-4" />
                          <span>{medecin.brick}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {filteredMedecins.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mt-6">
            <CardContent className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun médecin trouvé</h3>
              <p className="text-gray-600">Essayez de modifier vos critères de recherche.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default IndiceRetour;
