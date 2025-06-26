import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, Calendar, Target, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

interface RythmeRecrutementProps {
  onBack: () => void;
  delegateIds?: string[];
  supervisorName?: string;
  showDelegateFilter?: boolean;
  isDelegateView?: boolean;
}

interface SalesPlanData {
  id: string;
  product_name: string;
  brick_name: string;
  sector_name: string;
  delegate_name?: string;
  targets: number[];
  achievements: number[];
  recruitment_rhythm: number;
  achievement_percentage: number;
  row_color: 'red' | 'yellow' | 'green';
}

const RythmeRecrutement: React.FC<RythmeRecrutementProps> = ({ 
  onBack, 
  delegateIds = [], 
  supervisorName,
  showDelegateFilter = false,
  isDelegateView = false
}) => {
  const { user, profile } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [selectedBrick, setSelectedBrick] = useState<string>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedDelegate, setSelectedDelegate] = useState<string>('all');

  // Use provided delegateIds or fallback to current user
  const effectiveDelegateIds = delegateIds.length > 0 ? delegateIds : [user?.id].filter(Boolean);

  console.log('RythmeRecrutement - User profile:', profile);
  console.log('RythmeRecrutement - Effective delegate IDs:', effectiveDelegateIds);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Generate month names for table headers
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const displayMonths = monthNames.slice(0, currentMonth);

  // Fetch delegate names for supervisor view
  const { data: delegateNames = [], isLoading: delegateNamesLoading } = useQuery({
    queryKey: ['delegate-names', effectiveDelegateIds],
    queryFn: async () => {
      if (!showDelegateFilter || effectiveDelegateIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', effectiveDelegateIds);

      if (error) throw error;
      return data || [];
    },
    enabled: showDelegateFilter && effectiveDelegateIds.length > 0,
  });

  // Fetch sales plans for multiple delegates
  const { data: salesPlans = [], isLoading: salesPlansLoading, error: salesPlansError } = useQuery({
    queryKey: ['sales-plans', effectiveDelegateIds.join(',')],
    queryFn: async () => {
      console.log('Fetching sales plans for delegates:', effectiveDelegateIds);
      console.log('Current user profile role:', profile?.role);
      
      if (effectiveDelegateIds.length === 0) {
        console.log('No delegate IDs provided');
        return [];
      }

      try {
        const { data, error } = await supabase
          .from('sales_plans')
          .select(`
            id, 
            product_id, 
            brick_id, 
            delegate_id,
            profiles!sales_plans_delegate_id_fkey(first_name, last_name)
          `)
          .in('delegate_id', effectiveDelegateIds);

        if (error) {
          console.error('Sales plans query error:', error);
          console.error('Error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }

        console.log('Sales plans fetched successfully:', data?.length || 0, 'items');
        console.log('Sales plans data:', data);
        return data || [];
      } catch (error) {
        console.error('Error in sales plans query:', error);
        throw error;
      }
    },
    enabled: effectiveDelegateIds.length > 0,
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

  // Fetch bricks with sectors
  const { data: bricks = [], isLoading: bricksLoading } = useQuery({
    queryKey: ['bricks-with-sectors'],
    queryFn: async () => {
      console.log('Fetching bricks with sectors');
      
      try {
        const { data, error } = await supabase
          .from('bricks')
          .select(`
            id, 
            name,
            sectors(id, name)
          `);

        if (error) {
          console.error('Bricks query error:', error);
          throw error;
        }

        console.log('Bricks with sectors fetched:', data?.length || 0);
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

        // Calculate achievement percentage: (Sum of achievementsYTD) / (sum of targets) * 100
        const achievementPercentage = sumTargets > 0 ? Math.round((achievementsYTD / sumTargets) * 100) : 0;

        // Calculate sales percentage for color coding: (Sum of achievementsYTD)/(sum of targetsYTD) *100
        const salesPercentage = targetsYTD > 0 ? (achievementsYTD / targetsYTD) * 100 : 0;

        // Determine row color based on sales percentage
        let rowColor: 'red' | 'yellow' | 'green' = 'red';
        if (salesPercentage >= 80) {
          rowColor = 'green';
        } else if (salesPercentage >= 50) {
          rowColor = 'yellow';
        }

        // Get delegate name for supervisor view
        const delegateName = showDelegateFilter 
          ? `${salesPlan.profiles?.first_name || ''} ${salesPlan.profiles?.last_name || ''}`.trim()
          : undefined;

        processed.push({
          id: salesPlan.id,
          product_name: product.name,
          brick_name: brick.name,
          sector_name: brick.sectors?.name || 'N/A',
          delegate_name: delegateName,
          targets,
          achievements,
          recruitment_rhythm: recruitmentRhythm,
          achievement_percentage: achievementPercentage,
          row_color: rowColor
        });
      }

      console.log('Processed data:', processed.length, 'items');
      return processed;
    },
    enabled: !salesPlansLoading && !productsLoading && !bricksLoading && !salesLoading,
    staleTime: 5 * 60 * 1000,
  });

  // Filter processed data based on selected filters
  const filteredData = processedData.filter((item) => {
    const productMatch = selectedProduct === 'all' || item.product_name === selectedProduct;
    const brickMatch = selectedBrick === 'all' || item.brick_name === selectedBrick;
    const sectorMatch = selectedSector === 'all' || item.sector_name === selectedSector;
    const delegateMatch = !showDelegateFilter || selectedDelegate === 'all' || item.delegate_name === selectedDelegate;
    
    return productMatch && brickMatch && sectorMatch && delegateMatch;
  });

  // Get unique values for filter options
  const uniqueProducts = [...new Set(processedData.map(item => item.product_name))];
  const uniqueBricks = [...new Set(processedData.map(item => item.brick_name))];
  const uniqueSectors = [...new Set(processedData.map(item => item.sector_name))];
  const uniqueDelegates = showDelegateFilter ? [...new Set(processedData.map(item => item.delegate_name).filter(Boolean))] : [];

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

  const getAchievementPercentageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getMonthHighlightClass = (monthIndex: number) => {
    // Highlight selected month and all preceding months
    if (monthIndex < selectedMonth) {
      return 'bg-blue-50 border-2 border-blue-200';
    }
    return '';
  };

  const calculateMonthlyPercentage = (achievement: number, target: number) => {
    if (target === 0) return 0;
    return Math.round((achievement / target) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recruitment rhythm data...</p>
          <p className="text-sm text-gray-500 mt-2">
            User: {profile?.role} | Delegates: {effectiveDelegateIds.length}
          </p>
          <p className="text-sm text-gray-500 mt-1">
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
          <p className="text-xs text-gray-500 mb-4">
            User Role: {profile?.role} | Delegate IDs: {effectiveDelegateIds.join(', ')}
          </p>
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
                  <p className="text-sm text-gray-600">
                    {supervisorName 
                      ? `Sales plans analysis for ${supervisorName}`
                      : profile?.role === 'Supervisor'
                      ? 'Sales plans analysis for your supervised delegates'
                      : 'Sales plans analysis and recruitment rhythm'
                    }
                  </p>
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
        {/* Filters Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-lg">Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`grid grid-cols-1 md:grid-cols-${showDelegateFilter ? '3' : '2'} gap-4`}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    {uniqueProducts.map((product) => (
                      <SelectItem key={product} value={product}>
                        {product}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brick</label>
                <Select value={selectedBrick} onValueChange={setSelectedBrick}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Bricks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Bricks</SelectItem>
                    {uniqueBricks.map((brick) => (
                      <SelectItem key={brick} value={brick}>
                        {brick}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {showDelegateFilter && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delegate</label>
                  <Select value={selectedDelegate} onValueChange={setSelectedDelegate}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Delegates" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Delegates</SelectItem>
                      {uniqueDelegates.map((delegate) => (
                        <SelectItem key={delegate} value={delegate!}>
                          {delegate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {!isDelegateView && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
                  <Select value={selectedSector} onValueChange={setSelectedSector}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Sectors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sectors</SelectItem>
                      {uniqueSectors.map((sector) => (
                        <SelectItem key={sector} value={sector}>
                          {sector}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredData.length} of {processedData.length} sales plans
            </div>
          </CardContent>
        </Card>

        {/* Sales Plans Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Sales Plans Analysis</CardTitle>
            <p className="text-sm text-gray-500">
              Analyzing {effectiveDelegateIds.length} delegate(s) | Found {filteredData.length} sales plans
            </p>
          </CardHeader>
          <CardContent>
            {filteredData.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Sales Plans Found</h3>
                <p className="text-gray-600">
                  {processedData.length === 0 
                    ? (supervisorName 
                        ? `No sales plans found for ${supervisorName}.`
                        : profile?.role === 'Supervisor' 
                        ? 'No sales plans found for your supervised delegates.'
                        : 'No sales plans found for your profile.')
                    : 'No sales plans match the selected filters.'
                  }
                </p>
                {processedData.length > 0 && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSelectedProduct('all');
                      setSelectedBrick('all');
                      setSelectedSector('all');
                      if (showDelegateFilter) setSelectedDelegate('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Product Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Brick Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Sector</th>
                      {showDelegateFilter && (
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Delegate</th>
                      )}
                      {displayMonths.map((month, index) => (
                        <th 
                          key={month} 
                          className={`text-center py-3 px-4 font-medium text-gray-700 min-w-[80px] ${getMonthHighlightClass(index)}`}
                        >
                          {month}
                        </th>
                      ))}
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Achievement %</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Recruitment Rhythm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((plan) => (
                      <tr key={plan.id} className={getRowColorClass(plan.row_color)}>
                        <td className="py-4 px-4 font-medium">
                          {plan.product_name}
                        </td>
                        <td className="py-4 px-4">
                          {plan.brick_name}
                        </td>
                        <td className="py-4 px-4">
                          {plan.sector_name}
                        </td>
                        {showDelegateFilter && (
                          <td className="py-4 px-4">
                            {plan.delegate_name || 'N/A'}
                          </td>
                        )}
                        {displayMonths.map((_, index) => (
                          <td 
                            key={index} 
                            className={`py-4 px-4 text-center ${getMonthHighlightClass(index)}`}
                          >
                            <div className="text-sm">
                              <div className="font-medium">{plan.achievements[index] || 0} / {plan.targets[index] || 0}</div>
                              <div className="text-xs text-gray-500">
                                ({calculateMonthlyPercentage(plan.achievements[index] || 0, plan.targets[index] || 0)}%)
                              </div>
                            </div>
                          </td>
                        ))}
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAchievementPercentageColor(plan.achievement_percentage)}`}>
                            {plan.achievement_percentage}%
                          </span>
                        </td>
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
