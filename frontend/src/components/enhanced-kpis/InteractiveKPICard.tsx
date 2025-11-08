
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Eye, Download } from 'lucide-react';
import AnimatedProgressBar from './AnimatedProgressBar';
import RealTimeIndicator from './RealTimeIndicator';

interface KPIData {
  title: string;
  value: number;
  target?: number;
  previousValue?: number;
  trend: 'up' | 'down' | 'stable';
  status: 'online' | 'offline' | 'idle';
  category: 'sales' | 'visits' | 'team' | 'performance';
}

interface InteractiveKPICardProps {
  data: KPIData;
  onViewDetails?: () => void;
  onExport?: () => void;
  showActions?: boolean;
}

const InteractiveKPICard: React.FC<InteractiveKPICardProps> = ({
  data,
  onViewDetails,
  onExport,
  showActions = true
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getTrendIcon = () => {
    switch (data.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getCategoryColor = () => {
    switch (data.category) {
      case 'sales':
        return 'bg-green-50 border-green-200';
      case 'visits':
        return 'bg-blue-50 border-blue-200';
      case 'team':
        return 'bg-purple-50 border-purple-200';
      case 'performance':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTrendPercentage = () => {
    if (!data.previousValue || data.previousValue === 0) return 0;
    return ((data.value - data.previousValue) / data.previousValue) * 100;
  };

  return (
    <Card 
      className={`transition-all duration-300 cursor-pointer hover:shadow-lg ${getCategoryColor()} ${
        isHovered ? 'scale-105' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-700">
            {data.title}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {getTrendIcon()}
            <RealTimeIndicator status={data.status} size="sm" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">
            {data.value.toLocaleString()}
          </div>
          {data.previousValue && (
            <Badge variant={data.trend === 'up' ? 'default' : 'destructive'}>
              {getTrendPercentage() > 0 ? '+' : ''}{getTrendPercentage().toFixed(1)}%
            </Badge>
          )}
        </div>

        {data.target && (
          <AnimatedProgressBar
            value={data.value}
            max={data.target}
            label="Progress to Target"
            color={data.value >= data.target * 0.8 ? 'green' : 
                   data.value >= data.target * 0.5 ? 'yellow' : 'red'}
          />
        )}

        {showActions && (
          <div className="flex space-x-2 mt-4">
            {onViewDetails && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onViewDetails}
                className="flex-1"
              >
                <Eye className="h-3 w-3 mr-1" />
                Details
              </Button>
            )}
            {onExport && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onExport}
                className="flex-1"
              >
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InteractiveKPICard;
