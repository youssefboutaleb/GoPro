import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
  
  // Dialog states for bricks
  const [bricksDialogOpen, setBricksDialogOpen] = useState(false);
  const [editingBrick, setEditingBrick] = useState<Brick | null>(null);
  const [brickFormData, setBrickFormData] = useState({
    nom: '',
    description: '',
    secteur_id: '',
  });

  // Dialog states for secteurs
  const [secteursDialogOpen, setSecteursDialogOpen] = useState(false);
  const [editingSecteur, setEditingSecteur] = useState<Secteur | null>(null);
  const [secteurFormData, setSecteurFormData] = useState({
    nom: '',
    selectedBricks: [] as string[],
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

      // Fetch all secteurs
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

  // Brick CRUD operations
  const handleBrickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brickFormData.nom.trim()) {
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
        nom: brickFormData.nom.trim(),
        description: brickFormData.description.trim() || null,
        secteur_id: brickFormData.secteur_id || null,
      };

      if (editingBrick) {
        const { error } = await supabase
          .from('bricks')
          .update(submitData)
          .eq('id', editingBrick.id);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Brick mise à jour avec succès",
        });
      } else {
        const { error } = await supabase
          .from('bricks')
          .insert([submitData]);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Brick créée avec succès",
        });
      }

      setBricksDialogOpen(false);
      setEditingBrick(null);
      setBrickFormData({ nom: '', description: '', secteur_id: '' });
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

  const handleBrickDelete = async (brick: Brick) => {
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

  const openEditBrickDialog = (brick: Brick) => {
    setEditingBrick(brick);
    setBrickFormData({
      nom: brick.nom,
      description: brick.description || '',
      secteur_id: brick.secteur_id || '',
    });
    setBricksDialogOpen(true);
  };

  const openCreateBrickDialog = () => {
    setEditingBrick(null);
    setBrickFormData({ nom: '', description: '', secteur_id: '' });
    setBricksDialogOpen(true);
  };

  // Secteur CRUD operations
  const handleSecteurSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!secteurFormData.nom.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du secteur est requis",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        nom: secteurFormData.nom.trim(),
      };

      let secteurId: string;

      if (editingSecteur) {
        console.log('Updating secteur with ID:', editingSecteur.id);
        console.log('Updating secteur with data:', submitData);
        
        // First, verify the secteur exists
        const { data: existingSecteur, error: checkError } = await supabase
          .from('secteur')
          .select('id, nom')
          .eq('id', editingSecteur.id)
          .single();

        if (checkError || !existingSecteur) {
          console.error('Secteur not found for update:', checkError);
          throw new Error('Secteur introuvable dans la base de données');
        }

        console.log('Found existing secteur:', existingSecteur);

        const { data, error } = await supabase
          .from('secteur')
          .update(submitData)
          .eq('id', editingSecteur.id)
          .select();

        if (error) {
          console.error('Error updating secteur:', error);
          throw error;
        }

        if (!data || data.length === 0) {
          console.error('No data returned from update');
          throw new Error('Aucune donnée retournée lors de la mise à jour');
        }
        
        console.log('Secteur updated successfully:', data[0]);
        secteurId = editingSecteur.id;
        
        toast({
          title: "Succès",
          description: "Secteur mis à jour avec succès",
        });
      } else {
        console.log('Creating new secteur with data:', submitData);
        
        const { data, error } = await supabase
          .from('secteur')
          .insert([submitData])
          .select()
          .single();

        if (error) {
          console.error('Error creating secteur:', error);
          throw error;
        }
        
        console.log('Secteur created successfully:', data);
        secteurId = data.id;
        
        toast({
          title: "Succès",
          description: "Secteur créé avec succès",
        });
      }

      // Handle brick assignments more efficiently
      console.log('Updating brick assignments for secteur:', secteurId);
      console.log('Selected bricks:', secteurFormData.selectedBricks);

      // Get current brick assignments for this secteur
      const currentBricks = bricks.filter(brick => brick.secteur_id === secteurId).map(brick => brick.id);
      console.log('Current bricks for secteur:', currentBricks);

      // Find bricks to unassign (currently assigned but not selected)
      const bricksToUnassign = currentBricks.filter(brickId => !secteurFormData.selectedBricks.includes(brickId));
      
      // Find bricks to assign (selected but not currently assigned)
      const bricksToAssign = secteurFormData.selectedBricks.filter(brickId => !currentBricks.includes(brickId));

      console.log('Bricks to unassign:', bricksToUnassign);
      console.log('Bricks to assign:', bricksToAssign);

      // Unassign bricks that should no longer be in this secteur
      if (bricksToUnassign.length > 0) {
        const { error: unassignError } = await supabase
          .from('bricks')
          .update({ secteur_id: null })
          .in('id', bricksToUnassign);

        if (unassignError) {
          console.error('Error unassigning bricks:', unassignError);
          throw unassignError;
        }
      }

      // Assign new bricks to this secteur
      if (bricksToAssign.length > 0) {
        const { error: assignError } = await supabase
          .from('bricks')
          .update({ secteur_id: secteurId })
          .in('id', bricksToAssign);

        if (assignError) {
          console.error('Error assigning bricks:', assignError);
          throw assignError;
        }
      }

      setSecteursDialogOpen(false);
      setEditingSecteur(null);
      setSecteurFormData({ nom: '', selectedBricks: [] });
      await fetchData();
    } catch (error) {
      console.error('Error saving secteur:', error);
      toast({
        title: "Erreur",
        description: `Impossible de sauvegarder le secteur: ${error.message || 'Erreur inconnue'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSecteurDelete = async (secteur: Secteur) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le secteur "${secteur.nom}" ?`)) {
      try {
        // First, update bricks to remove secteur reference
        await supabase
          .from('bricks')
          .update({ secteur_id: null })
          .eq('secteur_id', secteur.id);

        const { error } = await supabase
          .from('secteur')
          .delete()
          .eq('id', secteur.id);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Secteur supprimé avec succès",
        });
        await fetchData();
      } catch (error) {
        console.error('Error deleting secteur:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le secteur",
          variant: "destructive",
        });
      }
    }
  };

  const openEditSecteurDialog = (secteur: Secteur) => {
    console.log('Opening edit dialog for secteur:', secteur);
    setEditingSecteur(secteur);
    const secteurBricks = bricks.filter(brick => brick.secteur_id === secteur.id).map(brick => brick.id);
    console.log('Secteur bricks:', secteurBricks);
    setSecteurFormData({
      nom: secteur.nom,
      selectedBricks: secteurBricks,
    });
    setSecteursDialogOpen(true);
  };

  const openCreateSecteurDialog = () => {
    setEditingSecteur(null);
    setSecteurFormData({ nom: '', selectedBricks: [] });
    setSecteursDialogOpen(true);
  };

  const handleBrickSelection = (brickId: string, checked: boolean) => {
    console.log('Brick selection changed:', brickId, checked);
    setSecteurFormData(prev => ({
      ...prev,
      selectedBricks: checked 
        ? [...prev.selectedBricks, brickId]
        : prev.selectedBricks.filter(id => id !== brickId)
    }));
  };

  const getSecteurName = (brick: any) => {
    return brick.secteur?.nom || 'N/A';
  };

  const getBricksCount = (secteurId: string) => {
    return bricks.filter(brick => brick.secteur_id === secteurId).length;
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

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Secteurs Management Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Liste des Secteurs</CardTitle>
                <CardDescription>Gérer les secteurs et leurs bricks associées</CardDescription>
              </div>
              <Dialog open={secteursDialogOpen} onOpenChange={setSecteursDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateSecteurDialog} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Nouveau Secteur</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingSecteur ? 'Modifier le Secteur' : 'Nouveau Secteur'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingSecteur 
                        ? 'Modifiez les informations du secteur et sélectionnez les bricks associées'
                        : 'Créez un nouveau secteur et sélectionnez les bricks associées'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSecteurSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="secteur-nom">Nom du secteur</Label>
                      <Input
                        id="secteur-nom"
                        value={secteurFormData.nom}
                        onChange={(e) => setSecteurFormData({ ...secteurFormData, nom: e.target.value })}
                        placeholder="Ex: Nord"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Bricks associées</Label>
                      <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                        {bricks.map((brick) => (
                          <div key={brick.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`brick-${brick.id}`}
                              checked={secteurFormData.selectedBricks.includes(brick.id)}
                              onCheckedChange={(checked) => handleBrickSelection(brick.id, checked as boolean)}
                            />
                            <Label htmlFor={`brick-${brick.id}`} className="text-sm">
                              {brick.nom}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setSecteursDialogOpen(false)}>
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
                    <TableHead>Nombre de bricks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {secteurs.map((secteur) => (
                    <TableRow key={secteur.id}>
                      <TableCell className="font-medium">{secteur.nom}</TableCell>
                      <TableCell>{getBricksCount(secteur.id)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditSecteurDialog(secteur)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSecteurDelete(secteur)}
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

        {/* Bricks Management Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Liste des Bricks</CardTitle>
                <CardDescription>Gérer les zones géographiques</CardDescription>
              </div>
              <Dialog open={bricksDialogOpen} onOpenChange={setBricksDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateBrickDialog} className="flex items-center space-x-2">
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
                  <form onSubmit={handleBrickSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nom">Nom de la brick</Label>
                      <Input
                        id="nom"
                        value={brickFormData.nom}
                        onChange={(e) => setBrickFormData({ ...brickFormData, nom: e.target.value })}
                        placeholder="Ex: Nord-1"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secteur">Secteur</Label>
                      <Select
                        value={brickFormData.secteur_id}
                        onValueChange={(value) => setBrickFormData({ ...brickFormData, secteur_id: value })}
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
                        value={brickFormData.description}
                        onChange={(e) => setBrickFormData({ ...brickFormData, description: e.target.value })}
                        placeholder="Description optionnelle"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setBricksDialogOpen(false)}>
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
                            onClick={() => openEditBrickDialog(brick)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBrickDelete(brick)}
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
