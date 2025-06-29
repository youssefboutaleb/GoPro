
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/integrations/supabase/types';

type ActionPlan = Database['public']['Tables']['action_plans']['Row'];
type ActionTypes = Database['public']['Enums']['action_types'];

interface ActionPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionPlan?: ActionPlan | null;
  onSave: () => void;
}

const ActionPlanDialog: React.FC<ActionPlanDialogProps> = ({
  open,
  onOpenChange,
  actionPlan,
  onSave
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    type: 'Staff' as ActionTypes,
    date: '',
    location: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch dropdown data
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const { data: bricks } = useQuery({
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

  const { data: doctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select('id, first_name, last_name')
        .order('last_name');
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (actionPlan) {
      setFormData({
        type: actionPlan.type,
        date: actionPlan.date,
        location: actionPlan.location,
        description: actionPlan.description || '',
      });
    } else {
      setFormData({
        type: 'Staff',
        date: '',
        location: '',
        description: '',
      });
    }
  }, [actionPlan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const actionPlanData = {
        type: formData.type,
        date: formData.date,
        location: formData.location,
        description: formData.description,
        created_by: user.id,
      };

      if (actionPlan) {
        const { error } = await supabase
          .from('action_plans')
          .update(actionPlanData)
          .eq('id', actionPlan.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('action_plans')
          .insert([actionPlanData]);
        if (error) throw error;
      }

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving action plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {actionPlan ? 'Edit Action Plan' : 'Create New Action Plan'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: ActionTypes) => 
                  setFormData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="ePU">ePU</SelectItem>
                  <SelectItem value="Congress">Congress</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Gift">Gift</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Enter location"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter action plan description"
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : actionPlan ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ActionPlanDialog;
