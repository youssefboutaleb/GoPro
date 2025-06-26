
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, Calendar, Filter, Target, Package, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import BreadcrumbNavigation from './common/BreadcrumbNavigation';

interface RythmeRecrutementProps {
  onBack: () => void;
  delegateIds?: string[];
  supervisorName?: string;
}

interface RecruitmentData {
  id: string;
  product_name: string;
  brick_name: string;
  planned_sales: number[];
  actual_sales: number[];
  recruitment_rate: number;
  row_color: 'red' | 'yellow' | 'green';
}

interface RecruitmentHeaderProps {
  selectedMonth: number;
  onMonthChange: (month: number) => void;
  onBack: () => void;
  supervisorName?: string;
}

const RecruitmentHeader: React.FC<RecruitmentHeaderProps> = ({ 
  selectedMonth, 
  onMonthChange, 
  onBack, 
  supervisorName 
}) => {
  const currentMonth = new Date().getMonth() + 1;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const displayMonths = monthNames.slice(0, currentMonth);

  return (
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
                    ? `Sales performance analysis for ${supervisorName}'s team`
                    : 'Sales performance and recruitment rhythm analysis'
                  }
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={selectedMonth.toString()} onValueChange={(value) => onMonthChange(parseInt(value))}>
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
  );
};

