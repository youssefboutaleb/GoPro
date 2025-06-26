
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users } from 'lucide-react';

interface RecruitmentHeaderProps {
  onBack: () => void;
  supervisorName?: string;
  isDelegateView: boolean;
}

const RecruitmentHeader: React.FC<RecruitmentHeaderProps> = ({
  onBack,
  supervisorName,
  isDelegateView
}) => {
  return (
    <div className="bg-white shadow-lg border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack} className="p-2 hover:bg-blue-50">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {supervisorName ? `Recruitment Analysis - ${supervisorName}` : 'Rythme de Recrutement par Ventes'}
                </h1>
                <p className="text-sm text-gray-600">
                  {isDelegateView ? 'Personal recruitment tracking' : 'Team recruitment tracking'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruitmentHeader;
