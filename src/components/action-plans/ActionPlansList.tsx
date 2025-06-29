
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActionPlanCard } from './ActionPlanCard';
import { useActionPlans } from '@/hooks/useActionPlans';
import { useAuth } from '@/hooks/useAuth';
import { ActionPlanStatusBadge } from './ActionPlanStatusBadge';

interface ActionPlansListProps {
  statusFilter?: 'Pending' | 'Approved' | 'Rejected';
}

export const ActionPlansList = ({ statusFilter }: ActionPlansListProps) => {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { actionPlans, isLoading } = useActionPlans(statusFilter);

  if (isLoading) {
    return (
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!actionPlans.length) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">
            <p>{t('common.noActionPlansFound')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {actionPlans.map((actionPlan) => (
        <Card key={actionPlan.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  {actionPlan.type}
                  <Badge variant="outline">
                    {new Date(actionPlan.date).toLocaleDateString()}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {t('common.location')}: {actionPlan.location}
                </p>
                {actionPlan.created_by_profile && (
                  <p className="text-xs text-gray-500">
                    {t('common.createdBy')}: {actionPlan.created_by_profile.first_name} {actionPlan.created_by_profile.last_name}
                  </p>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                {profile?.role === 'Marketing Manager' && (
                  <ActionPlanStatusBadge 
                    status={actionPlan.marketing_manager_status} 
                    role="Marketing" 
                  />
                )}
                {profile?.role === 'Sales Director' && (
                  <ActionPlanStatusBadge 
                    status={actionPlan.sales_director_status} 
                    role="Sales Director" 
                  />
                )}
                {profile?.role === 'Supervisor' && (
                  <ActionPlanStatusBadge 
                    status={actionPlan.supervisor_status} 
                    role="Supervisor" 
                  />
                )}
                {profile?.role === 'Admin' && (
                  <div className="flex flex-col gap-1">
                    <ActionPlanStatusBadge 
                      status={actionPlan.marketing_manager_status} 
                      role="Marketing" 
                    />
                    <ActionPlanStatusBadge 
                      status={actionPlan.sales_director_status} 
                      role="Sales Dir" 
                    />
                    <ActionPlanStatusBadge 
                      status={actionPlan.supervisor_status} 
                      role="Supervisor" 
                    />
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {actionPlan.description && (
              <p className="text-sm text-gray-700 mb-4">
                {actionPlan.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {actionPlan.is_executed && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {t('common.executed')}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                
                {(actionPlan.created_by === profile?.id || profile?.role === 'Admin') && (
                  <>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
