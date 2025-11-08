

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
import MultiSelect from './MultiSelect';
import { Separator } from '@/components/ui/separator';

type ActionPlan = Database['public']['Tables']['action_plans']['Row'];
type ActionTypes = Database['public']['Enums']['action_types'];
type ActionStatus = Database['public']['Enums']['action_status'];

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
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({
    type: 'Staff' as ActionTypes,
    date: '',
    location: '',
    description: '',
    targeted_products: [] as string[],
    targeted_bricks: [] as string[],
    targeted_doctors: [] as string[],
    targeted_delegates: [] as string[],
    targeted_supervisors: [] as string[],
    targeted_sales_directors: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch dropdown data
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data.map(p => ({ id: p.id, label: p.name }));
    }
  });

  const { data: bricks, isLoading: bricksLoading } = useQuery({
    queryKey: ['bricks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bricks')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data.map(b => ({ id: b.id, label: b.name }));
    }
  });

  const { data: doctors, isLoading: doctorsLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select('id, first_name, last_name')
        .order('last_name');
      if (error) throw error;
      return data.map(d => ({ id: d.id, label: `${d.first_name} ${d.last_name}` }));
    }
  });

  const { data: delegates, isLoading: delegatesLoading } = useQuery({
    queryKey: ['delegates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('role', 'Delegate')
        .order('last_name');
      if (error) throw error;
      return data.map(d => ({ id: d.id, label: `${d.first_name} ${d.last_name}` }));
    }
  });

  const { data: supervisors, isLoading: supervisorsLoading } = useQuery({
    queryKey: ['supervisors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('role', 'Supervisor')
        .order('last_name');
      if (error) throw error;
      return data.map(s => ({ id: s.id, label: `${s.first_name} ${s.last_name}` }));
    }
  });

  const { data: salesDirectors, isLoading: salesDirectorsLoading } = useQuery({
    queryKey: ['sales-directors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('role', 'Sales Director')
        .order('last_name');
      if (error) throw error;
      return data.map(sd => ({ id: sd.id, label: `${sd.first_name} ${sd.last_name}` }));
    }
  });

  useEffect(() => {
    if (actionPlan) {
      setFormData({
        type: actionPlan.type,
        date: actionPlan.date,
        location: actionPlan.location,
        description: actionPlan.description || '',
        targeted_products: actionPlan.targeted_products || [],
        targeted_bricks: actionPlan.targeted_bricks || [],
        targeted_doctors: actionPlan.targeted_doctors || [],
        targeted_delegates: actionPlan.targeted_delegates || [],
        targeted_supervisors: actionPlan.targeted_supervisors || [],
        targeted_sales_directors: actionPlan.targeted_sales_directors || [],
      });
    } else {
      setFormData({
        type: 'Staff',
        date: '',
        location: '',
        description: '',
        targeted_products: [],
        targeted_bricks: [],
        targeted_doctors: [],
        targeted_delegates: [],
        targeted_supervisors: [],
        targeted_sales_directors: [],
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
        targeted_products: formData.targeted_products,
        targeted_bricks: formData.targeted_bricks,
        targeted_doctors: formData.targeted_doctors,
        targeted_delegates: formData.targeted_delegates,
        targeted_supervisors: formData.targeted_supervisors,
        targeted_sales_directors: formData.targeted_sales_directors,
        created_by: user.id,
        // Auto-approve based on role
        supervisor_status: (profile?.role === 'Supervisor' ? 'Approved' : 'Pending') as ActionStatus,
        sales_director_status: (profile?.role === 'Sales Director' ? 'Approved' : 'Pending') as ActionStatus,
      };

      if (actionPlan) {
        // When editing, preserve existing approvals unless it's the creator's own plan
        const updateData = {
          ...actionPlanData,
          supervisor_status: (profile?.role === 'Supervisor' && actionPlan.created_by === user.id) 
            ? 'Approved' as ActionStatus
            : actionPlan.supervisor_status,
          sales_director_status: (profile?.role === 'Sales Director' && actionPlan.created_by === user.id)
            ? 'Approved' as ActionStatus
            : actionPlan.sales_director_status,
        };
        
        const { error } = await supabase
          .from('action_plans')
          .update(updateData)
          .eq('id', actionPlan.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('action_plans')
          .insert(actionPlanData);
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {actionPlan ? 'Edit Action Plan' : 'Create New Action Plan'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
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
          </div>

          <Separator />

          {/* Targeting Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Targeting</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MultiSelect
                label="Target Products"
                placeholder="Select products"
                options={products || []}
                value={formData.targeted_products}
                onChange={(value) => setFormData(prev => ({ ...prev, targeted_products: value }))}
                isLoading={productsLoading}
              />

              <MultiSelect
                label="Target Bricks"
                placeholder="Select bricks"
                options={bricks || []}
                value={formData.targeted_bricks}
                onChange={(value) => setFormData(prev => ({ ...prev, targeted_bricks: value }))}
                isLoading={bricksLoading}
              />

              <MultiSelect
                label="Target Doctors"
                placeholder="Select doctors"
                options={doctors || []}
                value={formData.targeted_doctors}
                onChange={(value) => setFormData(prev => ({ ...prev, targeted_doctors: value }))}
                isLoading={doctorsLoading}
              />

              <MultiSelect
                label="Target Delegates"
                placeholder="Select delegates"
                options={delegates || []}
                value={formData.targeted_delegates}
                onChange={(value) => setFormData(prev => ({ ...prev, targeted_delegates: value }))}
                isLoading={delegatesLoading}
              />

              <MultiSelect
                label="Target Supervisors"
                placeholder="Select supervisors"
                options={supervisors || []}
                value={formData.targeted_supervisors}
                onChange={(value) => setFormData(prev => ({ ...prev, targeted_supervisors: value }))}
                isLoading={supervisorsLoading}
              />

              <MultiSelect
                label="Target Sales Directors"
                placeholder="Select sales directors"
                options={salesDirectors || []}
                value={formData.targeted_sales_directors}
                onChange={(value) => setFormData(prev => ({ ...prev, targeted_sales_directors: value }))}
                isLoading={salesDirectorsLoading}
              />
            </div>
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
