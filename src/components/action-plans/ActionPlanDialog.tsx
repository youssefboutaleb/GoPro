
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';
import { Badge } from '@/components/ui/badge';

type ActionPlan = Tables<'action_plans'>;
type Product = Tables<'products'>;
type Brick = Tables<'bricks'>;
type Doctor = Tables<'doctors'>;

interface ActionPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionPlan?: ActionPlan | null;
}

const ActionPlanDialog: React.FC<ActionPlanDialogProps> = ({ open, onOpenChange, actionPlan }) => {
  const [formData, setFormData] = useState({
    type: '',
    date: '',
    location: '',
    targeted_products: [] as string[],
    targeted_bricks: [] as string[],
    targeted_doctors: [] as string[],
    description: '',
  });
  
  const queryClient = useQueryClient();

  // Load data for selections
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (error) throw error;
      return data as Product[];
    },
  });

  const { data: bricks } = useQuery({
    queryKey: ['bricks'],
    queryFn: async () => {
      const { data, error } = await supabase.from('bricks').select('*').order('name');
      if (error) throw error;
      return data as Brick[];
    },
  });

  const { data: doctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const { data, error } = await supabase.from('doctors').select('*').order('first_name');
      if (error) throw error;
      return data as Doctor[];
    },
  });

  useEffect(() => {
    if (actionPlan) {
      setFormData({
        type: actionPlan.type,
        date: actionPlan.date,
        location: actionPlan.location,
        targeted_products: actionPlan.targeted_products || [],
        targeted_bricks: actionPlan.targeted_bricks || [],
        targeted_doctors: actionPlan.targeted_doctors || [],
        description: actionPlan.description || '',
      });
    } else {
      setFormData({
        type: '',
        date: '',
        location: '',
        targeted_products: [],
        targeted_bricks: [],
        targeted_doctors: [],
        description: '',
      });
    }
  }, [actionPlan]);

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('action_plans')
        .insert({
          type: data.type,
          date: data.date,
          location: data.location,
          targeted_products: data.targeted_products,
          targeted_bricks: data.targeted_bricks,
          targeted_doctors: data.targeted_doctors,
          description: data.description,
          created_by: (await supabase.auth.getUser()).data.user?.id!,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action_plans'] });
      onOpenChange(false);
      toast.success('Action plan created successfully');
    },
    onError: (error) => {
      console.error('Error creating action plan:', error);
      toast.error('Error creating action plan');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!actionPlan) return;
      
      const { error } = await supabase
        .from('action_plans')
        .update({
          type: data.type,
          date: data.date,
          location: data.location,
          targeted_products: data.targeted_products,
          targeted_bricks: data.targeted_bricks,
          targeted_doctors: data.targeted_doctors,
          description: data.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', actionPlan.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action_plans'] });
      onOpenChange(false);
      toast.success('Action plan updated successfully');
    },
    onError: (error) => {
      console.error('Error updating action plan:', error);
      toast.error('Error updating action plan');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.date || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (actionPlan) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleArraySelection = (field: 'targeted_products' | 'targeted_bricks' | 'targeted_doctors', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {actionPlan ? 'Edit Action Plan' : 'Create Action Plan'}
          </DialogTitle>
          <DialogDescription>
            {actionPlan ? 'Modify the action plan details.' : 'Create a new action plan.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="ePU">ePU</SelectItem>
                  <SelectItem value="congress">Congress</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="gift">Gift</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Products</Label>
              <div className="col-span-3 space-y-2">
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                  {products?.map((product) => (
                    <label key={product.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.targeted_products.includes(product.id)}
                        onChange={() => handleArraySelection('targeted_products', product.id)}
                      />
                      <span className="text-sm">{product.name}</span>
                    </label>
                  ))}
                </div>
                {formData.targeted_products.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {formData.targeted_products.map(productId => {
                      const product = products?.find(p => p.id === productId);
                      return product ? (
                        <Badge key={productId} variant="secondary" className="text-xs">
                          {product.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Bricks</Label>
              <div className="col-span-3 space-y-2">
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                  {bricks?.map((brick) => (
                    <label key={brick.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.targeted_bricks.includes(brick.id)}
                        onChange={() => handleArraySelection('targeted_bricks', brick.id)}
                      />
                      <span className="text-sm">{brick.name}</span>
                    </label>
                  ))}
                </div>
                {formData.targeted_bricks.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {formData.targeted_bricks.map(brickId => {
                      const brick = bricks?.find(b => b.id === brickId);
                      return brick ? (
                        <Badge key={brickId} variant="secondary" className="text-xs">
                          {brick.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Doctors</Label>
              <div className="col-span-3 space-y-2">
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                  {doctors?.map((doctor) => (
                    <label key={doctor.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.targeted_doctors.includes(doctor.id)}
                        onChange={() => handleArraySelection('targeted_doctors', doctor.id)}
                      />
                      <span className="text-sm">{doctor.first_name} {doctor.last_name}</span>
                    </label>
                  ))}
                </div>
                {formData.targeted_doctors.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {formData.targeted_doctors.map(doctorId => {
                      const doctor = doctors?.find(d => d.id === doctorId);
                      return doctor ? (
                        <Badge key={doctorId} variant="secondary" className="text-xs">
                          {doctor.first_name} {doctor.last_name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : actionPlan ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ActionPlanDialog;
