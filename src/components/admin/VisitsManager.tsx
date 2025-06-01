
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus } from 'lucide-react';
import { Visit, VisitFormData } from '@/types/visit';
import VisitForm from './visits/VisitForm';
import VisitsTable from './visits/VisitsTable';
import { useVisits } from './visits/useVisits';

interface VisitsManagerProps {
  onBack: () => void;
}

const VisitsManager: React.FC<VisitsManagerProps> = ({ onBack }) => {
  const { visits, doctors, loading, saveVisit, deleteVisit } = useVisits();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [formData, setFormData] = useState<VisitFormData>({
    doctor_id: '',
    visit_date: '',
    status: 'planifiee',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveVisit(formData, editingVisit);
    if (success) {
      setDialogOpen(false);
      setEditingVisit(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      doctor_id: '',
      visit_date: '',
      status: 'planifiee',
      notes: '',
    });
  };

  const openEditDialog = (visit: Visit) => {
    setEditingVisit(visit);
    setFormData({
      doctor_id: visit.doctor_id,
      visit_date: visit.visit_date,
      status: visit.status || 'planifiee',
      notes: visit.notes || '',
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingVisit(null);
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
                <CardDescription>Planifier et suivre les visites</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateDialog} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Nouvelle Visite</span>
                  </Button>
                </DialogTrigger>
                <VisitForm
                  formData={formData}
                  setFormData={setFormData}
                  doctors={doctors}
                  loading={loading}
                  isEditing={!!editingVisit}
                  onSubmit={handleSubmit}
                  onCancel={() => setDialogOpen(false)}
                />
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <VisitsTable
              visits={visits}
              loading={loading}
              onEdit={openEditDialog}
              onDelete={deleteVisit}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VisitsManager;
