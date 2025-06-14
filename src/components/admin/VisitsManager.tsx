
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

type Visit = Database['public']['Tables']['visites']['Row'] & {
  objectifs_visites?: {
    delegue?: { nom: string; prenom: string };
    medecin?: { nom: string; prenom: string };
  };
};
type Delegue = Database['public']['Tables']['delegues']['Row'];
type Medecin = Database['public']['Tables']['medecins']['Row'];
type ObjectifVisite = Database['public']['Tables']['objectifs_visites']['Row'];

interface VisitsManagerProps {
  onBack: () => void;
}

const VisitsManager: React.FC<VisitsManagerProps> = ({ onBack }) => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [delegues, setDelegues] = useState<Delegue[]>([]);
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [objectifsVisites, setObjectifsVisites] = useState<ObjectifVisite[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [formData, setFormData] = useState({
    date_visite: '',
    objectif_visite_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch visits with related data using the new structure
      const { data: visitsData, error: visitsError } = await supabase
        .from('visites')
        .select(`
          *,
          objectifs_visites:objectif_visite_id(
            delegue:delegue_id(nom, prenom),
            medecin:medecin_id(nom, prenom)
          )
        `)
        .order('date_visite', { ascending: false });

      if (visitsError) throw visitsError;

      // Fetch delegues
      const { data: deleguesData, error: deleguesError } = await supabase
        .from('delegues')
        .select('*')
        .order('nom', { ascending: true });

      if (deleguesError) throw deleguesError;

      // Fetch medecins
      const { data: medecinsData, error: medecinsError } = await supabase
        .from('medecins')
        .select('*')
        .order('nom', { ascending: true });

      if (medecinsError) throw medecinsError;

      // Fetch objectifs_visites
      const { data: objectifsVisitesData, error: objectifsVisitesError } = await supabase
        .from('objectifs_visites')
        .select(`
          *,
          delegue:delegue_id(nom, prenom),
          medecin:medecin_id(nom, prenom)
        `)
        .order('id', { ascending: true });

      if (objectifsVisitesError) throw objectifsVisitesError;

      setVisits(visitsData || []);
      setDelegues(deleguesData || []);
      setMedecins(medecinsData || []);
      setObjectifsVisites(objectifsVisitesData || []);
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
    
    if (!formData.date_visite || !formData.objectif_visite_id) {
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
        date_visite: formData.date_visite,
        objectif_visite_id: formData.objectif_visite_id,
      };

      if (editingVisit) {
        const { error } = await supabase
          .from('visites')
          .update(submitData)
          .eq('id', editingVisit.id);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Visite mise à jour avec succès",
        });
      } else {
        const { error } = await supabase
          .from('visites')
          .insert([submitData]);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Visite créée avec succès",
        });
      }

      setDialogOpen(false);
      setEditingVisit(null);
      setFormData({ date_visite: '', objectif_visite_id: '' });
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
          .from('visites')
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
      date_visite: visit.date_visite,
      objectif_visite_id: visit.objectif_visite_id || '',
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingVisit(null);
    setFormData({ date_visite: '', objectif_visite_id: '' });
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
                      <Label htmlFor="date_visite">Date de visite</Label>
                      <Input
                        id="date_visite"
                        type="date"
                        value={formData.date_visite}
                        onChange={(e) => setFormData({ ...formData, date_visite: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="objectif_visite_id">Objectif de visite</Label>
                      <Select value={formData.objectif_visite_id} onValueChange={(value) => setFormData({ ...formData, objectif_visite_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un objectif de visite" />
                        </SelectTrigger>
                        <SelectContent>
                          {objectifsVisites.map((objectif) => (
                            <SelectItem key={objectif.id} value={objectif.id}>
                              {objectif.delegue?.prenom} {objectif.delegue?.nom} - Dr. {objectif.medecin?.prenom} {objectif.medecin?.nom}
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
                          <span>{formatDate(visit.date_visite)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {visit.objectifs_visites?.delegue ? 
                          `${visit.objectifs_visites.delegue.prenom} ${visit.objectifs_visites.delegue.nom}` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {visit.objectifs_visites?.medecin ? 
                          `Dr. ${visit.objectifs_visites.medecin.prenom} ${visit.objectifs_visites.medecin.nom}` : 'N/A'}
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
