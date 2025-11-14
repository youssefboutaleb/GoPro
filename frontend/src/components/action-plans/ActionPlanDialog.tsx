

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
import { apiService } from '@/services/apiService';
import { useAuth } from '@/hooks/useAuth';
import { ActionPlan, ActionType } from '@/types/backend';
import MultiSelect from './MultiSelect';
import { Separator } from '@/components/ui/separator';

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
  
  // Helper to get token
  const getToken = () => {
    try {
      const keycloak = (window as any).keycloak;
      if (keycloak?.token) return keycloak.token;
    } catch {}
    return undefined;
  };

  const [formData, setFormData] = useState({
    type: 'Staff' as ActionType,
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
      const token = getToken();
      const data = await apiService.getProducts(token);
      return (data || []).sort((a: any, b: any) => a.name.localeCompare(b.name))
        .map((p: any) => ({ id: p.id, label: p.name }));
    }
  });

  const { data: bricks, isLoading: bricksLoading } = useQuery({
    queryKey: ['bricks'],
    queryFn: async () => {
      const token = getToken();
      const data = await apiService.getBricks(token);
      return (data || []).sort((a: any, b: any) => a.name.localeCompare(b.name))
        .map((b: any) => ({ id: b.id, label: b.name }));
    }
  });

  const { data: doctors, isLoading: doctorsLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const token = getToken();
      const data = await apiService.getDoctors(token);
      return (data || []).sort((a: any, b: any) => a.lastName.localeCompare(b.lastName))
        .map((d: any) => ({ id: d.id, label: `${d.firstName} ${d.lastName}` }));
    }
  });

  const { data: delegates, isLoading: delegatesLoading } = useQuery({
    queryKey: ['delegates'],
    queryFn: async () => {
      const token = getToken();
      const data = await apiService.getProfilesByRole('Delegate', token);
      return (data || []).sort((a: any, b: any) => a.lastName.localeCompare(b.lastName))
        .map((d: any) => ({ id: d.id, label: `${d.firstName} ${d.lastName}` }));
    }
  });

  const { data: supervisors, isLoading: supervisorsLoading } = useQuery({
    queryKey: ['supervisors'],
    queryFn: async () => {
      const token = getToken();
      const data = await apiService.getProfilesByRole('Supervisor', token);
      return (data || []).sort((a: any, b: any) => a.lastName.localeCompare(b.lastName))
        .map((s: any) => ({ id: s.id, label: `${s.firstName} ${s.lastName}` }));
    }
  });

  const { data: salesDirectors, isLoading: salesDirectorsLoading } = useQuery({
    queryKey: ['sales-directors'],
    queryFn: async () => {
      const token = getToken();
      const data = await apiService.getProfilesByRole('Sales Director', token);
      return (data || []).sort((a: any, b: any) => a.lastName.localeCompare(b.lastName))
        .map((sd: any) => ({ id: sd.id, label: `${sd.firstName} ${sd.lastName}` }));
    }
  });

  useEffect(() => {
    if (actionPlan) {
      setFormData({
        type: actionPlan.type as ActionType,
        date: actionPlan.date,
        location: actionPlan.location,
        description: actionPlan.description || '',
        targeted_products: actionPlan.targetedProducts || [],
        targeted_bricks: actionPlan.targetedBricks || [],
        targeted_doctors: actionPlan.targetedDoctors || [],
        targeted_delegates: actionPlan.targetedDelegates || [],
        targeted_supervisors: actionPlan.targetedSupervisors || [],
        targeted_sales_directors: actionPlan.targetedSalesDirectors || [],
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
      const token = getToken();
      const actionPlanData = {
        type: formData.type,
        date: formData.date,
        location: formData.location,
        description: formData.description,
        targetedProducts: formData.targeted_products,
        targetedBricks: formData.targeted_bricks,
        targetedDoctors: formData.targeted_doctors,
        targetedDelegates: formData.targeted_delegates,
        targetedSupervisors: formData.targeted_supervisors,
        targetedSalesDirectors: formData.targeted_sales_directors,
        createdBy: user.id,
      };

      if (actionPlan) {
        await apiService.updateActionPlan(actionPlan.id, actionPlanData, token);
      } else {
        await apiService.createActionPlan(actionPlanData, token);
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
