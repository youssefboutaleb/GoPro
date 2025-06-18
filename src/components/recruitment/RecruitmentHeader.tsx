
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Users } from 'lucide-react';

interface RecruitmentHeaderProps {
  onBack: () => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  salesPlansCount: number;
}

const RecruitmentHeader: React.FC<RecruitmentHeaderProps> = ({
  onBack,
  selectedMonth,
  onMonthChange,
  salesPlansCount
}) => {
  const currentMonth = new Date().getMonth() + 1;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
                <h1 className="text-2xl font-bold text-gray-900">Rythme de Recrutement par Ventes</h1>
                <p className="text-sm text-gray-600">
                  Tracking {salesPlansCount} sales plans
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Month:</label>
              <Select value={selectedMonth} onValueChange={onMonthChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: currentMonth }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {monthNames[i]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruitmentHeader;
