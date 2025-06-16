import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Package, TrendingUp, Target, Calendar, MapPin, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductsListProps {
  onBack: () => void;
}

interface ProductData {
  id: string;
  name: string;
  therapeutic_class: string | null;
  totalSales: number;
  totalObjectives: number;
  objectivePercentage: number;
  numberOfTerritories: number;
}

const ProductsList = ({ onBack }: ProductsListProps) => {
  const { t } = useLanguage();
  const [selectedTerritory, setSelectedTerritory] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('11');

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products-sales-data', selectedMonth],
    queryFn: async () => {
      console.log('Fetching products and sales data from Supabase...');
      
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('active', true);

      if (productsError) {
        console.error('Error fetching products:', productsError);
        throw productsError;
      }

      // For each product, get sales data
      const productsWithData = await Promise.all(
        productsData.map(async (product) => {
          // Get sales data for this product using the 'sales' table
          const { data: sales, error: salesError } = await supabase
            .from('sales')
            .select('*');

          if (salesError) {
            console.error('Error fetching sales:', salesError);
          }

          // Count the number of sales records as proxy for sales volume
          const totalSales = sales?.length || 0;
          
          // Calculate monthly objective from the sales table
          const monthIndex = parseInt(selectedMonth) - 1;
          const totalObjectives = sales?.reduce((sum, sale) => {
            const monthlyObjective = sale.monthly_objective?.[monthIndex] || 0;
            return sum + Number(monthlyObjective);
          }, 0) || 1;
          
          // Count unique sales plans as proxy for territories
          const uniqueTerritories = new Set(sales?.map(s => s.sales_plan_id).filter(Boolean)).size;

          return {
            id: product.id,
            name: product.name,
            therapeutic_class: product.therapeutic_class,
            totalSales,
            totalObjectives,
            objectivePercentage: totalObjectives > 0 ? Math.round((totalSales / totalObjectives) * 100) : 0,
            numberOfTerritories: uniqueTerritories
          };
        })
      );

      console.log('Products with sales data:', productsWithData);
      return productsWithData as ProductData[];
    }
  });

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getTrendColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const totalSales = products.reduce((sum, product) => sum + product.totalSales, 0);
  const totalObjectives = products.reduce((sum, product) => sum + product.totalObjectives, 0);
  const globalPerformance = totalObjectives > 0 ? Math.round((totalSales / totalObjectives) * 100) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{t('common.error')}</p>
          <Button onClick={onBack}>{t('common.back')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-green-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack} className="p-2 hover:bg-green-50">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-green-600 to-green-700 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.products')}</h1>
                  <p className="text-sm text-gray-600">Global performance: {globalPerformance}%</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Calendar className="h-3 w-3 mr-1" />
                {selectedMonth === '11' ? 'November' : 'December'} 2024
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Sales</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatNumber(totalSales)}</div>
              <p className="text-xs text-green-600 font-medium">Number of transactions</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Objective</CardTitle>
              <Target className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatNumber(totalObjectives)}</div>
              <p className="text-xs text-gray-600">Monthly target</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Performance</CardTitle>
              <Activity className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getPerformanceColor(globalPerformance)}`}>
                {globalPerformance}%
              </div>
              <Progress value={globalPerformance} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">{t('common.filters')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t('common.territory')}</label>
                <Select value={selectedTerritory} onValueChange={setSelectedTerritory}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.allTerritories')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.allTerritories')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t('common.month')}</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">October 2024</SelectItem>
                    <SelectItem value="11">November 2024</SelectItem>
                    <SelectItem value="12">December 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {products.map((product, index) => {
            const colors = [
              'from-blue-500 to-blue-600',
              'from-indigo-500 to-indigo-600', 
              'from-green-500 to-green-600',
              'from-purple-500 to-purple-600',
              'from-red-500 to-red-600',
              'from-orange-500 to-orange-600'
            ];
            const color = colors[index % colors.length];
            
            return (
              <Card key={product.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 bg-gradient-to-r ${color} rounded-lg`}>
                        <Package className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900">{product.name}</CardTitle>
                        <p className="text-sm text-gray-600">{product.therapeutic_class || 'Class not specified'}</p>
                      </div>
                    </div>
                    <Badge className={`${getPerformanceColor(product.objectivePercentage)} bg-opacity-10`}>
                      {product.objectivePercentage}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Performance Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Progress towards objective</span>
                      <span className={`text-sm font-bold ${getPerformanceColor(product.objectivePercentage)}`}>
                        {product.objectivePercentage}%
                      </span>
                    </div>
                    <Progress value={product.objectivePercentage} className="h-3" />
                  </div>

                  {/* Sales Info */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Transactions completed</span>
                      <span className="font-semibold text-gray-900">{formatNumber(product.totalSales)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Monthly objective</span>
                      <span className="font-semibold text-gray-900">{formatNumber(product.totalObjectives)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Remaining to achieve</span>
                      <span className="font-semibold text-red-600">
                        {formatNumber(Math.max(0, product.totalObjectives - product.totalSales))}
                      </span>
                    </div>
                  </div>

                  {/* KPIs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-600">Territories</span>
                      </div>
                      <div className="text-lg font-bold text-blue-700">
                        {product.numberOfTerritories}
                      </div>
                    </div>

                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <Activity className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-medium text-green-600">Status</span>
                      </div>
                      <div className="text-sm font-bold text-green-700">
                        {product.totalSales > 0 ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    View analytics details
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {products.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('common.noDataFound')}</h3>
              <p className="text-gray-600">No data available for the selected period.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProductsList;
