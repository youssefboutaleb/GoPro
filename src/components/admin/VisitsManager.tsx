
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Visit = Database['public']['Tables']['visits']['Row'] & {
  visit_frequencies?: {
    delegates?: { name: string; first_name: string };
    doctors?: { name: string; first_name: string };
  };
};
type Delegate = Database['public']['Tables']['delegates']['Row'];
type Doctor = Database['public']['Tables']['doctors']['Row'];
type VisitFrequency = Database['public']['Tables']['visit_frequencies']['Row'] & {
  delegates?: { name: string; first_name: string };
  doctors?: { name: string; first_name: string };
};

interface VisitsManagerProps {
  onBack: () => void;
}

const VisitsManager: React.FC<VisitsManagerProps> = ({ onBack }) => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [visitFrequencies, setVisitFrequencies] = useState<VisitFrequency[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [formData, setFormData] = useState({
    visit_date: '',
    visit_objective_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch visits with related data using the new structure
      const { data: visitsData, error: visitsError } = await supabase
        .from('visits')
        .select(`
          *,
          visit_frequencies:visit_objective_id(
            delegates:delegate_id(name, first_name),
            doctors:doctor_id(name, first_name)
          )
        `)
        .order('visit_date', { ascending: false });

      if (visitsError) throw visitsError;

      // Fetch delegates
      const { data: delegatesData, error: delegatesError } = await supabase
        .from('delegates')
        .select('*')
        .order('name', { ascending: true });

      if (delegatesError) throw delegatesError;

      // Fetch doctors
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('doctors')
        .select('*')
        .order('name', { ascending: true });

      if (doctorsError) throw doctorsError;

      // Fetch visit_frequencies with related delegate and doctor data
      const { data: visitFrequenciesData, error: visitFrequenciesError } = await supabase
        .from('visit_frequencies')
        .select(`
          *,
          delegates:delegate_id(name, first_name),
          doctors:doctor_id(name, first_name)
        `)
        .order('id', { ascending: true });

      if (visitFrequenciesError) throw visitFrequenciesError;

      setVisits(visitsData || []);
      setDelegates(delegatesData || []);
      setDoctors(doctorsData || []);
      setVisitFrequencies(visitFrequenciesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.visit_date || !formData.visit_objective_id) {
      toast({
        title: "Erreur",
        description: "Tous les champs sont requis",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        visit_date: formData.visit_date,
        visit_objective_id: formData.visit_objective_id,
      };

      if (editingVisit) {
        const { error } = await supabase
          .from('visits')
          .update(submitData)
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
      setFormData({ visit_date: '', visit_objective_id: '' });
      await fetchData();
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
        await fetchData();
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
      visit_date: visit.visit_date,
      visit_objective_id: visit.visit_objective_id || '',
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingVisit(null);
    setFormData({ visit_date: '', visit_objective_id: '' });
    setDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
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
                <CardDescription>Planifier et suivre les visites médicales</CardDescription>
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
                      <Label htmlFor="visit_objective_id">Fréquence de visite</Label>
                      <Select value={formData.visit_objective_id} onValueChange={(value) => setFormData({ ...formData, visit_objective_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une fréquence de visite" />
                        </SelectTrigger>
                        <SelectContent>
                          {visitFrequencies.map((frequency) => (
                            <SelectItem key={frequency.id} value={frequency.id}>
                              {frequency.delegates?.first_name} {frequency.delegates?.name} - Dr. {frequency.doctors?.first_name} {frequency.doctors?.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                    <TableHead>Délégué</TableHead>
                    <TableHead>Médecin</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visits.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{formatDate(visit.visit_date)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {visit.visit_frequencies?.delegates ? 
                          `${visit.visit_frequencies.delegates.first_name} ${visit.visit_frequencies.delegates.name}` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {visit.visit_frequencies?.doctors ? 
                          `Dr. ${visit.visit_frequencies.doctors.first_name} ${visit.visit_frequencies.doctors.name}` : 'N/A'}
                      </TableCell>
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
