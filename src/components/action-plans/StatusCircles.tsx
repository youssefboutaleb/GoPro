
import React from 'react';
import { Check } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type ActionStatus = Database['public']['Enums']['action_status'];

interface StatusCirclesProps {
  supervisorStatus: ActionStatus;
  salesDirectorStatus: ActionStatus;
  marketingManagerStatus: ActionStatus;
  isExecuted?: boolean;
}

const StatusCircles: React.FC<StatusCirclesProps> = ({
  supervisorStatus,
  salesDirectorStatus,
  marketingManagerStatus,
  isExecuted = false
}) => {
  const getStatusColor = (status: ActionStatus) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-500';
      case 'Rejected':
        return 'bg-red-500';
      case 'Pending':
      default:
        return 'bg-yellow-500';
    }
  };

  const getStatusIcon = (status: ActionStatus) => {
    if (status === 'Approved') {
      return <Check className="w-3 h-3 text-white" />;
    }
    return null;
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        <div
          className={`w-4 h-4 rounded-full flex items-center justify-center ${getStatusColor(supervisorStatus)}`}
          title={`Supervisor: ${supervisorStatus}`}
        >
          {getStatusIcon(supervisorStatus)}
        </div>
        <span className="text-xs text-gray-600">SUP</span>
      </div>
      
      <div className="flex items-center space-x-1">
        <div
          className={`w-4 h-4 rounded-full flex items-center justify-center ${getStatusColor(salesDirectorStatus)}`}
          title={`Sales Director: ${salesDirectorStatus}`}
        >
          {getStatusIcon(salesDirectorStatus)}
        </div>
        <span className="text-xs text-gray-600">SD</span>
      </div>
      
      <div className="flex items-center space-x-1">
        <div
          className={`w-4 h-4 rounded-full flex items-center justify-center ${getStatusColor(marketingManagerStatus)}`}
          title={`Marketing Manager: ${marketingManagerStatus}`}
        >
          {getStatusIcon(marketingManagerStatus)}
        </div>
        <span className="text-xs text-gray-600">MM</span>
      </div>

      {isExecuted && (
        <div className="flex items-center space-x-1 ml-2">
          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs text-blue-600 font-medium">EXECUTED</span>
        </div>
      )}
    </div>
  );
};

export default StatusCircles;
