import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Calendar } from 'lucide-react';
import { formatNumber } from '@/utils/recruitmentCalculations';

interface RecruitmentMetricsProps {
  totalPlans: number;
  averageRate: number | null;
  currentPeriod: string;
}

const RecruitmentMetrics: React.FC<RecruitmentMetricsProps> = ({
  totalPlans,
  averageRate,
  currentPeriod,
}) => {
  const getRateBadgeColor = (rate: number | null): 'default' | 'destructive' | 'outline' | 'secondary' => {
    if (rate === null) return 'secondary';
    if (rate < 80) return 'destructive';
    if (rate >= 100) return 'default';
    return 'outline';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Sales Plans</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPlans}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Active plans for Nebilet
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">
              {averageRate !== null ? `${Math.round(averageRate)}%` : '–'}
            </div>
            <Badge variant={getRateBadgeColor(averageRate)}>
              {averageRate !== null && averageRate >= 100 ? 'Excellent' :
               averageRate !== null && averageRate >= 80 ? 'Good' :
               averageRate !== null ? 'Needs Improvement' : 'N/A'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Based on past months
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Current Period</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentPeriod}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Reporting period
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecruitmentMetrics;
