
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

type Visit = Database['public']['Tables']['visits']['Row'];
type Doctor = Database['public']['Tables']['doctors']['Row'];
type VisitStatus = Database['public']['Enums']['visit_status'];

interface VisitsManagerProps {
  onBack: () => void;
}

const VisitsManager: React.FC<VisitsManagerProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [formData, setFormData] = useState({
    doctor_id: '',
    visit_date: '',
    status: 'planifiee' as VisitStatus,
    notes: '',
  });

  useEffect(() => {
    fetchVisits();
    fetchDoctors();
  }, []);

  const fetchVisits = async () => {
    try {
      const { data, error } = await supabase
        .from('visits')
        .select(`
          *,
          doctors (
            first_name,
            last_name,
            specialty
          ),
          profiles (
            first_name,
            last_name
          )
        `)
        .order('visit_date', { ascending: false });

      if (error) throw error;
      setVisits(data || []);
    } catch (error) {
      console.error('Error fetching visits:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les visites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('active', true)
        .order('last_name', { ascending: true });

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer une visite",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const submitData = {
        ...formData,
        user_id: user.id,
      };

      if (editingVisit) {
        const { error } = await supabase
          .from('visits')
          .update(formData)
          .eq('id', editingVisit.id);

        if (error) throw error;
        toast({
          title: "Succès",
          description: "Visite mise à jour avec succès",
        });
      } else {
        const { error } = await supabase
          .from('visits')
          .insert([submitData]);

        if (error) throw error;
        toast({
          title: "Succès",
          description: "Visite créée avec succès",
        });
      }

      setDialogOpen(false);
      setEditingVisit(null);
      setFormData({
        doctor_id: '',
        visit_date: '',
        status: 'planifiee',
        notes: '',
      });
      fetchVisits();
    } catch (error) {
      console.error('Error saving visit:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la visite",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (visit: Visit) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer cette visite ?`)) {
      try {
        const { error } = await supabase
          .from('visits')
          .delete()
          .eq('id', visit.id);

        if (error) throw error;
        toast({
          title: "Succès",
          description: "Visite supprimée avec succès",
        });
        fetchVisits();
      } catch (error) {
        console.error('Error deleting visit:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer la visite",
          variant: "destructive",
        });
      }
    }
  };

  const openEditDialog = (visit: Visit) => {
    setEditingVisit(visit);
    setFormData({
      doctor_id: visit.doctor_id,
      visit_date: visit.visit_date,
      status: visit.status || 'planifiee',
      notes: visit.notes || '',
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingVisit(null);
    setFormData({
      doctor_id: '',
      visit_date: '',
      status: 'planifiee',
      notes: '',
    });
    setDialogOpen(true);
  };

  const statusLabels = {
    'planifiee': 'Planifiée',
    'realisee': 'Réalisée',
    'annulee': 'Annulée',
  };

  const statusColors = {
    'planifiee': 'bg-blue-100 text-blue-800',
    'realisee': 'bg-green-100 text-green-800',
    'annulee': 'bg-red-100 text-red-800',
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
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Visites</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Liste des Visites</CardTitle>
                <CardDescription>Planifier et suivre les visites</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateDialog} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Nouvelle Visite</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingVisit ? 'Modifier la Visite' : 'Nouvelle Visite'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingVisit 
                        ? 'Modifiez les informations de la visite'
                        : 'Planifiez une nouvelle visite médicale'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="doctor_id">Médecin</Label>
                      <Select
                        value={formData.doctor_id}
                        onValueChange={(value) => setFormData({ ...formData, doctor_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un médecin" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              Dr {doctor.first_name} {doctor.last_name} - {doctor.specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="visit_date">Date de visite</Label>
                      <Input
                        id="visit_date"
                        type="date"
                        value={formData.visit_date}
                        onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Statut</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value as VisitStatus })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un statut" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Input
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Notes sur la visite"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Enregistrement...' : 'Enregistrer'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Chargement...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Médecin</TableHead>
                    <TableHead>Représentant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visits.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell className="font-medium">
                        {new Date(visit.visit_date).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        {visit.doctors 
                          ? `Dr ${visit.doctors.first_name} ${visit.doctors.last_name}` 
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {visit.profiles 
                          ? `${visit.profiles.first_name} ${visit.profiles.last_name}` 
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          statusColors[visit.status || 'planifiee']
                        }`}>
                          {statusLabels[visit.status || 'planifiee']}
                        </span>
                      </TableCell>
                      <TableCell>{visit.notes}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(visit)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(visit)}
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
    </div>
  );
};

export default VisitsManager;
