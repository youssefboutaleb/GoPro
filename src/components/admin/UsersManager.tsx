import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Shield, User, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserRole = Database['public']['Enums']['role_type'];

interface ProfileWithMetrics extends Profile {
  return_index?: number;
  recruitment_rhythm?: number;
}

interface UsersManagerProps {
  onBack: () => void;
}

const UsersManager: React.FC<UsersManagerProps> = ({ onBack }) => {
  const [users, setUsers] = useState<ProfileWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch ALL profiles without filtering - admin should see all users
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate metrics for delegates
      const usersWithMetrics = await Promise.all(
        (profilesData || []).map(async (profile) => {
          if (profile.role === 'Delegate') {
            const metrics = await calculateDelegateMetrics(profile.id);
            return {
              ...profile,
              return_index: metrics.returnIndex,
              recruitment_rhythm: metrics.recruitmentRhythm
            };
          }
          return profile;
        })
      );

      setUsers(usersWithMetrics);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateDelegateMetrics = async (delegateId: string) => {
    try {
      // Get sales data for return index calculation
      const { data: salesData } = await supabase
        .from('sales')
        .select(`
          targets,
          achievements,
          year,
          sales_plans!inner(delegate_id)
        `)
        .eq('sales_plans.delegate_id', delegateId)
        .eq('year', new Date().getFullYear());

      // Get visit data for recruitment rhythm
      const { data: visitData } = await supabase
        .from('visits')
        .select(`
          visit_date,
          visit_plans!inner(delegate_id)
        `)
        .eq('visit_plans.delegate_id', delegateId)
        .gte('visit_date', new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);

      let returnIndex = 0;
      let recruitmentRhythm = 0;

      // Calculate return index (achievement/target ratio)
      if (salesData && salesData.length > 0) {
        const currentMonth = new Date().getMonth();
        let totalTargets = 0;
        let totalAchievements = 0;

        salesData.forEach(sale => {
          for (let i = 0; i <= currentMonth; i++) {
            totalTargets += sale.targets[i] || 0;
            totalAchievements += sale.achievements[i] || 0;
          }
        });

        returnIndex = totalTargets > 0 ? Math.round((totalAchievements / totalTargets) * 100) : 0;
      }

      // Calculate recruitment rhythm (visits per month)
      if (visitData) {
        const monthsElapsed = new Date().getMonth() + 1;
        recruitmentRhythm = monthsElapsed > 0 ? Math.round(visitData.length / monthsElapsed) : 0;
      }

      return { returnIndex, recruitmentRhythm };
    } catch (error) {
      console.error('Error calculating metrics:', error);
      return { returnIndex: 0, recruitmentRhythm: 0 };
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Rôle utilisateur mis à jour",
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le rôle",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin':
        return <Crown className="h-4 w-4" />;
      case 'Sales Director':
      case 'Marketing Manager':
      case 'Supervisor':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800';
      case 'Sales Director':
      case 'Marketing Manager':
        return 'bg-blue-100 text-blue-800';
      case 'Supervisor':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Liste des Utilisateurs ({users.length})</CardTitle>
            <CardDescription>Gérer les comptes utilisateurs et leurs rôles</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Chargement...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Date de création</TableHead>
                      <TableHead>Indice de Retour</TableHead>
                      <TableHead>Rythme de Recrutement</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell>
                          <Badge className={`flex items-center space-x-1 ${getRoleColor(user.role || 'Delegate')}`}>
                            {getRoleIcon(user.role || 'Delegate')}
                            <span>{user.role || 'Delegate'}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at || '').toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          {user.role === 'Delegate' ? (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              (user.return_index || 0) >= 80 ? 'bg-green-100 text-green-800' :
                              (user.return_index || 0) >= 50 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {user.return_index || 0}%
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {user.role === 'Delegate' ? (
                            <span className="text-sm text-gray-600">
                              {user.recruitment_rhythm || 0} visites/mois
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={user.role || 'Delegate'}
                            onValueChange={(newRole: UserRole) => updateUserRole(user.id, newRole)}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Delegate">Delegate</SelectItem>
                              <SelectItem value="Supervisor">Supervisor</SelectItem>
                              <SelectItem value="Marketing Manager">Marketing Manager</SelectItem>
                              <SelectItem value="Sales Director">Sales Director</SelectItem>
                              <SelectItem value="Admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UsersManager;
