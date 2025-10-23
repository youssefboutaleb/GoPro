
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  const [showBadges, setShowBadges] = useState(true);
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

  const getMonthHighlightClass = (monthIndex: number) => {
    // Highlight selected month and all preceding months
    if (monthIndex < monthsElapsed) {
      return 'bg-blue-50 border-2 border-blue-200';
    }
    return '';
  };

  const getCompletionRatio = (actual: number, target: number) => {
    if (!target || target <= 0) return null;
    return Math.round((actual / target) * 100);
  };

  const getRatioColor = (ratio: number | null) => {
    if (ratio === null) return 'bg-gray-100 text-gray-600';
    if (ratio > 100) return 'bg-green-100 text-green-700';
    if (ratio >= 80) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Sales Plans Analysis</CardTitle>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium">Legend:</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-100 border border-red-300"></span>
              &lt;80%
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300"></span>
              80-100%
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-100 border border-green-300"></span>
              &gt;100%
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-gray-100 border border-gray-300"></span>
              no target
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="show-badges"
              checked={showBadges}
              onCheckedChange={setShowBadges}
            />
            <Label htmlFor="show-badges" className="text-xs cursor-pointer">
              Show %
            </Label>
          </div>
        </div>
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
                  {displayMonths.map((month, index) => (
                    <TableHead 
                      key={month} 
                      className={`text-center min-w-[100px] ${getMonthHighlightClass(index)}`}
                    >
                      {month}
                    </TableHead>
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
                    {displayMonths.map((_, index) => {
                      const actual = plan.monthly_achievements[index] || 0;
                      const target = plan.monthly_targets[index] || 0;
                      const ratio = getCompletionRatio(actual, target);
                      
                      return (
                        <TableCell 
                          key={index} 
                          className={`text-center ${getMonthHighlightClass(index)}`}
                        >
                          <div className="flex flex-col space-y-1">
                            <span className="text-sm">
                              <span className="font-medium text-foreground">
                                {formatNumber(actual)}
                              </span>
                              <span className="text-muted-foreground mx-1">/</span>
                              <span className="text-muted-foreground">
                                {formatNumber(target)}
                              </span>
                            </span>
                            {showBadges && (
                              <span 
                                className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${getRatioColor(ratio)}`}
                              >
                                {ratio !== null ? `${ratio}%` : '–'}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRecruitmentRhythmColor(plan.recruitment_rhythm)}`}>
                        {plan.recruitment_rhythm}
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
