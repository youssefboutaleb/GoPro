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
import { Plus, Search, ArrowLeft, Users, User, UserCheck, Building, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActionPlans } from '@/hooks/useActionPlans';
import { useActionPlanCategories } from '@/hooks/useActionPlanCategories';
import ActionPlanCard from './ActionPlanCard';
import ActionPlanDialog from './ActionPlanDialog';
import { Database } from '@/integrations/supabase/types';

type ActionPlan = Database['public']['Tables']['action_plans']['Row'] & {
  creator?: {
    id: string;
    first_name: string;
    last_name: string;
    role: string;
  };
};

interface ActionPlansListProps {
  onBack: () => void;
}

const ActionPlansList: React.FC<ActionPlansListProps> = ({ onBack }) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCreator, setFilterCreator] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedActionPlan, setSelectedActionPlan] = useState<ActionPlan | null>(null);

  // Use the new efficient hooks
  const { data: actionPlans, isLoading } = useActionPlans();
  const groupedPlans = useActionPlanCategories(actionPlans);

  // Mutation for updating supervisor status to Approved
  const approvePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from('action_plans')
        .update({ supervisor_status: 'Approved' })
        .eq('id', planId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action-plans'] });
    },
  });

  // Mutation for updating supervisor status to Rejected
  const rejectPlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from('action_plans')
        .update({ supervisor_status: 'Rejected' })
        .eq('id', planId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action-plans'] });
    },
  });

  // Mutation for updating sales director status to Approved
  const approveSalesDirectorPlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from('action_plans')
        .update({ sales_director_status: 'Approved' })
        .eq('id', planId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action-plans'] });
    },
  });

  // Mutation for updating sales director status to Rejected
  const rejectSalesDirectorPlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from('action_plans')
        .update({ sales_director_status: 'Rejected' })
        .eq('id', planId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action-plans'] });
    },
  });

  // Helper functions for filtering
  const isOwnPlan = (plan: ActionPlan) => plan.created_by === profile?.id;
  
  const handleApprove = async (planId: string) => {
    if (!window.confirm('Are you sure you want to approve this action plan?')) return;
    if (profile?.role === 'Sales Director') {
      approveSalesDirectorPlanMutation.mutate(planId);
    } else {
      approvePlanMutation.mutate(planId);
    }
  };

  const handleReject = async (planId: string) => {
    if (!window.confirm('Are you sure you want to reject this action plan?')) return;
    if (profile?.role === 'Sales Director') {
      rejectSalesDirectorPlanMutation.mutate(planId);
    } else {
      rejectPlanMutation.mutate(planId);
    }
  };

  const filteredActionPlans = actionPlans?.filter(plan => {
    const matchesSearch = 
      plan.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plan.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plan.creator ? `${plan.creator.first_name} ${plan.creator.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) : false);
    
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

    const matchesCreator = filterCreator === 'all' || (() => {
      switch (filterCreator) {
        case 'me':
          return isOwnPlan(plan);
        case 'involving_me':
          return groupedPlans.involvingMe.includes(plan);
        case 'delegate_plans':
          return groupedPlans.delegatePlans.includes(plan);
        case 'supervisor_plans':
          return groupedPlans.supervisorPlans.includes(plan);
        default:
          return true;
      }
    })();

    return matchesSearch && matchesType && matchesStatus && matchesCreator;
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

  const renderPlanSection = (title: string, plans: ActionPlan[], icon: React.ReactNode, emptyMessage: string, showApprovalButtons = false) => {
    if (plans.length === 0) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 border-b pb-2">
          {icon}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <span className="text-sm text-gray-500">({plans.length})</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((actionPlan) => {
            // Determine if this plan needs approval from current user
            const needsApproval = showApprovalButtons && (
              (profile?.role === 'Supervisor' && actionPlan.supervisor_status === 'Pending') ||
              (profile?.role === 'Sales Director' && actionPlan.sales_director_status === 'Pending')
            );

            return (
              <ActionPlanCard
                key={actionPlan.id}
                actionPlan={actionPlan}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onApprove={handleApprove}
                onReject={handleReject}
                canEdit={isOwnPlan(actionPlan)}
                canDelete={isOwnPlan(actionPlan)}
                canApprove={needsApproval}
                creator={actionPlan.creator}
                userRole={profile?.role}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const getHeaderInfo = () => {
    switch (profile?.role) {
      case 'Sales Director':
        return {
          title: 'Action Plans Management',
          subtitle: 'Manage your action plans and approve team submissions from supervisors and delegates'
        };
      case 'Supervisor':
        return {
          title: 'Action Plans',
          subtitle: 'Manage your action plans and approve delegate submissions'
        };
      case 'Delegate':
        return {
          title: 'Action Plans',
          subtitle: 'Manage your action plans and view plans involving you from your supervisors'
        };
      default:
        return {
          title: 'Action Plans',
          subtitle: 'Manage and track your action plans'
        };
    }
  };

  const headerInfo = getHeaderInfo();

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
                <h1 className="text-2xl font-bold text-gray-900">{headerInfo.title}</h1>
                <p className="text-sm text-gray-600">{headerInfo.subtitle}</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by location, description, or creator..."
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

              <Select value={filterCreator} onValueChange={setFilterCreator}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="me">My Plans</SelectItem>
                  {profile?.role !== 'Delegate' && (
                    <SelectItem value="involving_me">Plans Involving Me</SelectItem>
                  )}
                  {(profile?.role === 'Supervisor' || profile?.role === 'Sales Director') && (
                    <SelectItem value="delegate_plans">Delegate Plans</SelectItem>
                  )}
                  {profile?.role === 'Sales Director' && (
                    <SelectItem value="supervisor_plans">Supervisor Plans</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards for Supervisor */}
        {profile?.role === 'Supervisor' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">My Plans</p>
                    <p className="text-2xl font-bold text-blue-900">{groupedPlans.own.length}</p>
                  </div>
                  <User className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Plans Involving Me</p>
                    <p className="text-2xl font-bold text-purple-900">{groupedPlans.involvingMe.length}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Delegate Plans</p>
                    <p className="text-2xl font-bold text-green-900">{groupedPlans.delegatePlans.length}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Summary Cards for Sales Director */}
        {profile?.role === 'Sales Director' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">My Plans</p>
                    <p className="text-2xl font-bold text-blue-900">{groupedPlans.own.length}</p>
                  </div>
                  <User className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Plans Involving Me</p>
                    <p className="text-2xl font-bold text-purple-900">{groupedPlans.involvingMe.length}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Supervisor Plans</p>
                    <p className="text-2xl font-bold text-orange-900">{groupedPlans.supervisorPlans.length}</p>
                  </div>
                  <Building className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Delegate Plans</p>
                    <p className="text-2xl font-bold text-green-900">{groupedPlans.delegatePlans.length}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Summary Cards for Delegate (keep existing) */}
        {profile?.role === 'Delegate' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">My Plans</p>
                    <p className="text-2xl font-bold text-blue-900">{groupedPlans.own.length}</p>
                  </div>
                  <User className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Supervisor Plans Involving Me</p>
                    <p className="text-2xl font-bold text-purple-900">{groupedPlans.involvingMe.length}</p>
                  </div>
                  <Building className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Sales Director Plans Involving Me</p>
                    <p className="text-2xl font-bold text-green-900">{groupedPlans.delegatePlans.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Plans Sections */}
        {filteredActionPlans.length > 0 ? (
          <div className="space-y-8">
            {profile?.role === 'Supervisor' ? (
              <>
                {renderPlanSection(
                  "My Action Plans", 
                  groupedPlans.own, 
                  <User className="h-5 w-5 text-blue-600" />,
                  "No action plans created by you"
                )}
                {renderPlanSection(
                  "Plans Involving Me", 
                  groupedPlans.involvingMe, 
                  <AlertCircle className="h-5 w-5 text-purple-600" />,
                  "No plans from sales directors involving you"
                )}
                {renderPlanSection(
                  "Delegate Plans", 
                  groupedPlans.delegatePlans, 
                  <UserCheck className="h-5 w-5 text-green-600" />,
                  "No plans from your delegates",
                  true
                )}
              </>
            ) : profile?.role === 'Sales Director' ? (
              <>
                {renderPlanSection(
                  "My Action Plans", 
                  groupedPlans.own, 
                  <User className="h-5 w-5 text-blue-600" />,
                  "No action plans created by you"
                )}
                {renderPlanSection(
                  "Plans Involving Me", 
                  groupedPlans.involvingMe, 
                  <AlertCircle className="h-5 w-5 text-purple-600" />,
                  "No plans from marketing managers involving you"
                )}
                {renderPlanSection(
                  "Supervisor Plans", 
                  groupedPlans.supervisorPlans, 
                  <Building className="h-5 w-5 text-orange-600" />,
                  "No plans from your supervisors",
                  true
                )}
                {renderPlanSection(
                  "Delegate Plans", 
                  groupedPlans.delegatePlans, 
                  <UserCheck className="h-5 w-5 text-green-600" />,
                  "No plans from delegates",
                  true
                )}
              </>
            ) : (
              // Default view for other roles
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredActionPlans.map((actionPlan) => (
                  <ActionPlanCard
                    key={actionPlan.id}
                    actionPlan={actionPlan}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    creator={actionPlan.creator}
                  />
                ))}
              </div>
            )}
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
