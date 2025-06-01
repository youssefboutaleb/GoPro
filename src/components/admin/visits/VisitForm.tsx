
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VisitFormData, Doctor, statusLabels, VisitStatus } from '@/types/visit';

interface VisitFormProps {
  formData: VisitFormData;
  setFormData: (data: VisitFormData) => void;
  doctors: Doctor[];
  loading: boolean;
  isEditing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const VisitForm: React.FC<VisitFormProps> = ({
  formData,
  setFormData,
  doctors,
  loading,
  isEditing,
  onSubmit,
  onCancel,
}) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? 'Modifier la Visite' : 'Nouvelle Visite'}
        </DialogTitle>
        <DialogDescription>
          {isEditing 
            ? 'Modifiez les informations de la visite'
            : 'Planifiez une nouvelle visite médicale'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4">
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

export default VisitForm;
