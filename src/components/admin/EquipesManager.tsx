
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, Edit, Trash, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import DelegueAssignment from './DelegueAssignment';

type Supervisor = Tables<'supervisors'>;
type Delegate = Tables<'delegates'>;

interface EquipesManagerProps {
  onBack: () => void;
}

const EquipesManager: React.FC<EquipesManagerProps> = ({ onBack }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSuperviseur, setEditingSuperviseur] = useState<Supervisor | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [selectedSuperviseur, setSelectedSuperviseur] = useState<Supervisor | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch supervisors (renamed from equipes)
  const { data: superviseurs, isLoading } = useQuery({
    queryKey: ['supervisors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supervisors')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Supervisor[];
    },
  });

  // Fetch delegates for the selected supervisor
  const { data: delegues } = useQuery({
    queryKey: ['delegates', selectedSuperviseur?.id],
    queryFn: async () => {
      if (!selectedSuperviseur) return [];
      
      const { data, error } = await supabase
        .from('delegates')
        .select('*')
        .eq('team_id', selectedSuperviseur.id)
        .order('name');
      
      if (error) throw error;
      return data as Delegate[];
    },
    enabled: !!selectedSuperviseur,
  });

  // Create supervisor mutation
  const createSuperviseur = useMutation({
    mutationFn: async (data: { name: string }) => {
      const { data: result, error } = await supabase
        .from('supervisors')
        .insert([data])
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supervisors'] });
      setIsDialogOpen(false);
      setFormData({ name: '' });
      toast({
        title: "Succès",
        description: "Équipe créée avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la création de l'équipe",
        variant: "destructive",
      });
    },
  });

  // Update supervisor mutation
  const updateSuperviseur = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string } }) => {
      const { data: result, error } = await supabase
        .from('supervisors')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supervisors'] });
      setIsDialogOpen(false);
      setEditingSuperviseur(null);
      setFormData({ name: '' });
      toast({
        title: "Succès",
        description: "Équipe mise à jour avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour de l'équipe",
        variant: "destructive",
      });
    },
  });

  // Delete supervisor mutation
  const deleteSuperviseur = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('supervisors')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supervisors'] });
      toast({
        title: "Succès",
        description: "Équipe supprimée avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression de l'équipe",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSuperviseur) {
      updateSuperviseur.mutate({ id: editingSuperviseur.id, data: formData });
    } else {
      createSuperviseur.mutate(formData);
    }
  };

  const handleEdit = (superviseur: Supervisor) => {
    setEditingSuperviseur(superviseur);
    setFormData({ name: superviseur.name });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) {
      deleteSuperviseur.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({ name: '' });
    setEditingSuperviseur(null);
  };

  if (selectedSuperviseur) {
    return (
      <DelegueAssignment
        equipe={selectedSuperviseur}
        onBack={() => setSelectedSuperviseur(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Équipes</h1>
              <p className="text-sm text-gray-600">
                Gérer les équipes et assigner les délégués
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Liste des Équipes</CardTitle>
                <CardDescription>
                  Gérez les équipes et leurs membres
                </CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Nouvelle Équipe</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingSuperviseur ? 'Modifier l\'équipe' : 'Nouvelle équipe'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingSuperviseur 
                        ? 'Modifiez les informations de l\'équipe.' 
                        : 'Créez une nouvelle équipe.'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Nom
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="col-span-3"
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={createSuperviseur.isPending || updateSuperviseur.isPending}
                      >
                        {editingSuperviseur ? 'Modifier' : 'Créer'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Chargement...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {superviseurs?.map((superviseur) => (
                    <TableRow key={superviseur.id}>
                      <TableCell className="font-medium">{superviseur.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSuperviseur(superviseur)}
                            className="flex items-center space-x-1"
                          >
                            <Users className="h-4 w-4" />
                            <span>Délégués</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(superviseur)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(superviseur.id)}
                          >
                            <Trash className="h-4 w-4" />
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
    </div>
  );
};

export default EquipesManager;
