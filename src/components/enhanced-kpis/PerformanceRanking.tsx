
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';

interface RankingItem {
  id: string;
  name: string;
  value: number;
  target?: number;
  rank: number;
  trend: 'up' | 'down' | 'stable';
}

interface PerformanceRankingProps {
  title: string;
  data: RankingItem[];
  metric: string;
  showTop?: number;
}

const PerformanceRanking: React.FC<PerformanceRankingProps> = ({
  title,
  data,
  metric,
  showTop = 5
}) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getPerformanceColor = (value: number, target?: number) => {
    if (!target) return 'bg-blue-50 border-blue-200';
    const percentage = (value / target) * 100;
    if (percentage >= 100) return 'bg-green-50 border-green-200';
    if (percentage >= 80) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const topPerformers = data.slice(0, showTop);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topPerformers.map((item) => (
            <div 
              key={item.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all hover:shadow-md ${getPerformanceColor(item.value, item.target)}`}
            >
              <div className="flex items-center space-x-3">
                {getRankIcon(item.rank)}
                <div>
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-600">
                    {item.value.toLocaleString()} {metric}
                    {item.target && (
                      <span className="ml-2 text-xs">
                        (Target: {item.target.toLocaleString()})
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {item.target && (
                  <Badge 
                    variant={item.value >= item.target ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {((item.value / item.target) * 100).toFixed(0)}%
                  </Badge>
                )}
                <div className={`text-sm font-medium ${getTrendColor(item.trend)}`}>
                  {item.trend === 'up' ? '↗' : item.trend === 'down' ? '↘' : '→'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceRanking;
