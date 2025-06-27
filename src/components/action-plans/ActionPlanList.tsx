
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import ActionPlanDialog from './ActionPlanDialog';
import ActionPlanStatusCircles from './ActionPlanStatusCircles';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';

type ActionPlan = Tables<'action_plans'>;

const ActionPlanList: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedActionPlan, setSelectedActionPlan] = useState<ActionPlan | null>(null);
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  const { data: actionPlans, isLoading } = useQuery({
    queryKey: ['action_plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('action_plans')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ActionPlan[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('action_plans')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action_plans'] });
      toast.success('Action plan deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting action plan:', error);
      toast.error('Error deleting action plan');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, field, status }: { id: string; field: string; status: string }) => {
      const { error } = await supabase
        .from('action_plans')
        .update({ [field]: status, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action_plans'] });
      toast.success('Status updated successfully');
    },
    onError: (error) => {
      console.error('Error updating status:', error);
      toast.error('Error updating status');
    },
  });

  const handleCreate = () => {
    setSelectedActionPlan(null);
    setDialogOpen(true);
  };

  const handleEdit = (actionPlan: ActionPlan) => {
    setSelectedActionPlan(actionPlan);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this action plan?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleStatusUpdate = (id: string, field: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'pending' ? 'approved' : 
                      currentStatus === 'approved' ? 'rejected' : 'pending';
    updateStatusMutation.mutate({ id, field, status: nextStatus });
  };

  const canUpdateStatus = (role: string | undefined) => {
    return role === 'Admin' || role === 'Supervisor' || role === 'Sales Director';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading action plans...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Action Plans</h2>
          <p className="text-gray-600">Manage and track action plans</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Create Action Plan
        </Button>
      </div>

      <div className="grid gap-4">
        {actionPlans?.map((actionPlan) => (
          <Card key={actionPlan.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {actionPlan.type}
                    </Badge>
                    {actionPlan.location}
                  </CardTitle>
                  <CardDescription>
                    {formatDate(actionPlan.date)} • Created {formatDate(actionPlan.created_at)}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(actionPlan)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(actionPlan.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {actionPlan.description && (
                  <p className="text-gray-700">{actionPlan.description}</p>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    {actionPlan.targeted_products && actionPlan.targeted_products.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Products: </span>
                        <span className="text-sm text-gray-600">
                          {actionPlan.targeted_products.length} selected
                        </span>
                      </div>
                    )}
                    {actionPlan.targeted_bricks && actionPlan.targeted_bricks.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Bricks: </span>
                        <span className="text-sm text-gray-600">
                          {actionPlan.targeted_bricks.length} selected
                        </span>
                      </div>
                    )}
                    {actionPlan.targeted_doctors && actionPlan.targeted_doctors.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Doctors: </span>
                        <span className="text-sm text-gray-600">
                          {actionPlan.targeted_doctors.length} selected
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {canUpdateStatus(profile?.role) && !actionPlan.is_executed && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(actionPlan.id, 'supervisor_status', actionPlan.supervisor_status!)}
                        >
                          Toggle S
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(actionPlan.id, 'sales_director_status', actionPlan.sales_director_status!)}
                        >
                          Toggle DV
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(actionPlan.id, 'marketing_manager_status', actionPlan.marketing_manager_status!)}
                        >
                          Toggle M
                        </Button>
                      </div>
                    )}
                    
                    <ActionPlanStatusCircles
                      supervisorStatus={actionPlan.supervisor_status!}
                      salesDirectorStatus={actionPlan.sales_director_status!}
                      marketingManagerStatus={actionPlan.marketing_manager_status!}
                      isExecuted={actionPlan.is_executed!}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {actionPlans?.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No action plans found. Create your first action plan!</p>
            </CardContent>
          </Card>
        )}
      </div>

      <ActionPlanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        actionPlan={selectedActionPlan}
      />
    </div>
  );
};

export default ActionPlanList;
