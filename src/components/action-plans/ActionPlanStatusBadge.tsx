
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface ActionPlanStatusBadgeProps {
  status: 'Pending' | 'Approved' | 'Rejected';
  role: string;
}

export const ActionPlanStatusBadge = ({ status, role }: ActionPlanStatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Approved':
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 hover:bg-green-100',
        };
      case 'Rejected':
        return {
          variant: 'destructive' as const,
          icon: XCircle,
          className: 'bg-red-100 text-red-800 hover:bg-red-100',
        };
      default:
        return {
          variant: 'secondary' as const,
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {status} ({role})
    </Badge>
  );
};
