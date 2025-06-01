
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { DoctorWithBrick, Doctor, Brick, DoctorFormData } from '@/types/doctor';

export const useDoctors = () => {
  const [doctors, setDoctors] = useState<DoctorWithBrick[]>([]);
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [loading, setLoading] = useState(true);

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

  const saveDoctor = async (formData: DoctorFormData, editingDoctor: Doctor | null) => {
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

      fetchDoctors();
      return true;
    } catch (error) {
      console.error('Error saving doctor:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le médecin",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteDoctor = async (doctor: Doctor) => {
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

  return {
    doctors,
    bricks,
    loading,
    saveDoctor,
    deleteDoctor,
  };
};
