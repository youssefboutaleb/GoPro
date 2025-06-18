
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Users, Target, TrendingUp, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RythmeRecrutementAnalysisProps {
  onBack: () => void;
}

interface SalesPlanData {
  id: string;
  product_name: string;
  brick_name: string | null;
  targets: number[];
  achievements: number[];
  monthly_performance: number[];
  recruitment_rhythm: number;
  year_to_date_targets: number;
  year_to_date_achievements: number;
  row_color: 'red' | 'yellow' | 'green';
}

const RythmeRecrutementAnalysis: React.FC<RythmeRecrutementAnalysisProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString());

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const monthsElapsed = parseInt(selectedMonth);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const displayMonths = monthNames.slice(0, currentMonth);

  const { data: salesPlansData = [], isLoading } = useQuery({
    queryKey: ['recruitment-rhythm-analysis', user?.id, selectedMonth],
    queryFn: async () => {
      if (!user?.id) return [];

      console.log('🔍 Fetching recruitment rhythm data for delegate:', user.id);

      try {
        const { data: salesPlansData, error: salesPlansError } = await supabase
          .from('sales_plans')
          .select(`
            id,
            product_id,
            brick_id,
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
          console.error('❌ Error fetching sales plans:', salesPlansError);
          throw salesPlansError;
        }

        console.log('📋 Sales plans data fetched successfully:', salesPlansData?.length || 0, 'plans');

        if (!salesPlansData || salesPlansData.length === 0) {
          console.log('⚠️ No sales plans found for delegate');
          return [];
        }

        const processedData: SalesPlanData[] = [];

        for (const salesPlan of salesPlansData) {
          if (!salesPlan.products) {
            console.log('⚠️ No product found for sales plan:', salesPlan.id);
            continue;
          }

          const product = salesPlan.products;
          const sales = salesPlan.sales || [];
          const currentYearSales = sales.filter(sale => sale.year === currentYear);

          console.log(`📊 Processing product ${product.name} with ${currentYearSales.length} sales records`);

          const targets = currentYearSales[0]?.targets || new Array(12).fill(0);
          const achievements = currentYearSales[0]?.achievements || new Array(12).fill(0);

          const yearToDateTargets = targets.slice(0, monthsElapsed).reduce((sum, val) => sum + (val || 0), 0);
          const yearToDateAchievements = achievements.slice(0, monthsElapsed).reduce((sum, val) => sum + (val || 0), 0);

          const monthlyPerformance = targets.slice(0, monthsElapsed).map((target, index) => {
            const achievement = achievements[index] || 0;
            return target > 0 ? Math.round((achievement / target) * 100) : 0;
          });

          const remainingMonths = 12 - monthsElapsed;
          const denominator = remainingMonths * (remainingMonths + 1) / 2;
          const numerator = yearToDateTargets - yearToDateAchievements;
          const recruitmentRhythm = denominator > 0 ? Math.round((numerator / denominator) * 100) : 0;

          let rowColor: 'red' | 'yellow' | 'green' = 'red';
          if (recruitmentRhythm >= 80) {
            rowColor = 'green';
          } else if (recruitmentRhythm >= 50) {
            rowColor = 'yellow';
          }

          processedData.push({
            id: salesPlan.id,
            product_name: product.name,
            brick_name: salesPlan.bricks?.name || null,
            targets: targets.slice(0, monthsElapsed),
            achievements: achievements.slice(0, monthsElapsed),
            monthly_performance: monthlyPerformance,
            recruitment_rhythm: recruitmentRhythm,
            year_to_date_targets: yearToDateTargets,
            year_to_date_achievements: yearToDateAchievements,
            row_color: rowColor
          });
        }

        console.log('✅ Processing complete. Total sales plans:', processedData.length);
        return processedData;

      } catch (error) {
        console.error('💥 Error in recruitment rhythm query:', error);
        throw error;
      }
    },
    enabled: !!user?.id
  });

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

  const getMonthlyPerformanceColor = (performance: number) => {
    if (performance >= 100) return 'text-green-600 bg-green-100';
    if (performance >= 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

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
                    Tracking {salesPlansData.length} sales plans
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Month:</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales Plans</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{salesPlansData.length}</div>
              <p className="text-xs text-muted-foreground">Active plans</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">YTD Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalTargets > 0 ? Math.round((totalAchievements / totalTargets) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {totalAchievements} / {totalTargets}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Recruitment Rhythm</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getRecruitmentRhythmColor(averageRecruitmentRhythm).split(' ')[0]}`}>
                {averageRecruitmentRhythm}%
              </div>
              <p className="text-xs text-muted-foreground">Overall rhythm</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Sales Plans Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {salesPlansData.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
                      <TableHead>Product</TableHead>
                      <TableHead>Brick</TableHead>
                      {displayMonths.slice(0, monthsElapsed).map(month => (
                        <TableHead key={month} className="text-center min-w-[80px]">
                          {month}<br />
                          <span className="text-xs text-gray-500">T/A (%)</span>
                        </TableHead>
                      ))}
                      <TableHead className="text-center">YTD Targets</TableHead>
                      <TableHead className="text-center">YTD Achievements</TableHead>
                      <TableHead className="text-center">Recruitment Rhythm</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesPlansData.map((plan) => (
                      <TableRow key={plan.id} className={getRowColorClass(plan.row_color)}>
                        <TableCell className="font-medium">{plan.product_name}</TableCell>
                        <TableCell>{plan.brick_name || 'N/A'}</TableCell>
                        {plan.targets.map((target, index) => {
                          const achievement = plan.achievements[index] || 0;
                          const performance = plan.monthly_performance[index] || 0;
                          return (
                            <TableCell key={index} className="text-center">
                              <div className="text-sm">
                                <div>{target} / {achievement}</div>
                                <div className={`text-xs px-1 py-0.5 rounded ${getMonthlyPerformanceColor(performance)}`}>
                                  {performance}%
                                </div>
                              </div>
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-center font-medium">{plan.year_to_date_targets}</TableCell>
                        <TableCell className="text-center font-medium">{plan.year_to_date_achievements}</TableCell>
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

export default RythmeRecrutementAnalysis;
