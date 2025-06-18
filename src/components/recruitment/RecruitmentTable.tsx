
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users } from 'lucide-react';

interface SalesPlanData {
  id: string;
  product_name: string;
  brick_name: string | null;
  monthly_achievements: number[];
  monthly_targets: number[];
  recruitment_rhythm: number;
  row_color: 'red' | 'yellow' | 'green';
}

interface RecruitmentTableProps {
  salesPlansData: SalesPlanData[];
  monthsElapsed: number;
}

const RecruitmentTable: React.FC<RecruitmentTableProps> = ({
  salesPlansData,
  monthsElapsed
}) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const displayMonths = monthNames.slice(0, monthsElapsed);

  const getRowColorClass = (color: 'red' | 'yellow' | 'green') => {
    switch (color) {
      case 'green':
        return 'bg-green-50 border-l-4 border-l-green-500';
      case 'yellow':
        return 'bg-yellow-50 border-l-4 border-l-yellow-500';
      case 'red':
        return 'bg-red-50 border-l-4 border-l-red-500';
      default:
        return '';
    }
  };

  const getRecruitmentRhythmColor = (rhythm: number) => {
    if (rhythm >= 80) return 'text-green-600 bg-green-100';
    if (rhythm >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Sales Plans Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        {salesPlansData.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Sales Plans Found</h3>
            <p className="text-gray-600">
              No sales plans found for your profile. Please contact your administrator.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Brick Name</TableHead>
                  {displayMonths.map(month => (
                    <TableHead key={month} className="text-center min-w-[100px]">{month}</TableHead>
                  ))}
                  <TableHead className="text-center">Recruitment Rhythm</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesPlansData.map((plan) => (
                  <TableRow key={plan.id} className={getRowColorClass(plan.row_color)}>
                    <TableCell className="font-medium">
                      {plan.product_name}
                    </TableCell>
                    <TableCell>
                      {plan.brick_name || 'N/A'}
                    </TableCell>
                    {displayMonths.map((_, index) => (
                      <TableCell key={index} className="text-center">
                        <div className="flex flex-col space-y-1">
                          <span className="text-green-600 font-medium">
                            {plan.monthly_achievements[index] || 0}
                          </span>
                          <span className="text-gray-400 text-xs">
                            / {plan.monthly_targets[index] || 0}
                          </span>
                        </div>
                      </TableCell>
                    ))}
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRecruitmentRhythmColor(plan.recruitment_rhythm)}`}>
                        {plan.recruitment_rhythm}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecruitmentTable;
