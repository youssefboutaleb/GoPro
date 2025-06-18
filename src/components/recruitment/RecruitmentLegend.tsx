
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RecruitmentLegend: React.FC = () => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mt-6">
      <CardHeader>
        <CardTitle className="text-sm">Color Legend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-50 border-l-4 border-l-green-500"></div>
            <span>Green: Recruitment Rhythm ≥ 80%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-50 border-l-4 border-l-yellow-500"></div>
            <span>Yellow: 50% ≤ Recruitment Rhythm ≤ 79%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-50 border-l-4 border-l-red-500"></div>
            <span>Red: Recruitment Rhythm < 50%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecruitmentLegend;
