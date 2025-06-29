
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, ArrowLeft } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import ActionPlanCard from './ActionPlanCard';
import ActionPlanDialog from './ActionPlanDialog';
import { Database } from '@/integrations/supabase/types';

type ActionPlan = Database['public']['Tables']['action_plans']['Row'];

interface ActionPlansListProps {
  onBack: () => void;
}

const ActionPlansList: React.FC<ActionPlansListProps> = ({ onBack }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedActionPlan, setSelectedActionPlan] = useState<ActionPlan | null>(null);

  const { data: actionPlans, isLoading } = useQuery({
    queryKey: ['action-plans', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('action_plans')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ActionPlan[];
    },
    enabled: !!user,
  });

  const filteredActionPlans = actionPlans?.filter(plan => {
    const matchesSearch = 
      plan.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plan.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || plan.type === filterType;
    
    const matchesStatus = filterStatus === 'all' || (() => {
      switch (filterStatus) {
        case 'pending':
          return plan.supervisor_status === 'Pending' || 
                 plan.sales_director_status === 'Pending' || 
                 plan.marketing_manager_status === 'Pending';
        case 'approved':
          return plan.supervisor_status === 'Approved' && 
                 plan.sales_director_status === 'Approved' && 
                 plan.marketing_manager_status === 'Approved';
        case 'rejected':
          return plan.supervisor_status === 'Rejected' || 
                 plan.sales_director_status === 'Rejected' || 
                 plan.marketing_manager_status === 'Rejected';
        case 'executed':
          return plan.is_executed === true;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesType && matchesStatus;
  }) || [];

  const handleEdit = (actionPlan: ActionPlan) => {
    setSelectedActionPlan(actionPlan);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this action plan?')) return;
    
    try {
      const { error } = await supabase
        .from('action_plans')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['action-plans'] });
    } catch (error) {
      console.error('Error deleting action plan:', error);
    }
  };

  const handleCreateNew = () => {
    setSelectedActionPlan(null);
    setDialogOpen(true);
  };

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ['action-plans'] });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading action plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Action Plans</h1>
                <p className="text-sm text-gray-600">
                  Manage and track your action plans
                </p>
              </div>
            </div>
            <Button onClick={handleCreateNew} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>New Action Plan</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by location or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="ePU">ePU</SelectItem>
                  <SelectItem value="Congress">Congress</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Gift">Gift</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="executed">Executed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Action Plans Grid */}
        {filteredActionPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActionPlans.map((actionPlan) => (
              <ActionPlanCard
                key={actionPlan.id}
                actionPlan={actionPlan}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">No action plans found</p>
              <Button
                onClick={handleCreateNew}
                className="mt-4"
                variant="outline"
              >
                Create your first action plan
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <ActionPlanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        actionPlan={selectedActionPlan}
        onSave={handleSave}
      />
    </div>
  );
};

export default ActionPlansList;
