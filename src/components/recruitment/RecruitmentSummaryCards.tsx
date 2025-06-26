
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Target } from 'lucide-react';

interface RecruitmentData {
  id: string;
  delegate_name: string;
  brick_name: string;
  product_name: string;
  target: number;
  achievement: number;
  achievement_percentage: number;
  monthly_targets: number[];
  monthly_achievements: number[];
}

interface RecruitmentSummaryCardsProps {
  data: RecruitmentData[];
  selectedMonth: number;
  isLoading: boolean;
}

const RecruitmentSummaryCards: React.FC<RecruitmentSummaryCardsProps> = ({
  data,
  selectedMonth,
  isLoading
}) => {
  const salesPlansCount = data.length;
  const totalTargets = data.reduce((sum, item) => sum + (item.target || 0), 0);
  const totalAchievements = data.reduce((sum, item) => sum + (item.achievement || 0), 0);
  const averageRecruitmentRhythm = data.length > 0 
    ? Math.round(data.reduce((sum, item) => sum + item.achievement_percentage, 0) / data.length)
    : 0;

  const getRecruitmentRhythmColor = (rhythm: number) => {
    if (rhythm >= 80) return 'text-green-600';
    if (rhythm >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sales Plans</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{salesPlansCount}</div>
          <p className="text-xs text-muted-foreground">Active plans</p>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Targets</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{totalTargets}</div>
          <p className="text-xs text-muted-foreground">Month {selectedMonth}</p>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Achievements</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{totalAchievements}</div>
          <p className="text-xs text-muted-foreground">Month {selectedMonth}</p>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Recruitment Rhythm</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getRecruitmentRhythmColor(averageRecruitmentRhythm)}`}>
            {averageRecruitmentRhythm}%
          </div>
          <p className="text-xs text-muted-foreground">Overall performance</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecruitmentSummaryCards;
