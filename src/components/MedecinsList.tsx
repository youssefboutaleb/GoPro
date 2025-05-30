
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Filter, User, Phone, MapPin, Calendar, Stethoscope } from 'lucide-react';

interface MedecinsListProps {
  onBack: () => void;
}

const MedecinsList = ({ onBack }: MedecinsListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedWeek, setSelectedWeek] = useState('47');
  const [selectedBrick, setSelectedBrick] = useState('all');

  const medecins = [
    {
      id: 1,
      nom: "Dr. Martin Dubois",
      specialite: "Cardiologie",
      brick: "Nord-1",
      telephone: "01.45.67.89.12",
      adresse: "15 rue de la Paix, Paris",
      derniereVisite: "2024-11-20",
      statut: "Actif",
      objectifMensuel: 12,
      visitesRealisees: 8
    },
    {
      id: 2,
      nom: "Dr. Sophie Laurent",
      specialite: "Médecine Générale",
      brick: "Nord-2",
      telephone: "01.45.67.89.13",
      adresse: "32 avenue Victor Hugo, Lyon",
      derniereVisite: "2024-11-18",
      statut: "Actif",
      objectifMensuel: 15,
      visitesRealisees: 12
    },
    {
      id: 3,
      nom: "Dr. Pierre Moreau",
      specialite: "Diabétologie",
      brick: "Sud-1",
      telephone: "01.45.67.89.14",
      adresse: "8 place du Marché, Marseille",
      derniereVisite: "2024-11-15",
      statut: "En attente",
      objectifMensuel: 10,
      visitesRealisees: 6
    },
    {
      id: 4,
      nom: "Dr. Marie Leroy",
      specialite: "Cardiologie",
      brick: "Nord-1",
      telephone: "01.45.67.89.15",
      adresse: "25 boulevard Saint-Michel, Paris",
      derniereVisite: "2024-11-22",
      statut: "Actif",
      objectifMensuel: 14,
      visitesRealisees: 11
    },
    {
      id: 5,
      nom: "Dr. Jean Dupont",
      specialite: "Médecine Générale",
      brick: "Sud-2",
      telephone: "01.45.67.89.16",
      adresse: "12 rue de la République, Nice",
      derniereVisite: "2024-11-19",
      statut: "Actif",
      objectifMensuel: 18,
      visitesRealisees: 15
    },
    {
      id: 6,
      nom: "Dr. Anne Rousseau",
      specialite: "Diabétologie",
      brick: "Nord-2",
      telephone: "01.45.67.89.17",
      adresse: "45 cours Lafayette, Lyon",
      derniereVisite: "2024-11-17",
      statut: "Actif",
      objectifMensuel: 8,
      visitesRealisees: 9
    }
  ];

  const filteredMedecins = medecins.filter(medecin => {
    const matchesSearch = medecin.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || medecin.specialite === selectedSpecialty;
    const matchesBrick = selectedBrick === 'all' || medecin.brick === selectedBrick;
    return matchesSearch && matchesSpecialty && matchesBrick;
  });

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'Actif': return 'bg-green-100 text-green-800';
      case 'En attente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (realisees: number, objectif: number) => {
    const pourcentage = (realisees / objectif) * 100;
    if (pourcentage >= 90) return 'text-green-600';
    if (pourcentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

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
                <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Médecins Ciblés</h1>
                  <p className="text-sm text-gray-600">{filteredMedecins.length} médecins trouvés</p>
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
              <Filter className="h-5 w-5 text-blue-600" />
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
                    <SelectItem value="45">Semaine 45</SelectItem>
                    <SelectItem value="46">Semaine 46</SelectItem>
                    <SelectItem value="47">Semaine 47</SelectItem>
                    <SelectItem value="48">Semaine 48</SelectItem>
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

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMedecins.map((medecin) => (
            <Card key={medecin.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg">
                      <Stethoscope className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-gray-900">{medecin.nom}</CardTitle>
                      <p className="text-sm text-gray-600">{medecin.specialite}</p>
                    </div>
                  </div>
                  <Badge className={getStatutColor(medecin.statut)}>
                    {medecin.statut}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{medecin.telephone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{medecin.brick}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{medecin.derniereVisite}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Performance mensuelle</span>
                    <span className={`text-sm font-bold ${getPerformanceColor(medecin.visitesRealisees, medecin.objectifMensuel)}`}>
                      {Math.round((medecin.visitesRealisees / medecin.objectifMensuel) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Visites: {medecin.visitesRealisees}/{medecin.objectifMensuel}</span>
                    <span>Restant: {Math.max(0, medecin.objectifMensuel - medecin.visitesRealisees)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (medecin.visitesRealisees / medecin.objectifMensuel) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <p className="text-xs text-gray-500">{medecin.adresse}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMedecins.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
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

export default MedecinsList;
