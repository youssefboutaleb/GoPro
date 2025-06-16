
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductsManagerProps {
  onBack: () => void;
}

const ProductsManager: React.FC<ProductsManagerProps> = ({ onBack }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    therapeutic_class: '',
    active: true,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits",
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
        description: "Le nom du produit est requis",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        name: formData.name.trim(),
        therapeutic_class: formData.therapeutic_class.trim() || null,
        active: formData.active,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(submitData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Produit mis à jour avec succès",
        });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([submitData]);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Produit créé avec succès",
        });
      }

      setDialogOpen(false);
      setEditingProduct(null);
      setFormData({ name: '', therapeutic_class: '', active: true });
      await fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le produit",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le produit "${product.name}" ?`)) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', product.id);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Produit supprimé avec succès",
        });
        await fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le produit",
          variant: "destructive",
        });
      }
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      therapeutic_class: product.therapeutic_class || '',
      active: product.active ?? true,
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingProduct(null);
    setFormData({ name: '', therapeutic_class: '', active: true });
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
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Produits</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Liste des Produits</CardTitle>
                <CardDescription>Gérer le catalogue produits</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateDialog} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Nouveau Produit</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? 'Modifier le Produit' : 'Nouveau Produit'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingProduct 
                        ? 'Modifiez les informations du produit'
                        : 'Créez un nouveau produit'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom du produit</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Aspirine"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="therapeutic_class">Classe thérapeutique</Label>
                      <Input
                        id="therapeutic_class"
                        value={formData.therapeutic_class}
                        onChange={(e) => setFormData({ ...formData, therapeutic_class: e.target.value })}
                        placeholder="Ex: Antalgique"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="active"
                        checked={formData.active}
                        onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                      />
                      <Label htmlFor="active">Produit actif</Label>
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
                    <TableHead>Classe thérapeutique</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.therapeutic_class || 'N/A'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.active ? 'Actif' : 'Inactif'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product)}
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

export default ProductsManager;
