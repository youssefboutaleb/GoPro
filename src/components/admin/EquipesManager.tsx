
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

type Profile = Tables<'profiles'>;

interface EquipesManagerProps {
  onBack: () => void;
}

const EquipesManager: React.FC<EquipesManagerProps> = ({ onBack }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSuperviseur, setEditingSuperviseur] = useState<Profile | null>(null);
  const [selectedSuperviseur, setSelectedSuperviseur] = useState<Profile | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch supervisors (profiles with role 'Supervisor')
  const { data: superviseurs, isLoading } = useQuery({
    queryKey: ['supervisors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'Supervisor')
        .order('id');
      
      if (error) throw error;
      return data as Profile[];
    },
  });

  // Fetch delegates for the selected supervisor
  const { data: delegues } = useQuery({
    queryKey: ['delegates', selectedSuperviseur?.id],
    queryFn: async () => {
      if (!selectedSuperviseur) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('supervisor_id', selectedSuperviseur.id)
        .eq('role', 'Delegate')
        .order('id');
      
      if (error) throw error;
      return data as Profile[];
    },
    enabled: !!selectedSuperviseur,
  });

  const resetForm = () => {
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
                <CardTitle>Liste des Superviseurs</CardTitle>
                <CardDescription>
                  Gérez les superviseurs et leurs délégués
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
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
                  {superviseurs?.map((superviseur) => (
                    <TableRow key={superviseur.id}>
                      <TableCell className="font-medium">{superviseur.id}</TableCell>
                      <TableCell>{superviseur.role}</TableCell>
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
