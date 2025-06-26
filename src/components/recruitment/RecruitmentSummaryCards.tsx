
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Target } from 'lucide-react';

interface RecruitmentSummaryCardsProps {
  salesPlansCount: number;
  totalTargets: number;
  totalAchievements: number;
  averageRecruitmentRhythm: number;
}

const RecruitmentSummaryCards: React.FC<RecruitmentSummaryCardsProps> = ({
  salesPlansCount,
  totalTargets,
  totalAchievements,
  averageRecruitmentRhythm
}) => {
  const getRecruitmentRhythmColor = (rhythm: number) => {
    if (rhythm >= 80) return 'text-green-600';
    if (rhythm >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

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
          <p className="text-xs text-muted-foreground">Year to date</p>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Achievements</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{totalAchievements}</div>
          <p className="text-xs text-muted-foreground">Year to date</p>
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
