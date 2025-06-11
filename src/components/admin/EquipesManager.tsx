
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

type Equipe = Tables<'equipes'>;
type Delegue = Tables<'delegues'>;

interface EquipesManagerProps {
  onBack: () => void;
}

const EquipesManager: React.FC<EquipesManagerProps> = ({ onBack }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEquipe, setEditingEquipe] = useState<Equipe | null>(null);
  const [formData, setFormData] = useState({ nom: '' });
  const [selectedEquipe, setSelectedEquipe] = useState<Equipe | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch equipes
  const { data: equipes, isLoading } = useQuery({
    queryKey: ['equipes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipes')
        .select('*')
        .order('nom');
      
      if (error) throw error;
      return data as Equipe[];
    },
  });

  // Fetch delegues for the selected equipe
  const { data: delegues } = useQuery({
    queryKey: ['delegues', selectedEquipe?.id],
    queryFn: async () => {
      if (!selectedEquipe) return [];
      
      const { data, error } = await supabase
        .from('delegues')
        .select('*')
        .eq('equipe_id', selectedEquipe.id)
        .order('nom');
      
      if (error) throw error;
      return data as Delegue[];
    },
    enabled: !!selectedEquipe,
  });

  // Create equipe mutation
  const createEquipe = useMutation({
    mutationFn: async (data: { nom: string }) => {
      const { data: result, error } = await supabase
        .from('equipes')
        .insert([data])
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipes'] });
      setIsDialogOpen(false);
      setFormData({ nom: '' });
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

  // Update equipe mutation
  const updateEquipe = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { nom: string } }) => {
      const { data: result, error } = await supabase
        .from('equipes')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipes'] });
      setIsDialogOpen(false);
      setEditingEquipe(null);
      setFormData({ nom: '' });
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

  // Delete equipe mutation
  const deleteEquipe = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('equipes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipes'] });
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
    if (editingEquipe) {
      updateEquipe.mutate({ id: editingEquipe.id, data: formData });
    } else {
      createEquipe.mutate(formData);
    }
  };

  const handleEdit = (equipe: Equipe) => {
    setEditingEquipe(equipe);
    setFormData({ nom: equipe.nom });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) {
      deleteEquipe.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({ nom: '' });
    setEditingEquipe(null);
  };

  if (selectedEquipe) {
    return (
      <DelegueAssignment
        equipe={selectedEquipe}
        onBack={() => setSelectedEquipe(null)}
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
                      {editingEquipe ? 'Modifier l\'équipe' : 'Nouvelle équipe'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingEquipe 
                        ? 'Modifiez les informations de l\'équipe.' 
                        : 'Créez une nouvelle équipe.'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="nom" className="text-right">
                          Nom
                        </Label>
                        <Input
                          id="nom"
                          value={formData.nom}
                          onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                          className="col-span-3"
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={createEquipe.isPending || updateEquipe.isPending}
                      >
                        {editingEquipe ? 'Modifier' : 'Créer'}
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
                  {equipes?.map((equipe) => (
                    <TableRow key={equipe.id}>
                      <TableCell className="font-medium">{equipe.nom}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedEquipe(equipe)}
                            className="flex items-center space-x-1"
                          >
                            <Users className="h-4 w-4" />
                            <span>Délégués</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(equipe)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(equipe.id)}
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
