
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Users, Info } from 'lucide-react';

interface SalesPlanData {
  id: string;
  product_name: string;
  brick_name: string | null;
  monthly_achievements: number[];
  monthly_target: number;
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
  const [showFutureMonths, setShowFutureMonths] = useState(false);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Calculate current month index (0 = Jan, 11 = Dec)
  const now = new Date();
  const currentMonthIndex = now.getMonth();
  
  // Show months from Jan to (current month - 1)
  const visibleMonthsCount = showFutureMonths ? 12 : currentMonthIndex;
  const displayMonths = monthNames.slice(0, Math.min(monthsElapsed, 12));

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

  const isMonthVisible = (monthIndex: number) => {
    return showFutureMonths || monthIndex < currentMonthIndex;
  };

  const getMonthHeaderClass = (monthIndex: number) => {
    if (!isMonthVisible(monthIndex)) {
      return 'opacity-40 text-muted-foreground';
    }
    return '';
  };

  const getCompletionRatio = (actual: number, target: number) => {
    if (!target || target <= 0) return null;
    return Math.round((actual / target) * 100);
  };

  const getMonthName = (index: number) => {
    const names = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return names[index];
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const calculateRythmeRecrutement = (achievements: number[], monthlyTarget: number) => {
    const m = currentMonthIndex + 1; // month number with Jan=1
    
    if (m <= 1) return null; // No previous months
    
    const previous = achievements.slice(0, m - 1).map(Number);
    if (previous.length === 0) return null;
    
    const avg_prev = previous.reduce((sum, val) => sum + val, 0) / previous.length;
    const denominator = ((14 - m) * (13 - m)) / 2;
    
    if (denominator <= 0 || monthlyTarget <= 0) return null;
    
    const rythme = ((monthlyTarget - avg_prev) * 12) / denominator;
    
    // Clamp to 0 if negative
    return Math.max(0, Math.round(rythme));
  };

  const getRythmeColor = (rythme: number | null, monthlyTarget: number) => {
    if (rythme === null) return '';
    if (rythme === 0) return 'text-green-600 bg-green-100';
    if (rythme <= monthlyTarget * 0.1) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Sales Plans Analysis</CardTitle>
        <div className="flex items-center gap-2">
          <Switch
            id="show-future-months"
            checked={showFutureMonths}
            onCheckedChange={setShowFutureMonths}
          />
          <Label htmlFor="show-future-months" className="text-xs cursor-pointer">
            Show future months
          </Label>
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
          <div className="space-y-2">
            {currentMonthIndex > 0 && !showFutureMonths && (
              <p className="text-xs text-muted-foreground">
                Showing months January → {getMonthName(currentMonthIndex - 1)}
              </p>
            )}
            <div className="overflow-x-auto">
              <TooltipProvider>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Brick Name</TableHead>
                      {displayMonths.map((month, index) => (
                        <TableHead 
                          key={month} 
                          className={`text-center min-w-[100px] ${getMonthHeaderClass(index)}`}
                        >
                          {month}
                        </TableHead>
                      ))}
                      <TableHead className="text-center">Recruitment Rhythm</TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          Rythme de recrutement
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-xs">
                                ((Cible Mensuelle − moyenne des mois précédents) × 12) ÷ ((14−m)(13−m)/2), avec m = mois courant (janvier=1)
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableHead>
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
                      const target = plan.monthly_target;
                      const visible = isMonthVisible(index);
                      
                      return (
                        <TableCell 
                          key={index} 
                          className={`text-center ${!visible ? 'opacity-40' : ''}`}
                        >
                          {visible ? (
                            <span className="text-sm">
                              <span className="font-medium text-foreground">
                                {formatNumber(actual)}
                              </span>
                              <span className="text-muted-foreground mx-1">/</span>
                              <span className="text-muted-foreground">
                                {formatNumber(target)}
                              </span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRecruitmentRhythmColor(plan.recruitment_rhythm)}`}>
                        {plan.recruitment_rhythm}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {(() => {
                        const rythme = calculateRythmeRecrutement(plan.monthly_achievements, plan.monthly_target);
                        if (rythme === null) return <span className="text-muted-foreground">—</span>;
                        return (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRythmeColor(rythme, plan.monthly_target)}`}>
                            {formatNumber(rythme)} / mois
                          </span>
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
              </TooltipProvider>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecruitmentTable;
