
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, MapPin, Calendar, User, Check, X } from 'lucide-react';
import StatusCircles from './StatusCircles';
import TargetedEntities from './TargetedEntities';
import { Database } from '@/integrations/supabase/types';

type ActionPlan = Database['public']['Tables']['action_plans']['Row'];

interface Creator {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface ActionPlanCardProps {
  actionPlan: ActionPlan;
  onEdit: (actionPlan: ActionPlan) => void;
  onDelete: (id: string) => void;
  onApprovalToggle?: (id: string, currentStatus: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canApprove?: boolean;
  creator?: Creator;
}

const ActionPlanCard: React.FC<ActionPlanCardProps> = ({
  actionPlan,
  onEdit,
  onDelete,
  onApprovalToggle,
  canEdit = true,
  canDelete = true,
  canApprove = false,
  creator
}) => {
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Staff':
        return 'bg-blue-100 text-blue-800';
      case 'ePU':
        return 'bg-purple-100 text-purple-800';
      case 'Congress':
        return 'bg-green-100 text-green-800';
      case 'Travel':
        return 'bg-orange-100 text-orange-800';
      case 'Gift':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCreatorBadgeColor = (role: string) => {
    switch (role) {
      case 'Supervisor':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Delegate':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Sales Director':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge className={getTypeBadgeColor(actionPlan.type)}>
              {actionPlan.type}
            </Badge>
            {creator && (
              <Badge variant="outline" className={`text-xs ${getCreatorBadgeColor(creator.role)}`}>
                <User className="w-3 h-3 mr-1" />
                {creator.first_name} {creator.last_name}
              </Badge>
            )}
          </div>
          <StatusCircles
            supervisorStatus={actionPlan.supervisor_status}
            salesDirectorStatus={actionPlan.sales_director_status}
            marketingManagerStatus={actionPlan.marketing_manager_status}
            isExecuted={actionPlan.is_executed || false}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(actionPlan.date)}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{actionPlan.location}</span>
        </div>
        
        {actionPlan.description && (
          <p className="text-sm text-gray-700 line-clamp-2">
            {actionPlan.description}
          </p>
        )}
        
        {/* Targeted Entities */}
        <TargetedEntities
          targetedProducts={actionPlan.targeted_products}
          targetedBricks={actionPlan.targeted_bricks}
          targetedDoctors={actionPlan.targeted_doctors}
          targetedDelegates={actionPlan.targeted_delegates}
          targetedSupervisors={actionPlan.targeted_supervisors}
          targetedSalesDirectors={actionPlan.targeted_sales_directors}
        />
        
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-gray-500">
            Created: {formatDate(actionPlan.created_at)}
          </div>
          
          <div className="flex space-x-2">
            {/* Approval/Rejection buttons for supervisors */}
            {canApprove && (
              <div className="flex space-x-1">
                <Button
                  variant={actionPlan.supervisor_status === 'Approved' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onApprovalToggle?.(actionPlan.id, actionPlan.supervisor_status)}
                  className="h-8 px-2 text-xs"
                >
                  <Check className="w-3 h-3 mr-1" />
                  {actionPlan.supervisor_status === 'Approved' ? 'Approved' : 'Approve'}
                </Button>
                <Button
                  variant={actionPlan.supervisor_status === 'Rejected' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => onApprovalToggle?.(actionPlan.id, actionPlan.supervisor_status)}
                  className="h-8 px-2 text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  {actionPlan.supervisor_status === 'Rejected' ? 'Rejected' : 'Reject'}
                </Button>
              </div>
            )}
            
            {/* Edit and Delete buttons */}
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(actionPlan)}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(actionPlan.id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionPlanCard;
