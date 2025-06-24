import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Edit, Trash2, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Sector = Database['public']['Tables']['sectors']['Row'];
type Brick = Database['public']['Tables']['bricks']['Row'] & {
  sector?: { name: string };
};

interface SectorsBricksManagerProps {
  onBack: () => void;
}

const SectorsBricksManager: React.FC<SectorsBricksManagerProps> = ({ onBack }) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'sector' | 'brick'>('sector');
  const [editingItem, setEditingItem] = useState<Sector | Brick | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sector_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch sectors
      const { data: sectorsData, error: sectorsError } = await supabase
        .from('sectors')
        .select('*')
        .order('name', { ascending: true });

      if (sectorsError) throw sectorsError;

      // Fetch bricks with sector information
      const { data: bricksData, error: bricksError } = await supabase
        .from('bricks')
        .select('*')
        .order('name', { ascending: true });

      if (bricksError) throw bricksError;

      // Get sector details for each brick
      const bricksWithSectors = await Promise.all(
        (bricksData || []).map(async (brick) => {
          if (brick.sector_id) {
            const sector = sectorsData?.find(s => s.id === brick.sector_id);
            return {
              ...brick,
              sector: sector ? { name: sector.name } : null
            };
          }
          return { ...brick, sector: null };
        })
      );

      setSectors(sectorsData || []);
      setBricks(bricksWithSectors);
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
    
    if (!formData.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom est requis",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (dialogType === 'sector') {
        const submitData = { name: formData.name.trim() };

        if (editingItem) {
          const { error } = await supabase
            .from('sectors')
            .update(submitData)
            .eq('id', (editingItem as Sector).id);

          if (error) throw error;
          
          toast({
            title: "Succès",
            description: "Secteur mis à jour avec succès",
          });
        } else {
          const { error } = await supabase
            .from('sectors')
            .insert([submitData]);

          if (error) throw error;
          
          toast({
            title: "Succès",
            description: "Secteur créé avec succès",
          });
        }
      } else {
        if (!formData.sector_id) {
          toast({
            title: "Erreur",
            description: "Le secteur est requis pour une brique",
            variant: "destructive",
          });
          return;
        }

        const submitData = { 
          name: formData.name.trim(),
          sector_id: formData.sector_id
        };

        if (editingItem) {
          const { error } = await supabase
            .from('bricks')
            .update(submitData)
            .eq('id', (editingItem as Brick).id);

          if (error) throw error;
          
          toast({
            title: "Succès",
            description: "Brique mise à jour avec succès",
          });
        } else {
          const { error } = await supabase
            .from('bricks')
            .insert([submitData]);

          if (error) throw error;
          
          toast({
            title: "Succès",
            description: "Brique créée avec succès",
          });
        }
      }

      setDialogOpen(false);
      setEditingItem(null);
      setFormData({ name: '', sector_id: '' });
      await fetchData();
      
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type: 'sector' | 'brick', item: Sector | Brick) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ce ${type === 'sector' ? 'secteur' : 'brique'} ?`)) {
      try {
        const { error } = await supabase
          .from(type === 'sector' ? 'sectors' : 'bricks')
          .delete()
          .eq('id', item.id);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: `${type === 'sector' ? 'Secteur' : 'Brique'} supprimé avec succès`,
        });
        await fetchData();
      } catch (error) {
        console.error('Error deleting:', error);
        toast({
          title: "Erreur",
          description: `Impossible de supprimer le ${type === 'sector' ? 'secteur' : 'brique'}`,
          variant: "destructive",
        });
      }
    }
  };

  const openDialog = (type: 'sector' | 'brick', item?: Sector | Brick) => {
    setDialogType(type);
    setEditingItem(item || null);
    
    if (item) {
      setFormData({
        name: item.name,
        sector_id: 'sector_id' in item ? item.sector_id || '' : '',
      });
    } else {
      setFormData({ name: '', sector_id: '' });
    }
    
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
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Secteurs et Briques</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="sectors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sectors">Secteurs</TabsTrigger>
            <TabsTrigger value="bricks">Briques</TabsTrigger>
          </TabsList>

          <TabsContent value="sectors">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Liste des Secteurs ({sectors.length})</CardTitle>
                    <CardDescription>Gérer les secteurs géographiques</CardDescription>
                  </div>
                  <Button onClick={() => openDialog('sector')} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Nouveau Secteur</span>
                  </Button>
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
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sectors.map((sector) => (
                        <TableRow key={sector.id}>
                          <TableCell className="font-medium">{sector.name}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDialog('sector', sector)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete('sector', sector)}
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
          </TabsContent>

          <TabsContent value="bricks">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Liste des Briques ({bricks.length})</CardTitle>
                    <CardDescription>Gérer les briques par secteur</CardDescription>
                  </div>
                  <Button onClick={() => openDialog('brick')} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Nouvelle Brique</span>
                  </Button>
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
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bricks.map((brick) => (
                        <TableRow key={brick.id}>
                          <TableCell className="font-medium">{brick.name}</TableCell>
                          <TableCell>{brick.sector?.name || 'N/A'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDialog('brick', brick)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete('brick', brick)}
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
          </TabsContent>
        </Tabs>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem 
                  ? `Modifier ${dialogType === 'sector' ? 'le Secteur' : 'la Brique'}`
                  : `Nouveau ${dialogType === 'sector' ? 'Secteur' : 'Brique'}`
                }
              </DialogTitle>
              <DialogDescription>
                {editingItem 
                  ? `Modifiez les informations du ${dialogType === 'sector' ? 'secteur' : 'brique'}`
                  : `Créez un nouveau ${dialogType === 'sector' ? 'secteur' : 'brique'}`
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              {dialogType === 'brick' && (
                <div className="space-y-2">
                  <Label htmlFor="sector_id">Secteur</Label>
                  <Select value={formData.sector_id} onValueChange={(value) => setFormData({ ...formData, sector_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un secteur" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map((sector) => (
                        <SelectItem key={sector.id} value={sector.id}>
                          {sector.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
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
    </div>
  );
};

export default SectorsBricksManager;
