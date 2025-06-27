
import React from 'react';
import { Check } from 'lucide-react';

interface ActionPlanStatusCirclesProps {
  supervisorStatus: string;
  salesDirectorStatus: string;
  marketingManagerStatus: string;
  isExecuted: boolean;
}

const ActionPlanStatusCircles: React.FC<ActionPlanStatusCirclesProps> = ({
  supervisorStatus,
  salesDirectorStatus,
  marketingManagerStatus,
  isExecuted
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  if (isExecuted) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <Check className="w-5 h-5 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="text-center">
        <div className={`w-8 h-8 ${getStatusColor(supervisorStatus)} rounded-full flex items-center justify-center`}>
          <span className="text-white text-xs font-bold">S</span>
        </div>
        <span className="text-xs text-gray-500 mt-1 block">Supervisor</span>
      </div>
      <div className="text-center">
        <div className={`w-8 h-8 ${getStatusColor(salesDirectorStatus)} rounded-full flex items-center justify-center`}>
          <span className="text-white text-xs font-bold">DV</span>
        </div>
        <span className="text-xs text-gray-500 mt-1 block">Sales Director</span>
      </div>
      <div className="text-center">
        <div className={`w-8 h-8 ${getStatusColor(marketingManagerStatus)} rounded-full flex items-center justify-center`}>
          <span className="text-white text-xs font-bold">M</span>
        </div>
        <span className="text-xs text-gray-500 mt-1 block">Marketing</span>
      </div>
    </div>
  );
};

export default ActionPlanStatusCircles;
