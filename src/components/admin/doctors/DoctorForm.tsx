
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DoctorFormData, Brick, specialtyLabels, DoctorSpecialty } from '@/types/doctor';

interface DoctorFormProps {
  formData: DoctorFormData;
  setFormData: (data: DoctorFormData) => void;
  bricks: Brick[];
  loading: boolean;
  isEditing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const DoctorForm: React.FC<DoctorFormProps> = ({
  formData,
  setFormData,
  bricks,
  loading,
  isEditing,
  onSubmit,
  onCancel,
}) => {
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? 'Modifier le Médecin' : 'Nouveau Médecin'}
        </DialogTitle>
        <DialogDescription>
          {isEditing 
            ? 'Modifiez les informations du médecin'
            : 'Ajoutez un nouveau médecin à la base de données'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4">
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
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default DoctorForm;