const RythmeRecrutement: React.FC<RythmeRecrutementProps> = ({ 
  onBack, 
  delegateIds = [], 
  supervisorName 
}) => {
  const { profile } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [selectedBrick, setSelectedBrick] = useState<string>('all');

  // Use provided delegateIds or fallback to current user
  const effectiveDelegateIds = delegateIds.length > 0 ? delegateIds : [profile?.id].filter(Boolean);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Helper functions
  const getLastDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getMonthNames = () => {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  };

  // Fetch products for filter
  const { data: products = [] } = useQuery({
    queryKey: ['products-for-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name');

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch bricks for filter
  const { data: bricks = [] } = useQuery({
    queryKey: ['bricks-for-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bricks')
        .select('id, name');

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch sales plans data separately (no joins)
  const { data: salesPlansData = [], isLoading: salesPlansLoading, error: salesPlansError } = useQuery({
    queryKey: ['recruitment-rhythm-sales-plans', effectiveDelegateIds.join(',')],
    queryFn: async () => {
      console.log('Fetching sales plans for recruitment rhythm:', effectiveDelegateIds);
      
      if (effectiveDelegateIds.length === 0) {
        console.log('No delegate IDs provided');
        return [];
      }

      try {
        const { data, error } = await supabase
          .from('sales_plans')
          .select('id, delegate_id, product_id, brick_id')
          .in('delegate_id', effectiveDelegateIds);

        if (error) {
          console.error('Sales plans query error for recruitment rhythm:', error);
          throw error;
        }

        console.log('Sales plans fetched successfully for recruitment rhythm:', data?.length || 0, 'items');
        return data || [];
      } catch (error) {
        console.error('Error in sales plans query for recruitment rhythm:', error);
        throw error;
      }
    },
    enabled: effectiveDelegateIds.length > 0,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch all products separately
  const { data: allProducts = [] } = useQuery({
    queryKey: ['all-products-recruitment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name');

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch all bricks separately
  const { data: allBricks = [] } = useQuery({
    queryKey: ['all-bricks-recruitment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bricks')
        .select('id, name');

      if (error) throw error;
      return data || [];
    },
  });

  const salesPlanIds = salesPlansData.map(plan => plan.id);

  // Fetch sales data
  const { data: salesData = [], isLoading: salesLoading } = useQuery({
    queryKey: ['recruitment-rhythm-sales', salesPlanIds.join(','), selectedMonth],
    queryFn: async () => {
      if (salesPlanIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .in('sales_plan_id', salesPlanIds)
        .eq('year', currentYear);

      if (error) {
        console.error('Sales data query error:', error);
        throw error;
      }

      return data || [];
    },
    enabled: salesPlanIds.length > 0,
  });

  // Process data when all queries are complete - now with frontend joins
  const { data: processedData = [], isLoading: isProcessing } = useQuery({
    queryKey: ['processed-recruitment-data', salesPlansData, salesData, allProducts, allBricks, selectedMonth, selectedProduct, selectedBrick],
    queryFn: async () => {
      console.log('Processing recruitment data...');
      
      if (!salesPlansData.length || !allProducts.length || !allBricks.length) {
        console.log('Missing data for processing');
        return [];
      }

      const processed: RecruitmentData[] = [];

      for (const salesPlan of salesPlansData) {
        // Join product and brick data in JavaScript
        const product = allProducts.find(p => p.id === salesPlan.product_id);
        const brick = allBricks.find(b => b.id === salesPlan.brick_id);

        if (!product || !brick) {
          console.log('Missing product or brick data for sales plan:', salesPlan.id);
          continue;
        }

        // Apply filters
        if (selectedProduct !== 'all' && product.name !== selectedProduct) {
          continue;
        }

        if (selectedBrick !== 'all' && brick.name !== selectedBrick) {
          continue;
        }

        // Find sales data for this plan
        const planSales = salesData.filter(s => s.sales_plan_id === salesPlan.id);
        
        // Use targets and achievements arrays from sales data
        let planned_sales = Array(12).fill(0);
        let actual_sales = Array(12).fill(0);

        if (planSales.length > 0) {
          const salesRecord = planSales[0];
          planned_sales = salesRecord.targets || Array(12).fill(0);
          actual_sales = salesRecord.achievements || Array(12).fill(0);
        }

        // Calculate recruitment rate up to selected month
        let totalPlanned = 0;
        let totalActual = 0;

        for (let i = 0; i < selectedMonth; i++) {
          totalPlanned += planned_sales[i] || 0;
          totalActual += actual_sales[i] || 0;
        }

        const recruitmentRate = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;

        let rowColor: 'red' | 'yellow' | 'green' = 'red';
        if (recruitmentRate >= 80) {
          rowColor = 'green';
        } else if (recruitmentRate >= 60) {
          rowColor = 'yellow';
        }

        processed.push({
          id: salesPlan.id,
          product_name: product.name,
          brick_name: brick.name,
          planned_sales,
          actual_sales,
          recruitment_rate: recruitmentRate,
          row_color: rowColor
        });
      }

      console.log('Processed recruitment data:', processed.length, 'items');
      return processed;
    },
    enabled: !salesPlansLoading && !salesLoading && allProducts.length > 0 && allBricks.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = salesPlansLoading || salesLoading || isProcessing;
  const error = salesPlansError;

  const monthNames = getMonthNames();
  const displayMonths = monthNames.slice(0, currentMonth);

  const breadcrumbItems = [
    { label: 'Rythme de Recrutement' }
  ];

  const handleClearFilters = () => {
    setSelectedProduct('all');
    setSelectedBrick('all');
  };

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

  const getRecruitmentRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-100';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getMonthHighlightClass = (monthIndex: number) => {
    if (monthIndex < selectedMonth) {
      return 'bg-blue-50 border-2 border-blue-200';
    }
    return '';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recruitment analysis...</p>
          <p className="text-sm text-gray-500 mt-2">
            Delegates: {effectiveDelegateIds.length}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Recruitment rhythm component error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading recruitment analysis</p>
          <p className="text-sm text-gray-600 mb-4">{error.message}</p>
          <Button onClick={onBack}>Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <RecruitmentHeader 
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        onBack={onBack}
        supervisorName={supervisorName}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <BreadcrumbNavigation 
          items={breadcrumbItems}
          onBack={onBack}
          showHomeIcon={true}
        />

        {supervisorName && (
          <div className="mb-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">Team Recruitment Analysis</h3>
                  <p className="text-gray-600 mt-2">
                    Analyzing recruitment rhythm for {supervisorName}'s team
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-lg">Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.name}>
                        {product.name}
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
                    {bricks.map((brick) => (
                      <SelectItem key={brick.id} value={brick.name}>
                        {brick.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Filter recruitment data by product and brick location
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-sm">Total Sales Plans</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{processedData.length}</div>
              <p className="text-xs text-gray-600 mt-1">Active sales plans</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-600" />
                <CardTitle className="text-sm">Average Rate</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {processedData.length > 0 
                  ? Math.round(processedData.reduce((sum, item) => sum + item.recruitment_rate, 0) / processedData.length)
                  : 0}%
              </div>
              <p className="text-xs text-gray-600 mt-1">Team average</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-sm">Analysis Period</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{monthNames[selectedMonth - 1]}</div>
              <p className="text-xs text-gray-600 mt-1">Current period</p>
            </CardContent>
          </Card>
        </div>

        {/* Recruitment Analysis Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Sales Performance Analysis</CardTitle>
            <p className="text-sm text-gray-500">
              Analyzing {effectiveDelegateIds.length} delegate(s) | Found {processedData.length} sales plans
            </p>
          </CardHeader>
          <CardContent>
            {processedData.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Sales Plans Found</h3>
                <p className="text-gray-600">
                  {supervisorName 
                    ? `No sales plans found for ${supervisorName}.`
                    : 'No sales plans found for your profile.'
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Brick</th>
                      {displayMonths.map((month, index) => (
                        <th 
                          key={month} 
                          className={`text-center py-3 px-4 font-medium text-gray-700 min-w-[80px] ${getMonthHighlightClass(index)}`}
                        >
                          {month}
                        </th>
                      ))}
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Rate</th>
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
                              <div className="font-medium">
                                {Math.round(plan.actual_sales[index] || 0).toLocaleString()} / {Math.round(plan.planned_sales[index] || 0).toLocaleString()}
                              </div>
                            </div>
                          </td>
                        ))}
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRecruitmentRateColor(plan.recruitment_rate)}`}>
                            {plan.recruitment_rate}%
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
                <span>Green: Recruitment Rate ≥ 80%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-50 border-l-4 border-l-yellow-500"></div>
                <span>Yellow: 60% ≤ Recruitment Rate &lt; 80%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-50 border-l-4 border-l-red-500"></div>
                <span>Red: Recruitment Rate &lt; 60%</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-600">
              <p><strong>Note:</strong> Shows actual sales vs planned sales per month. Values are in local currency.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RythmeRecrutement;
