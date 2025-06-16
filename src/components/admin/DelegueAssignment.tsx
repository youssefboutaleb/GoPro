import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, UserMinus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

interface DelegueAssignmentProps {
  equipe: Profile;
  onBack: () => void;
}

const DelegueAssignment: React.FC<DelegueAssignmentProps> = ({ equipe, onBack }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDelegueId, setSelectedDelegueId] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch profiles with user_type 'Delegate' assigned to this supervisor
  const { data: assignedDelegues, isLoading: loadingAssigned } = useQuery({
    queryKey: ['assigned-delegues', equipe.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('supervisor_id', equipe.id)
        .eq('user_type', 'Delegate')
        .order('id');
      
      if (error) throw error;
      return data as Profile[];
    },
  });

  // Fetch unassigned delegates (profiles with user_type 'Delegate' and no supervisor)
  const { data: unassignedDelegues, isLoading: loadingUnassigned } = useQuery({
    queryKey: ['unassigned-delegues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'Delegate')
        .is('supervisor_id', null)
        .order('id');
      
      if (error) throw error;
      return data as Profile[];
    },
  });

  // Assign delegue mutation
  const assignDelegue = useMutation({
    mutationFn: async (delegueId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ supervisor_id: equipe.id })
        .eq('id', delegueId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assigned-delegues'] });
      queryClient.invalidateQueries({ queryKey: ['unassigned-delegues'] });
      setIsDialogOpen(false);
      setSelectedDelegueId('');
      toast({
        title: "Succès",
        description: "Délégué assigné à l'équipe avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'assignation du délégué",
        variant: "destructive",
      });
    },
  });

  // Unassign delegue mutation
  const unassignDelegue = useMutation({
    mutationFn: async (delegueId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ supervisor_id: null })
        .eq('id', delegueId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assigned-delegues'] });
      queryClient.invalidateQueries({ queryKey: ['unassigned-delegues'] });
      toast({
        title: "Succès",
        description: "Délégué retiré de l'équipe avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors du retrait du délégué",
        variant: "destructive",
      });
    },
  });

  const handleAssign = () => {
    if (selectedDelegueId) {
      assignDelegue.mutate(selectedDelegueId);
    }
  };

  const handleUnassign = (delegueId: string, delegueId2: string) => {
    if (confirm(`Êtes-vous sûr de vouloir retirer ce délégué de cette équipe ?`)) {
      unassignDelegue.mutate(delegueId);
    }
  };

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
              <h1 className="text-2xl font-bold text-gray-900">
                Délégués - Superviseur {equipe.id}
              </h1>
              <p className="text-sm text-gray-600">
                Gérer les délégués de ce superviseur
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
                <CardTitle>Délégués assignés</CardTitle>
                <CardDescription>
                  Liste des délégués sous ce superviseur
                </CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Ajouter Délégué</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter un délégué à l'équipe</DialogTitle>
                    <DialogDescription>
                      Sélectionnez un délégué à ajouter à cette équipe.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label className="text-right text-sm font-medium">
                        Délégué
                      </label>
                      <div className="col-span-3">
                        <Select value={selectedDelegueId} onValueChange={setSelectedDelegueId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un délégué" />
                          </SelectTrigger>
                          <SelectContent>
                            {unassignedDelegues?.map((delegue) => (
                              <SelectItem key={delegue.id} value={delegue.id}>
                                Délégué {delegue.id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleAssign}
                      disabled={!selectedDelegueId || assignDelegue.isPending}
                    >
                      Ajouter
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loadingAssigned ? (
              <div>Chargement...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedDelegues?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500">
                        Aucun délégué assigné à cette équipe
                      </TableCell>
                    </TableRow>
                  ) : (
                    assignedDelegues?.map((delegue) => (
                      <TableRow key={delegue.id}>
                        <TableCell>{delegue.id}</TableCell>
                        <TableCell className="font-medium">{delegue.user_type}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleUnassign(delegue.id, delegue.id)}
                            className="flex items-center space-x-1"
                          >
                            <UserMinus className="h-4 w-4" />
                            <span>Retirer</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DelegueAssignment;
