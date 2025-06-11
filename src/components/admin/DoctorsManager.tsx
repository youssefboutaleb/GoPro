
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Filter, User, Stethoscope, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import DoctorDialog from './DoctorDialog';

interface DoctorsManagerProps {
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
}

const DoctorsManager: React.FC<DoctorsManagerProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedBrick, setSelectedBrick] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Medecin | null>(null);

  const queryClient = useQueryClient();

  const { data: medecins = [], isLoading, error } = useQuery({
    queryKey: ['medecins'],
    queryFn: async () => {
      console.log('Fetching medecins from Supabase...');
      
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
          )
        `)
        .order('nom', { ascending: true });

      if (error) {
        console.error('Error fetching medecins:', error);
        throw error;
      }

      console.log('Fetched medecins:', data);
      console.log('Number of medecins fetched:', data?.length || 0);
      return data as Medecin[];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (doctorId: string) => {
      const { error } = await supabase
        .from('medecins')
        .delete()
        .eq('id', doctorId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medecins'] });
      toast.success('Médecin supprimé avec succès');
    },
    onError: (error) => {
      console.error('Error deleting doctor:', error);
      toast.error('Erreur lors de la suppression du médecin');
    }
  });

  // Log data for debugging
  console.log('Current medecins state:', medecins);
  console.log('Is loading:', isLoading);
  console.log('Error:', error);

  const filteredMedecins = medecins.filter(medecin => {
    const fullName = `${medecin.prenom} ${medecin.nom}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || medecin.specialite === selectedSpecialty;
    const matchesBrick = selectedBrick === 'all' || medecin.bricks?.nom === selectedBrick;
    return matchesSearch && matchesSpecialty && matchesBrick;
  });

  // Get unique specialties and bricks for filters
  const specialties = [...new Set(medecins.map(m => m.specialite).filter(Boolean))];
  const bricks = [...new Set(medecins.map(m => m.bricks?.nom).filter(Boolean))];

  const handleEdit = (doctor: Medecin) => {
    setEditingDoctor(doctor);
    setDialogOpen(true);
  };

  const handleDelete = (doctorId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce médecin ?')) {
      deleteMutation.mutate(doctorId);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingDoctor(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des médecins...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur lors du chargement des médecins: {error.message}</p>
          <Button onClick={onBack}>Retour</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Retour</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Liste des Médecins</h1>
                  <p className="text-sm text-gray-600">{filteredMedecins.length} médecins trouvés sur {medecins.length} total</p>
                </div>
              </div>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Ajouter un médecin</span>
            </Button>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        {medecins.length === 0 && (
          <Card className="bg-yellow-50 border-yellow-200 mb-6">
            <CardContent className="pt-6">
              <p className="text-yellow-800">
                Debug: Aucune donnée trouvée dans la table 'medecins'. 
                Vérifiez que des données existent dans Supabase.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-purple-600" />
              <span>Liste des Médecins</span>
            </CardTitle>
            <CardDescription>
              Gestion de la base de données des médecins
            </CardDescription>
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
                    ? 'La table medecins semble être vide. Ajoutez des médecins dans Supabase.'
                    : 'Essayez de modifier vos critères de recherche.'
                  }
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prénom</TableHead>
                    <TableHead>Spécialité</TableHead>
                    <TableHead>Brick</TableHead>
                    <TableHead>Secteur</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMedecins.map((medecin) => (
                    <TableRow key={medecin.id}>
                      <TableCell className="font-medium">{medecin.nom}</TableCell>
                      <TableCell>{medecin.prenom}</TableCell>
                      <TableCell>{medecin.specialite || 'Non renseigné'}</TableCell>
                      <TableCell>{medecin.bricks?.nom || 'Non assigné'}</TableCell>
                      <TableCell>{medecin.bricks?.secteur?.nom || 'Non assigné'}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(medecin)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(medecin.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <DoctorDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        doctor={editingDoctor}
      />
    </div>
  );
};

export default DoctorsManager;
