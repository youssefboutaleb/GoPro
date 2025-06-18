
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, Calendar, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

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

  // Fetch sales plans first
  const { data: salesPlans = [], isLoading: salesPlansLoading, error: salesPlansError } = useQuery({
    queryKey: ['sales-plans', user?.id],
    queryFn: async () => {
      console.log('Fetching sales plans for user:', user?.id);
      
      if (!user?.id) {
        console.log('No user ID found');
        return [];
      }

      try {
        const { data, error } = await supabase
          .from('sales_plans')
          .select('id, product_id, brick_id, delegate_id')
          .eq('delegate_id', user.id);

        if (error) {
          console.error('Sales plans query error:', error);
          throw error;
        }

        console.log('Sales plans fetched:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('Error in sales plans query:', error);
        throw error;
      }
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch products separately
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      console.log('Fetching products');
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name');

        if (error) {
          console.error('Products query error:', error);
          throw error;
        }

        console.log('Products fetched:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('Error in products query:', error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 10 * 60 * 1000,
  });

  // Fetch bricks separately
  const { data: bricks = [], isLoading: bricksLoading } = useQuery({
    queryKey: ['bricks'],
    queryFn: async () => {
      console.log('Fetching bricks');
      
      try {
        const { data, error } = await supabase
          .from('bricks')
          .select('id, name');

        if (error) {
          console.error('Bricks query error:', error);
          throw error;
        }

        console.log('Bricks fetched:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('Error in bricks query:', error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 10 * 60 * 1000,
  });

  // Fetch sales data separately
  const { data: salesData = [], isLoading: salesLoading } = useQuery({
    queryKey: ['sales-data', salesPlans.map(p => p.id), currentYear],
    queryFn: async () => {
      console.log('Fetching sales data for plans:', salesPlans.length);
      
      if (salesPlans.length === 0) {
        console.log('No sales plans to fetch data for');
        return [];
      }

      try {
        const salesPlanIds = salesPlans.map(plan => plan.id);
        
        const { data, error } = await supabase
          .from('sales')
          .select('id, sales_plan_id, targets, achievements, year')
          .in('sales_plan_id', salesPlanIds)
          .eq('year', currentYear);

        if (error) {
          console.error('Sales data query error:', error);
          throw error;
        }

        console.log('Sales data fetched:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('Error in sales data query:', error);
        throw error;
      }
    },
    enabled: salesPlans.length > 0,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  // Process data when all queries are complete
  const { data: processedData = [], isLoading: isProcessing } = useQuery({
    queryKey: ['processed-sales-data', salesPlans, products, bricks, salesData, selectedMonth],
    queryFn: async () => {
      console.log('Processing sales data...');
      
      if (!salesPlans.length || !products.length || !bricks.length) {
        console.log('Missing required data for processing');
        return [];
      }

      const processed: SalesPlanData[] = [];

      for (const salesPlan of salesPlans) {
        const product = products.find(p => p.id === salesPlan.product_id);
        const brick = bricks.find(b => b.id === salesPlan.brick_id);
        const sales = salesData.find(s => s.sales_plan_id === salesPlan.id);

        if (!product || !brick) {
          console.log('Missing product or brick data for plan:', salesPlan.id);
          continue;
        }

        const targets = sales?.targets || [];
        const achievements = sales?.achievements || [];

        // Calculate sum of targets
        const sumTargets = targets.reduce((sum, target) => sum + (target || 0), 0);
        
        // Calculate sum of achievements YTD (up to selected month)
        const achievementsYTD = achievements.slice(0, selectedMonth).reduce((sum, achievement) => sum + (achievement || 0), 0);
        
        // Calculate sum of targets YTD (up to selected month)
        const targetsYTD = targets.slice(0, selectedMonth).reduce((sum, target) => sum + (target || 0), 0);
        
        // Calculate n = 12 - m (where m is selected month)
        const n = 12 - selectedMonth;
        
        // Calculate recruitment rhythm: (sum of targets - Sum of achievementsYTD) / (n*(n+1)/2)
        const denominator = n > 0 ? (n * (n + 1)) / 2 : 1;
        const recruitmentRhythm = denominator > 0 ? Math.ceil((sumTargets - achievementsYTD) / denominator) : 0;

        // Calculate sales percentage for color coding: (Sum of achievementsYTD)/(sum of targetsYTD) *100
        const salesPercentage = targetsYTD > 0 ? (achievementsYTD / targetsYTD) * 100 : 0;

        // Determine row color based on sales percentage
        let rowColor: 'red' | 'yellow' | 'green' = 'red';
        if (salesPercentage >= 80) {
          rowColor = 'green';
        } else if (salesPercentage >= 50) {
          rowColor = 'yellow';
        }

        processed.push({
          id: salesPlan.id,
          product_name: product.name,
          brick_name: brick.name,
          targets,
          achievements,
          recruitment_rhythm: recruitmentRhythm,
          row_color: rowColor
        });
      }

      console.log('Processed data:', processed.length, 'items');
      return processed;
    },
    enabled: !salesPlansLoading && !productsLoading && !bricksLoading && !salesLoading,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = salesPlansLoading || productsLoading || bricksLoading || salesLoading || isProcessing;
  const error = salesPlansError;

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

  const getMonthHighlightClass = (monthIndex: number) => {
    // Highlight selected month and all preceding months
    if (monthIndex < selectedMonth) {
      return 'bg-blue-50 border-2 border-blue-200';
    }
    return '';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recruitment rhythm data...</p>
          <p className="text-sm text-gray-500 mt-2">
            Loading: {salesPlansLoading && 'Plans'} {productsLoading && 'Products'} {bricksLoading && 'Bricks'} {salesLoading && 'Sales'} {isProcessing && 'Processing'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Component error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading recruitment rhythm data</p>
          <p className="text-sm text-gray-600 mb-4">{error.message}</p>
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
            {processedData.length === 0 ? (
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
                      {displayMonths.map((month, index) => (
                        <th 
                          key={month} 
                          className={`text-center py-3 px-4 font-medium text-gray-700 min-w-[80px] ${getMonthHighlightClass(index)}`}
                        >
                          {month}
                        </th>
                      ))}
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Recruitment Rhythm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedData.map((plan) => (
                      <tr key={plan.id} className={getRowColorClass(plan.row_color)}>
                        <td className="py-4 px-4 font-medium">
                          {plan.product_name}
                        </td>
                        <td className="py-4 px-4">
                          {plan.brick_name}
                        </td>
                        {displayMonths.map((_, index) => (
                          <td 
                            key={index} 
                            className={`py-4 px-4 text-center ${getMonthHighlightClass(index)}`}
                          >
                            <div className="text-sm">
                              <div className="font-medium">{plan.achievements[index] || 0}</div>
                              <div className="text-gray-500">/ {plan.targets[index] || 0}</div>
                            </div>
                          </td>
                        ))}
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRecruitmentRhythmColor(plan.recruitment_rhythm)}`}>
                            {plan.recruitment_rhythm}
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
                <span>Green: Sales Percentage ≥ 80%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-50 border-l-4 border-l-yellow-500"></div>
                <span>Yellow: 50% ≤ Sales Percentage &lt; 80%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-50 border-l-4 border-l-red-500"></div>
                <span>Red: Sales Percentage &lt; 50%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RythmeRecrutement;
