
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { VisitWithJoins, Visit, Doctor, VisitFormData } from '@/types/visit';

export const useVisits = () => {
  const { user } = useAuth();
  const [visits, setVisits] = useState<VisitWithJoins[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisits();
    fetchDoctors();
  }, []);

  const fetchVisits = async () => {
    try {
      const { data, error } = await supabase
        .from('visits')
        .select(`
          *,
          doctors (
            first_name,
            last_name,
            specialty
          ),
          profiles (
            first_name,
            last_name
          )
        `)
        .order('visit_date', { ascending: false });

      if (error) throw error;
      setVisits(data || []);
    } catch (error) {
      console.error('Error fetching visits:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les visites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('active', true)
        .order('last_name', { ascending: true });

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const saveVisit = async (formData: VisitFormData, editingVisit: Visit | null) => {
    setLoading(true);

    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer une visite",
        variant: "destructive",
      });
      setLoading(false);
      return false;
    }

    try {
      const submitData = {
        ...formData,
        user_id: user.id,
      };

      if (editingVisit) {
        const { error } = await supabase
          .from('visits')
          .update(formData)
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

      fetchVisits();
      return true;
    } catch (error) {
      console.error('Error saving visit:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la visite",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteVisit = async (visit: Visit) => {
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
        fetchVisits();
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

  return {
    visits,
    doctors,
    loading,
    saveVisit,
    deleteVisit,
  };
};
