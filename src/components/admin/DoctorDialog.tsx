
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface DoctorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor?: {
    id: string;
    name: string;
    first_name: string;
    specialty: string | null;
    brick_id: string | null;
  } | null;
}

const DoctorDialog: React.FC<DoctorDialogProps> = ({ open, onOpenChange, doctor }) => {
  const [formData, setFormData] = useState({
    name: '',
    first_name: '',
    specialty: '',
    brick_id: ''
  });

  const queryClient = useQueryClient();

  // Fetch bricks for selection
  const { data: bricks = [] } = useQuery({
    queryKey: ['bricks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bricks')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (doctor) {
      setFormData({
        name: doctor.name,
        first_name: doctor.first_name,
        specialty: doctor.specialty || '',
        brick_id: doctor.brick_id || 'no-brick'
      });
    } else {
      setFormData({
        name: '',
        first_name: '',
        specialty: '',
        brick_id: 'no-brick'
      });
    }
  }, [doctor]);

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('doctors')
        .insert({
          name: data.name,
          first_name: data.first_name,
          specialty: data.specialty || null,
          brick_id: data.brick_id === 'no-brick' ? null : data.brick_id
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      toast.success('Médecin créé avec succès');
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error creating doctor:', error);
      toast.error('Erreur lors de la création du médecin');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('doctors')
        .update({
          name: data.name,
          first_name: data.first_name,
          specialty: data.specialty || null,
          brick_id: data.brick_id === 'no-brick' ? null : data.brick_id
        })
        .eq('id', doctor!.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      toast.success('Médecin modifié avec succès');
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error updating doctor:', error);
      toast.error('Erreur lors de la modification du médecin');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.first_name.trim()) {
      toast.error('Le nom et le prénom sont obligatoires');
      return;
    }

    if (doctor) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {doctor ? 'Modifier le médecin' : 'Ajouter un médecin'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nom du médecin"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="first_name">Prénom *</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
              placeholder="Prénom du médecin"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="specialty">Spécialité</Label>
            <Input
              id="specialty"
              value={formData.specialty}
              onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
              placeholder="Spécialité du médecin"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="brick">Brick</Label>
            <Select value={formData.brick_id} onValueChange={(value) => setFormData(prev => ({ ...prev, brick_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un brick" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-brick">Aucun brick</SelectItem>
                {bricks.map(brick => (
                  <SelectItem key={brick.id} value={brick.id}>{brick.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {doctor ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DoctorDialog;
