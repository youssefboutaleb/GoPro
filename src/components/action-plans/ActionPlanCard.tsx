
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, MapPin, Calendar } from 'lucide-react';
import StatusCircles from './StatusCircles';
import { Database } from '@/integrations/supabase/types';

type ActionPlan = Database['public']['Tables']['action_plans']['Row'];

interface ActionPlanCardProps {
  actionPlan: ActionPlan;
  onEdit: (actionPlan: ActionPlan) => void;
  onDelete: (id: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const ActionPlanCard: React.FC<ActionPlanCardProps> = ({
  actionPlan,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge className={getTypeBadgeColor(actionPlan.type)}>
            {actionPlan.type}
          </Badge>
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
        
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-gray-500">
            Created: {formatDate(actionPlan.created_at)}
          </div>
          
          <div className="flex space-x-2">
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
