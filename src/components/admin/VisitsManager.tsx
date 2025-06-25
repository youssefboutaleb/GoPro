import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Visit = Database['public']['Tables']['visits']['Row'] & {
  visit_plan?: {
    doctor?: { last_name: string; first_name: string };
    delegate?: { last_name: string; first_name: string };
  };
  brick?: { name: string };
};

type Doctor = Database['public']['Tables']['doctors']['Row'];
type VisitPlan = Database['public']['Tables']['visit_plans']['Row'] & {
  doctor?: { last_name: string; first_name: string };
  delegate?: { last_name: string; first_name: string };
};

interface VisitsManagerProps {
  onBack: () => void;
}

const VisitsManager: React.FC<VisitsManagerProps> = ({ onBack }) => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [visitPlans, setVisitPlans] = useState<VisitPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [formData, setFormData] = useState({
    visit_date: '',
    visit_plan_id: '',
  });

  // Delegate colors for grouping
  const delegateColors = [
    'bg-blue-50 border-l-4 border-blue-400',
    'bg-green-50 border-l-4 border-green-400', 
    'bg-purple-50 border-l-4 border-purple-400',
    'bg-orange-50 border-l-4 border-orange-400',
    'bg-pink-50 border-l-4 border-pink-400',
    'bg-indigo-50 border-l-4 border-indigo-400',
    'bg-yellow-50 border-l-4 border-yellow-400',
    'bg-red-50 border-l-4 border-red-400'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching ALL visits for admin...');
      
      // Fetch ALL visits - admin should see everyone's visits  
      const { data: visitsData, error: visitsError } = await supabase
        .from('visits')
        .select('*')
        .order('visit_date', { ascending: false });

      if (visitsError) throw visitsError;

      // Fetch doctors
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('doctors')
        .select('*')
        .order('last_name', { ascending: true });

      if (doctorsError) throw doctorsError;

      // Fetch ALL visit_plans - admin should see all
      const { data: visitPlansData, error: visitPlansError } = await supabase
        .from('visit_plans')
        .select('*')
        .order('id', { ascending: true });

      if (visitPlansError) throw visitPlansError;

      // Fetch ALL profiles - admin should see all delegates
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name');

      if (profilesError) throw profilesError;

      // Fetch bricks information
      const { data: bricksData, error: bricksError } = await supabase
        .from('bricks')
        .select('*');

      if (bricksError) throw bricksError;

      // Enrich visit plans with doctor and delegate information
      const visitPlansWithDetails = visitPlansData?.map(plan => {
        const doctor = doctorsData?.find(d => d.id === plan.doctor_id);
        const delegate = profilesData?.find(p => p.id === plan.delegate_id);
        
        return {
          ...plan,
          doctor: doctor ? { 
            last_name: doctor.last_name, 
            first_name: doctor.first_name 
          } : null,
          delegate: delegate ? { 
            last_name: delegate.last_name, 
            first_name: delegate.first_name 
          } : null
        };
      }) || [];

      // Enrich visits with complete information including brick and delegate from visit_plan
      const visitsWithDetails = await Promise.all(
        (visitsData || []).map(async (visit) => {
          const visitPlan = visitPlansWithDetails.find(vp => vp.id === visit.visit_plan_id);
          
          // Get brick information from doctor
          let brick = null;
          if (visitPlan?.doctor_id) {
            const doctor = doctorsData?.find(d => d.id === visitPlan.doctor_id);
            if (doctor?.brick_id) {
              brick = bricksData?.find(b => b.id === doctor.brick_id);
            }
          }

          return {
            ...visit,
            visit_plan: visitPlan ? {
              doctor: visitPlan.doctor,
              delegate: visitPlan.delegate
            } : null,
            brick: brick ? { name: brick.name } : null
          };
        })
      );

      console.log('Enriched visits with details:', visitsWithDetails);

      setVisits(visitsWithDetails);
      setDoctors(doctorsData || []);
      setVisitPlans(visitPlansWithDetails);
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
    
    if (!formData.visit_date || !formData.visit_plan_id) {
      toast({
        title: "Erreur",
        description: "Tous les champs sont requis",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        visit_date: formData.visit_date,
        visit_plan_id: formData.visit_plan_id,
      };

      if (editingVisit) {
        const { error } = await supabase
          .from('visits')
          .update(submitData)
          .eq('id', editingVisit.id);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Visite mise à jour avec succès",
        });
      } else {
        const { error } = await supabase
          .from('visits')
          .insert([submitData]);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Visite créée avec succès",
        });
      }

      setDialogOpen(false);
      setEditingVisit(null);
      setFormData({ visit_date: '', visit_plan_id: '' });
      await fetchData();
    } catch (error) {
      console.error('Error saving visit:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la visite",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (visit: Visit) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer cette visite ?`)) {
      try {
        const { error } = await supabase
          .from('visits')
          .delete()
          .eq('id', visit.id);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Visite supprimée avec succès",
        });
        await fetchData();
      } catch (error) {
        console.error('Error deleting visit:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer la visite",
          variant: "destructive",
        });
      }
    }
  };

  const openEditDialog = (visit: Visit) => {
    setEditingVisit(visit);
    setFormData({
      visit_date: visit.visit_date,
      visit_plan_id: visit.visit_plan_id || '',
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingVisit(null);
    setFormData({ visit_date: '', visit_plan_id: '' });
    setDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Group visits by delegate for color coding
  const getVisitsGroupedByDelegate = () => {
    const grouped = visits.reduce((acc, visit) => {
      const delegateName = visit.visit_plan?.delegate ? 
        `${visit.visit_plan.delegate.first_name} ${visit.visit_plan.delegate.last_name}` : 
        'Non assigné';
      
      if (!acc[delegateName]) {
        acc[delegateName] = [];
      }
      acc[delegateName].push(visit);
      return acc;
    }, {} as Record<string, Visit[]>);

    return grouped;
  };

  const getDelegateColor = (delegateName: string, delegateIndex: number) => {
    return delegateColors[delegateIndex % delegateColors.length];
  };

  const groupedVisits = getVisitsGroupedByDelegate();
  const delegateNames = Object.keys(groupedVisits);

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
                <CardTitle>Liste des Visites ({visits.length})</CardTitle>
                <CardDescription>Planifier et suivre les visites médicales - Groupées par délégué</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateDialog} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Nouvelle Visite</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingVisit ? 'Modifier la Visite' : 'Nouvelle Visite'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingVisit 
                        ? 'Modifiez les informations de la visite'
                        : 'Planifiez une nouvelle visite médicale'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
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
                      <Label htmlFor="visit_plan_id">Plan de visite</Label>
                      <Select value={formData.visit_plan_id} onValueChange={(value) => setFormData({ ...formData, visit_plan_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un plan de visite" />
                        </SelectTrigger>
                        <SelectContent>
                          {visitPlans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.doctor && plan.delegate ? 
                                `Dr. ${plan.doctor.first_name} ${plan.doctor.last_name} - ${plan.delegate.first_name} ${plan.delegate.last_name}` :
                                `Plan ${plan.id}`
                              }
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
              <div className="overflow-x-auto space-y-6">
                {delegateNames.map((delegateName, delegateIndex) => (
                  <div key={delegateName} className={`rounded-lg p-4 ${getDelegateColor(delegateName, delegateIndex)}`}>
                    <h3 className="font-semibold text-lg mb-3 text-gray-800">
                      {delegateName} ({groupedVisits[delegateName].length} visites)
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Médecin</TableHead>
                          <TableHead>Brique</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupedVisits[delegateName].map((visit) => (
                          <TableRow key={visit.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span>{formatDate(visit.visit_date)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {visit.visit_plan?.doctor ? 
                                `Dr. ${visit.visit_plan.doctor.first_name} ${visit.visit_plan.doctor.last_name}` : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {visit.brick?.name || 'N/A'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditDialog(visit)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(visit)}
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
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VisitsManager;
