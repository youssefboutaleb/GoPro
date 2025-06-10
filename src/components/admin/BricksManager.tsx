
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Database } from '@/integrations/supabase/types';

type Brick = Database['public']['Tables']['bricks']['Row'];

interface BricksManagerProps {
  onBack: () => void;
}

const BricksManager: React.FC<BricksManagerProps> = ({ onBack }) => {
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBrick, setEditingBrick] = useState<Brick | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    name: '',
    region: '',
    description: '',
  });

  useEffect(() => {
    fetchBricks();
  }, []);

  const fetchBricks = async () => {
    try {
      const { data, error } = await supabase
        .from('bricks')
        .select('*')
        .order('nom', { ascending: true });

      if (error) throw error;
      setBricks(data || []);
    } catch (error) {
      console.error('Error fetching bricks:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les bricks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        nom: formData.nom,
        name: formData.name,
        region: formData.region,
        description: formData.description,
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

      setDialogOpen(false);
      setEditingBrick(null);
      setFormData({ nom: '', name: '', region: '', description: '' });
      fetchBricks();
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
    if (confirm(`Êtes-vous sûr de vouloir supprimer la brick "${brick.nom || brick.name}" ?`)) {
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
        fetchBricks();
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
      name: brick.name || '',
      region: brick.region || '',
      description: brick.description || '',
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingBrick(null);
    setFormData({ nom: '', name: '', region: '', description: '' });
    setDialogOpen(true);
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
                      <Label htmlFor="nom">Nom de la brick (FR)</Label>
                      <Input
                        id="nom"
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        placeholder="Ex: Nord-1"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom de la brick (EN)</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: North-1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="region">Région</Label>
                      <Input
                        id="region"
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        placeholder="Ex: Nord"
                      />
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
                    <TableHead>Nom (FR)</TableHead>
                    <TableHead>Nom (EN)</TableHead>
                    <TableHead>Région</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bricks.map((brick) => (
                    <TableRow key={brick.id}>
                      <TableCell className="font-medium">{brick.nom}</TableCell>
                      <TableCell>{brick.name || 'N/A'}</TableCell>
                      <TableCell>{brick.region || 'N/A'}</TableCell>
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
