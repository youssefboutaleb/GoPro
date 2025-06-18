
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, Calendar, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface RythmeRecrutementProps {
  onBack: () => void;
}

interface SalesPlanData {
  id: string;
  product_name: string;
  brick_name: string;
  targets: number[];
  achievements: number[];
  recruitment_rhythm: number;
  row_color: 'red' | 'yellow' | 'green';
}

const RythmeRecrutement: React.FC<RythmeRecrutementProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Generate month names for table headers
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const displayMonths = monthNames.slice(0, currentMonth);

  const { data: salesPlansData = [], isLoading, error } = useQuery({
    queryKey: ['sales-plans-recruitment', user?.id, selectedMonth],
    queryFn: async () => {
      if (!user?.id) return [];

      try {
        const { data: salesPlansData, error: salesPlansError } = await supabase
          .from('sales_plans')
          .select(`
            id,
            products:product_id (
              id,
              name
            ),
            bricks:brick_id (
              id,
              name
            ),
            sales (
              id,
              targets,
              achievements,
              year
            )
          `)
          .eq('delegate_id', user.id);

        if (salesPlansError) {
          throw salesPlansError;
        }

        if (!salesPlansData || salesPlansData.length === 0) {
          return [];
        }

        const processedData: SalesPlanData[] = [];

        for (const salesPlan of salesPlansData) {
          if (!salesPlan.products || !salesPlan.bricks) {
            continue;
          }

          const product = salesPlan.products;
          const brick = salesPlan.bricks;
          const sales = salesPlan.sales?.find(s => s.year === currentYear);

          if (!sales) continue;

          const targets = sales.targets || [];
          const achievements = sales.achievements || [];

          // Calculate recruitment rhythm
          const sumTargets = targets.reduce((sum, target) => sum + (target || 0), 0);
          const achievementsYTD = achievements.slice(0, selectedMonth).reduce((sum, achievement) => sum + (achievement || 0), 0);
          const n = 12 - selectedMonth;
          const expectedGrowth = n > 0 ? (n * (n + 1)) / 2 : 1;
          const recruitmentRhythm = expectedGrowth > 0 ? Math.round(((sumTargets - achievementsYTD) / expectedGrowth) * 100) : 0;

          // Determine row color based on recruitment rhythm
          let rowColor: 'red' | 'yellow' | 'green' = 'red';
          if (recruitmentRhythm >= 80) {
            rowColor = 'green';
          } else if (recruitmentRhythm >= 50) {
            rowColor = 'yellow';
          }

          processedData.push({
            id: salesPlan.id,
            product_name: product.name,
            brick_name: brick.name,
            targets,
            achievements,
            recruitment_rhythm: recruitmentRhythm,
            row_color: rowColor
          });
        }

        return processedData;

      } catch (error) {
        throw error;
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });

  // Helper functions for row styling
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recruitment rhythm data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading recruitment rhythm data</p>
          <Button onClick={onBack}>Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack} className="p-2 hover:bg-blue-50">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Rythme de Recrutement</h1>
                  <p className="text-sm text-gray-600">Sales plans analysis and recruitment rhythm</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {displayMonths.map((month, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Sales Plans Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Sales Plans Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {salesPlansData.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Sales Plans Found</h3>
                <p className="text-gray-600">
                  No sales plans found for your profile.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Product Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Brick Name</th>
                      {displayMonths.map(month => (
                        <th key={month} className="text-center py-3 px-4 font-medium text-gray-700 min-w-[80px]">{month}</th>
                      ))}
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Recruitment Rhythm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesPlansData.map((plan) => (
                      <tr key={plan.id} className={getRowColorClass(plan.row_color)}>
                        <td className="py-4 px-4 font-medium">
                          {plan.product_name}
                        </td>
                        <td className="py-4 px-4">
                          {plan.brick_name}
                        </td>
                        {displayMonths.map((_, index) => (
                          <td key={index} className="py-4 px-4 text-center">
                            <div className="text-sm">
                              <div className="font-medium">{plan.achievements[index] || 0}</div>
                              <div className="text-gray-500">/ {plan.targets[index] || 0}</div>
                            </div>
                          </td>
                        ))}
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRecruitmentRhythmColor(plan.recruitment_rhythm)}`}>
                            {plan.recruitment_rhythm}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
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
      </div>
    </div>
  );
};

export default RythmeRecrutement;
