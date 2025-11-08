
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Circle } from 'lucide-react';

interface RealTimeIndicatorProps {
  status: 'online' | 'offline' | 'idle';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const RealTimeIndicator: React.FC<RealTimeIndicatorProps> = ({ 
  status, 
  label = '',
  size = 'md' 
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'text-green-500';
      case 'offline':
        return 'text-red-500';
      case 'idle':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'Active';
      case 'offline':
        return 'Offline';
      case 'idle':
        return 'Idle';
      default:
        return 'Unknown';
    }
  };

  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  return (
    <div className="flex items-center space-x-2">
      <Circle 
        className={`${sizeClasses[size]} ${getStatusColor()} fill-current animate-pulse`} 
      />
      <span className="text-sm text-gray-600">
        {label} {getStatusText()}
      </span>
    </div>
  );
};

export default RealTimeIndicator;
