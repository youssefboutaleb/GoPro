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

type Doctor = Database['public']['Tables']['doctors']['Row'];
type Brick = Database['public']['Tables']['bricks']['Row'];
type DoctorSpecialty = Database['public']['Enums']['doctor_specialty'];

// Extended type for doctor with joined brick data
type DoctorWithBrick = Doctor & {
  bricks?: Pick<Brick, 'name' | 'region'> | null;
};

interface DoctorsManagerProps {
  onBack: () => void;
}

const DoctorsManager: React.FC<DoctorsManagerProps> = ({ onBack }) => {
  const [doctors, setDoctors] = useState<DoctorWithBrick[]>([]);
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    specialty: 'generaliste' as DoctorSpecialty,
    brick_id: '',
    active: true,
  });

  useEffect(() => {
    fetchDoctors();
    fetchBricks();
  }, []);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          bricks (
            name,
            region
          )
        `)
        .order('last_name', { ascending: true });

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les médecins",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBricks = async () => {
    try {
      const { data, error } = await supabase
        .from('bricks')
        .select('*')
        .order('region', { ascending: true });

      if (error) throw error;
      setBricks(data || []);
    } catch (error) {
      console.error('Error fetching bricks:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        brick_id: formData.brick_id || null,
      };

      if (editingDoctor) {
        const { error } = await supabase
          .from('doctors')
          .update(submitData)
          .eq('id', editingDoctor.id);

        if (error) throw error;
        toast({
          title: "Succès",
          description: "Médecin mis à jour avec succès",
        });
      } else {
        const { error } = await supabase
          .from('doctors')
          .insert([submitData]);

        if (error) throw error;
        toast({
          title: "Succès",
          description: "Médecin créé avec succès",
        });
      }

      setDialogOpen(false);
      setEditingDoctor(null);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        specialty: 'generaliste',
        brick_id: '',
        active: true,
      });
      fetchDoctors();
    } catch (error) {
      console.error('Error saving doctor:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le médecin",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (doctor: Doctor) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le Dr ${doctor.first_name} ${doctor.last_name} ?`)) {
      try {
        const { error } = await supabase
          .from('doctors')
          .delete()
          .eq('id', doctor.id);

        if (error) throw error;
        toast({
          title: "Succès",
          description: "Médecin supprimé avec succès",
        });
        fetchDoctors();
      } catch (error) {
        console.error('Error deleting doctor:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le médecin",
          variant: "destructive",
        });
      }
    }
  };

  const openEditDialog = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      first_name: doctor.first_name,
      last_name: doctor.last_name,
      email: doctor.email || '',
      phone: doctor.phone || '',
      address: doctor.address || '',
      specialty: doctor.specialty,
      brick_id: doctor.brick_id || '',
      active: doctor.active ?? true,
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingDoctor(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      specialty: 'generaliste',
      brick_id: '',
      active: true,
    });
    setDialogOpen(true);
  };

  const specialtyLabels = {
    'generaliste': 'Généraliste',
    'cardiologue': 'Cardiologue',
    'pneumologue': 'Pneumologue',
    'interniste': 'Interniste',
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
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Médecins</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Liste des Médecins</CardTitle>
                <CardDescription>Gérer la base de données médicale</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateDialog} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Nouveau Médecin</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingDoctor ? 'Modifier le Médecin' : 'Nouveau Médecin'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingDoctor 
                        ? 'Modifiez les informations du médecin'
                        : 'Ajoutez un nouveau médecin à la base de données'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">Prénom</Label>
                        <Input
                          id="first_name"
                          value={formData.first_name}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          placeholder="Prénom"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Nom</Label>
                        <Input
                          id="last_name"
                          value={formData.last_name}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          placeholder="Nom"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@exemple.com"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="0123456789"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="specialty">Spécialité</Label>
                        <Select
                          value={formData.specialty}
                          onValueChange={(value) => setFormData({ ...formData, specialty: value as DoctorSpecialty })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir une spécialité" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(specialtyLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Adresse</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Adresse complète"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brick_id">Brick</Label>
                      <Select
                        value={formData.brick_id}
                        onValueChange={(value) => setFormData({ ...formData, brick_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir une brick" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Aucune brick</SelectItem>
                          {bricks.map((brick) => (
                            <SelectItem key={brick.id} value={brick.id}>
                              {brick.name} ({brick.region})
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
                    <TableHead>Nom</TableHead>
                    <TableHead>Spécialité</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Brick</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">
                        Dr {doctor.first_name} {doctor.last_name}
                      </TableCell>
                      <TableCell>{specialtyLabels[doctor.specialty]}</TableCell>
                      <TableCell>{doctor.email}</TableCell>
                      <TableCell>{doctor.phone}</TableCell>
                      <TableCell>
                        {doctor.bricks ? `${doctor.bricks.name} (${doctor.bricks.region})` : '-'}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          doctor.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {doctor.active ? 'Actif' : 'Inactif'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(doctor)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(doctor)}
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

export default DoctorsManager;
