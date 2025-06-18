
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRecruitmentData } from '@/hooks/useRecruitmentData';
import RecruitmentHeader from './recruitment/RecruitmentHeader';
import RecruitmentSummaryCards from './recruitment/RecruitmentSummaryCards';
import RecruitmentTable from './recruitment/RecruitmentTable';
import RecruitmentLegend from './recruitment/RecruitmentLegend';

interface RythmeRecrutementAnalysisProps {
  onBack: () => void;
}

const RythmeRecrutementAnalysis: React.FC<RythmeRecrutementAnalysisProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString());

  const monthsElapsed = parseInt(selectedMonth);
  const { data: salesPlansData = [], isLoading } = useRecruitmentData(selectedMonth);

  const totalTargets = salesPlansData.reduce((sum, plan) => sum + plan.year_to_date_targets, 0);
  const totalAchievements = salesPlansData.reduce((sum, plan) => sum + plan.year_to_date_achievements, 0);
  const averageRecruitmentRhythm = salesPlansData.length > 0 
    ? Math.round(salesPlansData.reduce((sum, plan) => sum + plan.recruitment_rhythm, 0) / salesPlansData.length)
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recruitment rhythm analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <RecruitmentHeader
        onBack={onBack}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        salesPlansCount={salesPlansData.length}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <RecruitmentSummaryCards
          salesPlansCount={salesPlansData.length}
          totalTargets={totalTargets}
          totalAchievements={totalAchievements}
          averageRecruitmentRhythm={averageRecruitmentRhythm}
        />

        <RecruitmentTable
          salesPlansData={salesPlansData}
          monthsElapsed={monthsElapsed}
        />

        <RecruitmentLegend />
      </div>
    </div>
  );
};

export default RythmeRecrutementAnalysis;
