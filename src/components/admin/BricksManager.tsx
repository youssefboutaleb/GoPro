
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Brick = Database['public']['Tables']['bricks']['Row'];
type Secteur = Database['public']['Tables']['secteur']['Row'];

interface BricksManagerProps {
  onBack: () => void;
}

const BricksManager: React.FC<BricksManagerProps> = ({ onBack }) => {
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [secteurs, setSecteurs] = useState<Secteur[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBrick, setEditingBrick] = useState<Brick | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    secteur_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch bricks with secteur information
      const { data: bricksData, error: bricksError } = await supabase
        .from('bricks')
        .select(`
          *,
          secteur:secteur_id (
            id,
            nom
          )
        `)
        .order('nom', { ascending: true });

      if (bricksError) throw bricksError;

      // Fetch all secteurs for the dropdown
      const { data: secteursData, error: secteursError } = await supabase
        .from('secteur')
        .select('*')
        .order('nom', { ascending: true });

      if (secteursError) throw secteursError;

      setBricks(bricksData || []);
      setSecteurs(secteursData || []);
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
    
    if (!formData.nom.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la brick est requis",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        nom: formData.nom.trim(),
        description: formData.description.trim() || null,
        secteur_id: formData.secteur_id || null,
      };

      console.log('Submitting data:', submitData);

      if (editingBrick) {
        const { error } = await supabase
          .from('bricks')
          .update(submitData)
          .eq('id', editingBrick.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        
        toast({
          title: "Succès",
          description: "Brick mise à jour avec succès",
        });
      } else {
        const { error } = await supabase
          .from('bricks')
          .insert([submitData]);

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        
        toast({
          title: "Succès",
          description: "Brick créée avec succès",
        });
      }

      setDialogOpen(false);
      setEditingBrick(null);
      setFormData({ nom: '', description: '', secteur_id: '' });
      await fetchData();
    } catch (error) {
      console.error('Error saving brick:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la brick",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (brick: Brick) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la brick "${brick.nom}" ?`)) {
      try {
        const { error } = await supabase
          .from('bricks')
          .delete()
          .eq('id', brick.id);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Brick supprimée avec succès",
        });
        await fetchData();
      } catch (error) {
        console.error('Error deleting brick:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer la brick",
          variant: "destructive",
        });
      }
    }
  };

  const openEditDialog = (brick: Brick) => {
    setEditingBrick(brick);
    setFormData({
      nom: brick.nom,
      description: brick.description || '',
      secteur_id: brick.secteur_id || '',
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingBrick(null);
    setFormData({ nom: '', description: '', secteur_id: '' });
    setDialogOpen(true);
  };

  const getSecteurName = (brick: any) => {
    return brick.secteur?.nom || 'N/A';
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
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Bricks</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Liste des Bricks</CardTitle>
                <CardDescription>Gérer les zones géographiques</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateDialog} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Nouvelle Brick</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingBrick ? 'Modifier la Brick' : 'Nouvelle Brick'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingBrick 
                        ? 'Modifiez les informations de la brick'
                        : 'Créez une nouvelle brick géographique'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nom">Nom de la brick</Label>
                      <Input
                        id="nom"
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        placeholder="Ex: Nord-1"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secteur">Secteur</Label>
                      <Select
                        value={formData.secteur_id}
                        onValueChange={(value) => setFormData({ ...formData, secteur_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un secteur" />
                        </SelectTrigger>
                        <SelectContent>
                          {secteurs.map((secteur) => (
                            <SelectItem key={secteur.id} value={secteur.id}>
                              {secteur.nom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Description optionnelle"
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
                    <TableHead>Nom</TableHead>
                    <TableHead>Secteur</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bricks.map((brick) => (
                    <TableRow key={brick.id}>
                      <TableCell className="font-medium">{brick.nom}</TableCell>
                      <TableCell>{getSecteurName(brick)}</TableCell>
                      <TableCell>{brick.description || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(brick)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(brick)}
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

export default BricksManager;
