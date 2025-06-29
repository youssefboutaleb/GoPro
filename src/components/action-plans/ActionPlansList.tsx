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
import { Plus, Search, ArrowLeft, Users, User, UserCheck, Building } from 'lucide-react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCreator, setFilterCreator] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedActionPlan, setSelectedActionPlan] = useState<ActionPlan | null>(null);

  // Fetch supervised delegates for supervisor role
  const { data: supervisedDelegates = [] } = useQuery({
    queryKey: ['supervised-delegates', profile?.id],
    queryFn: async () => {
      if (!profile?.id || profile.role !== 'Supervisor') {
        return [];
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('supervisor_id', profile.id)
        .eq('role', 'Delegate');

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id && profile?.role === 'Supervisor',
  });

  // Fetch supervised supervisors for sales director role
  const { data: supervisedSupervisors = [] } = useQuery({
    queryKey: ['supervised-supervisors', profile?.id],
    queryFn: async () => {
      if (!profile?.id || profile.role !== 'Sales Director') {
        return [];
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('supervisor_id', profile.id)
        .eq('role', 'Supervisor');

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id && profile?.role === 'Sales Director',
  });

  // Fetch all delegates under supervised supervisors for sales director
  const { data: allDelegates = [] } = useQuery({
    queryKey: ['all-supervised-delegates', supervisedSupervisors.map(s => s.id).join(',')],
    queryFn: async () => {
      const supervisorIds = supervisedSupervisors.map(s => s.id);
      if (supervisorIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, supervisor_id')
        .in('supervisor_id', supervisorIds)
        .eq('role', 'Delegate');

      if (error) throw error;
      return data || [];
    },
    enabled: supervisedSupervisors.length > 0,
  });

  const delegateIds = supervisedDelegates.map(d => d.id);
  const supervisorIds = supervisedSupervisors.map(s => s.id);
  const allDelegateIds = allDelegates.map(d => d.id);

  const { data: actionPlans, isLoading } = useQuery({
    queryKey: ['action-plans', user?.id, profile?.role],
    queryFn: async () => {
      if (!user || !profile) return [];
      
      console.log('Fetching action plans for profile:', profile);
      
      // Let RLS policies handle access control
      let query = supabase
        .from('action_plans')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: actionPlansData, error } = await query;
      
      if (error) {
        console.error('Error fetching action plans:', error);
        throw error;
      }
      
      console.log('Raw action plans data:', actionPlansData);
      
      if (!actionPlansData || actionPlansData.length === 0) {
        console.log('No action plans found');
        return [];
      }

      // Get unique creator IDs
      const creatorIds = [...new Set(actionPlansData.map(plan => plan.created_by))];
      console.log('Creator IDs found:', creatorIds);
      
      // Fetch creator profiles separately with better error handling
      const { data: creatorsData, error: creatorsError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .in('id', creatorIds);

      if (creatorsError) {
        console.error('Error fetching creators:', creatorsError);
        // Continue without creator data rather than failing completely
      }

      console.log('Creators data fetched:', creatorsData);

      // Create a map of creators for easy lookup
      const creatorsMap = new Map();
      if (creatorsData) {
        creatorsData.forEach(creator => {
          console.log(`Mapping creator ${creator.id} (${creator.first_name} ${creator.last_name}) with role ${creator.role}`);
          creatorsMap.set(creator.id, creator);
        });
      }
      
      // Transform the data to match our ActionPlan type
      const transformedData: ActionPlan[] = actionPlansData.map(plan => {
        const creator = creatorsMap.get(plan.created_by);
        console.log(`Plan ${plan.id} created by ${plan.created_by}, mapped creator:`, creator);
        
        return {
          ...plan,
          creator: creator || undefined
        };
      });
      
      console.log('Final transformed action plans:', transformedData);
      
      return transformedData;
    },
    enabled: !!user && !!profile,
  });

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

  // Helper functions for categorization
  const isOwnPlan = (plan: ActionPlan) => {
    const result = plan.created_by === profile?.id;
    console.log(`Plan ${plan.id} is own plan:`, result, `(created_by: ${plan.created_by}, profile.id: ${profile?.id})`);
    return result;
  };
  
  const isDelegatePlan = (plan: ActionPlan) => delegateIds.includes(plan.created_by) || allDelegateIds.includes(plan.created_by);
  const isSupervisorPlan = (plan: ActionPlan) => supervisorIds.includes(plan.created_by);

  // Updated helper functions for delegate-specific categorization with better debugging
  const isSupervisorPlanForDelegate = (plan: ActionPlan) => {
    if (profile?.role !== 'Delegate') return false;
    
    const isFromSupervisor = plan.creator?.role === 'Supervisor';
    const targetsDelegate = plan.targeted_delegates?.includes(profile.id) || false;
    
    console.log(`Plan ${plan.id} supervisor check:`, {
      isFromSupervisor,
      targetsDelegate,
      creatorRole: plan.creator?.role,
      creatorId: plan.creator?.id,
      creatorName: plan.creator ? `${plan.creator.first_name} ${plan.creator.last_name}` : 'Unknown',
      targetedDelegates: plan.targeted_delegates,
      profileId: profile.id,
      result: isFromSupervisor && targetsDelegate
    });
    
    return isFromSupervisor && targetsDelegate;
  };

  const isSalesDirectorPlanForDelegate = (plan: ActionPlan) => {
    if (profile?.role !== 'Delegate') return false;
    
    const isFromSalesDirector = plan.creator?.role === 'Sales Director';
    const targetsDelegate = plan.targeted_delegates?.includes(profile.id) || false;
    
    console.log(`Plan ${plan.id} sales director check:`, {
      isFromSalesDirector,
      targetsDelegate,
      creatorRole: plan.creator?.role,
      creatorId: plan.creator?.id,
      creatorName: plan.creator ? `${plan.creator.first_name} ${plan.creator.last_name}` : 'Unknown',
      targetedDelegates: plan.targeted_delegates,
      profileId: profile.id,
      result: isFromSalesDirector && targetsDelegate
    });
    
    return isFromSalesDirector && targetsDelegate;
  };

  const handleApprove = async (planId: string) => {
    if (!window.confirm('Are you sure you want to approve this action plan?')) return;
    approvePlanMutation.mutate(planId);
  };

  const handleReject = async (planId: string) => {
    if (!window.confirm('Are you sure you want to reject this action plan?')) return;
    rejectPlanMutation.mutate(planId);
  };

  const handleSalesDirectorApprove = async (planId: string) => {
    if (!window.confirm('Are you sure you want to approve this action plan?')) return;
    approveSalesDirectorPlanMutation.mutate(planId);
  };

  const handleSalesDirectorReject = async (planId: string) => {
    if (!window.confirm('Are you sure you want to reject this action plan?')) return;
    rejectSalesDirectorPlanMutation.mutate(planId);
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
        case 'delegates':
          return isDelegatePlan(plan);
        case 'supervisors':
          return isSupervisorPlan(plan);
        case 'sales_director':
          return plan.creator?.role === 'Sales Director';
        case 'supervisor_involving_me':
          return isSupervisorPlanForDelegate(plan);
        case 'sales_director_involving_me':
          return isSalesDirectorPlanForDelegate(plan);
        default:
          return true;
      }
    })();

    return matchesSearch && matchesType && matchesStatus && matchesCreator;
  }) || [];

  // Group plans by category for better organization with debugging
  const groupedPlans = {
    own: filteredActionPlans.filter(isOwnPlan),
    delegate: filteredActionPlans.filter(isDelegatePlan),
    supervisor: filteredActionPlans.filter(isSupervisorPlan),
    salesDirector: filteredActionPlans.filter(plan => plan.creator?.role === 'Sales Director' && !isOwnPlan(plan)),
    supervisorInvolvingMe: filteredActionPlans.filter(isSupervisorPlanForDelegate),
    salesDirectorInvolvingMe: filteredActionPlans.filter(isSalesDirectorPlanForDelegate)
  };

  console.log('Final grouped plans for delegate:', groupedPlans);
  console.log('Summary counts:', {
    own: groupedPlans.own.length,
    supervisorInvolvingMe: groupedPlans.supervisorInvolvingMe.length,
    salesDirectorInvolvingMe: groupedPlans.salesDirectorInvolvingMe.length
  });

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

  const renderPlanSection = (title: string, plans: ActionPlan[], icon: React.ReactNode, emptyMessage: string) => {
    if (plans.length === 0) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 border-b pb-2">
          {icon}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <span className="text-sm text-gray-500">({plans.length})</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((actionPlan) => (
            <ActionPlanCard
              key={actionPlan.id}
              actionPlan={actionPlan}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onApprove={profile?.role === 'Supervisor' ? handleApprove : handleSalesDirectorApprove}
              onReject={profile?.role === 'Supervisor' ? handleReject : handleSalesDirectorReject}
              canEdit={isOwnPlan(actionPlan)}
              canDelete={isOwnPlan(actionPlan)}
              canApprove={
                (profile?.role === 'Supervisor' && isDelegatePlan(actionPlan)) ||
                (profile?.role === 'Sales Director' && (isSupervisorPlan(actionPlan) || isDelegatePlan(actionPlan)))
              }
              creator={actionPlan.creator}
              userRole={profile?.role}
            />
          ))}
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
          subtitle: 'Manage your action plans and approve team submissions'
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

              {(profile?.role === 'Supervisor' || profile?.role === 'Sales Director' || profile?.role === 'Delegate') && (
                <Select value={filterCreator} onValueChange={setFilterCreator}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by creator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Creators</SelectItem>
                    <SelectItem value="me">My Plans</SelectItem>
                    {profile?.role === 'Delegate' && (
                      <>
                        <SelectItem value="supervisor_involving_me">Plans Involving Me from Supervisor</SelectItem>
                        <SelectItem value="sales_director_involving_me">Plans Involving Me from Sales Director</SelectItem>
                      </>
                    )}
                    {(profile?.role === 'Supervisor' || profile?.role === 'Sales Director') && (
                      <SelectItem value="delegates">Delegate Plans</SelectItem>
                    )}
                    {profile?.role === 'Sales Director' && (
                      <SelectItem value="supervisors">Supervisor Plans</SelectItem>
                    )}
                    {profile?.role === 'Supervisor' && (
                      <SelectItem value="sales_director">Sales Director Plans</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        {profile?.role === 'Delegate' ? (
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
                    <p className="text-2xl font-bold text-purple-900">{groupedPlans.supervisorInvolvingMe.length}</p>
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
                    <p className="text-2xl font-bold text-green-900">{groupedPlans.salesDirectorInvolvingMe.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (profile?.role === 'Supervisor' || profile?.role === 'Sales Director') && (
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
            
            {profile?.role === 'Sales Director' && (
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Supervisor Plans</p>
                      <p className="text-2xl font-bold text-purple-900">{groupedPlans.supervisor.length}</p>
                    </div>
                    <Building className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Delegate Plans</p>
                    <p className="text-2xl font-bold text-green-900">{groupedPlans.delegate.length}</p>
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
            {profile?.role === 'Delegate' ? (
              <>
                {renderPlanSection(
                  "My Action Plans", 
                  groupedPlans.own, 
                  <User className="h-5 w-5 text-blue-600" />,
                  "No action plans created by you"
                )}
                {renderPlanSection(
                  "Supervisor Plans Involving Me", 
                  groupedPlans.supervisorInvolvingMe, 
                  <Building className="h-5 w-5 text-purple-600" />,
                  "No action plans from your supervisor involving you"
                )}
                {renderPlanSection(
                  "Sales Director Plans Involving Me", 
                  groupedPlans.salesDirectorInvolvingMe, 
                  <Users className="h-5 w-5 text-green-600" />,
                  "No action plans from your sales director involving you"
                )}
              </>
            ) : (profile?.role === 'Supervisor' || profile?.role === 'Sales Director') ? (
              <>
                {renderPlanSection(
                  "My Action Plans", 
                  groupedPlans.own, 
                  <User className="h-5 w-5 text-blue-600" />,
                  "No action plans created by you"
                )}
                {profile?.role === 'Sales Director' && renderPlanSection(
                  "Supervisor Action Plans", 
                  groupedPlans.supervisor, 
                  <Building className="h-5 w-5 text-purple-600" />,
                  "No action plans from your supervisors"
                )}
                {renderPlanSection(
                  "Delegate Action Plans", 
                  groupedPlans.delegate, 
                  <Users className="h-5 w-5 text-green-600" />,
                  profile?.role === 'Sales Director' 
                    ? "No action plans from delegates in your organization"
                    : "No action plans from your delegates"
                )}
                {profile?.role === 'Supervisor' && renderPlanSection(
                  "Sales Director Action Plans", 
                  groupedPlans.salesDirector, 
                  <UserCheck className="h-5 w-5 text-purple-600" />,
                  "No action plans from your sales director"
                )}
              </>
            ) : (
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
