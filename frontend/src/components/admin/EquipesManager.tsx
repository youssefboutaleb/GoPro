
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, Edit, Trash, Users } from 'lucide-react';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';
import { Profile } from '@/types/backend';
import DelegueAssignment from './DelegueAssignment';

interface EquipesManagerProps {
  onBack: () => void;
}

const EquipesManager: React.FC<EquipesManagerProps> = ({ onBack }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSuperviseur, setEditingSuperviseur] = useState<Profile | null>(null);
  const [selectedSuperviseur, setSelectedSuperviseur] = useState<Profile | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Helper to get token
  const getToken = () => {
    try {
      const keycloak = (window as any).keycloak;
      if (keycloak?.token) return keycloak.token;
    } catch {}
    return undefined;
  };

  // Fetch supervisors (profiles with role 'Supervisor')
  const { data: superviseurs, isLoading } = useQuery({
    queryKey: ['supervisors'],
    queryFn: async () => {
      const token = getToken();
      const data = await apiService.getProfilesByRole('Supervisor', token);
      return (data || []).sort((a: any, b: any) => a.firstName.localeCompare(b.firstName))
        .map((p: any) => ({
          id: p.id,
          first_name: p.firstName,
          last_name: p.lastName,
          role: p.role,
          sector_id: p.sectorId,
          supervisor_id: p.supervisorId
        })) as Profile[];
    },
  });

  // Fetch delegates for the selected supervisor
  const { data: delegues } = useQuery({
    queryKey: ['delegates', selectedSuperviseur?.id],
    queryFn: async () => {
      if (!selectedSuperviseur) return [];
      
      const token = getToken();
      const data = await apiService.getProfilesBySupervisor(selectedSuperviseur.id, token);
      return (data || []).filter((p: any) => p.role === 'Delegate')
        .sort((a: any, b: any) => a.firstName.localeCompare(b.firstName))
        .map((p: any) => ({
          id: p.id,
          first_name: p.firstName,
          last_name: p.lastName,
          role: p.role,
          sector_id: p.sectorId,
          supervisor_id: p.supervisorId
        })) as Profile[];
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
                    <TableHead>Nom</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {superviseurs?.map((superviseur) => (
                    <TableRow key={superviseur.id}>
                      <TableCell className="font-medium">
                        {superviseur.first_name} {superviseur.last_name}
                      </TableCell>
                      <TableCell>{superviseur.role || 'Supervisor'}</TableCell>
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
