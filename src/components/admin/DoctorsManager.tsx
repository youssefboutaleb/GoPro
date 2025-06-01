
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus } from 'lucide-react';
import { Doctor, DoctorFormData } from '@/types/doctor';
import DoctorForm from './doctors/DoctorForm';
import DoctorsTable from './doctors/DoctorsTable';
import { useDoctors } from './doctors/useDoctors';

interface DoctorsManagerProps {
  onBack: () => void;
}

const DoctorsManager: React.FC<DoctorsManagerProps> = ({ onBack }) => {
  const { doctors, bricks, loading, saveDoctor, deleteDoctor } = useDoctors();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState<DoctorFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    specialty: 'generaliste',
    brick_id: '',
    active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveDoctor(formData, editingDoctor);
    if (success) {
      setDialogOpen(false);
      setEditingDoctor(null);
      resetForm();
    }
  };

  const resetForm = () => {
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
    resetForm();
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
                <DoctorForm
                  formData={formData}
                  setFormData={setFormData}
                  bricks={bricks}
                  loading={loading}
                  isEditing={!!editingDoctor}
                  onSubmit={handleSubmit}
                  onCancel={() => setDialogOpen(false)}
                />
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <DoctorsTable
              doctors={doctors}
              loading={loading}
              onEdit={openEditDialog}
              onDelete={deleteDoctor}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorsManager;
