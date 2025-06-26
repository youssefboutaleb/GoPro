
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, TrendingUp, Calendar, Download, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import RecruitmentHeader from './recruitment/RecruitmentHeader';
import RecruitmentSummaryCards from './recruitment/RecruitmentSummaryCards';
import RecruitmentTable from './recruitment/RecruitmentTable';
import RecruitmentLegend from './recruitment/RecruitmentLegend';
import BreadcrumbNavigation from './common/BreadcrumbNavigation';
import SearchBar from './common/SearchBar';
import FloatingActionButton from './common/FloatingActionButton';

interface RythmeRecrutementProps {
  onBack: () => void;
  delegateIds?: string[];
  supervisorName?: string;
  showDelegateFilter?: boolean;
}

const RythmeRecrutement: React.FC<RythmeRecrutementProps> = ({ 
  onBack, 
  delegateIds = [], 
  supervisorName,
  showDelegateFilter = false
}) => {
  const { profile } = useAuth();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedBrick, setSelectedBrick] = useState<string>('all');
  const [selectedDelegate, setSelectedDelegate] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use provided delegateIds or fallback to current user
  const effectiveDelegateIds = delegateIds.length > 0 ? delegateIds : [profile?.id].filter(Boolean);
  
  // Check if this is accessed by a delegate (no delegateIds provided means it's from delegate dashboard)
  const isDelegateView = delegateIds.length === 0;

  // Generate years for selector
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Generate months for selector
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  // Fetch sectors (only for supervisor view)
  const { data: sectors = [] } = useQuery({
    queryKey: ['sectors-for-recruitment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sectors')
        .select('id, name');

      if (error) throw error;
      return data || [];
    },
    enabled: !isDelegateView,
  });

  // Fetch bricks
  const { data: bricks = [] } = useQuery({
    queryKey: ['bricks-for-recruitment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bricks')
        .select('id, name');

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch delegates (only when showDelegateFilter is true)
  const { data: delegates = [] } = useQuery({
    queryKey: ['delegates-for-recruitment', effectiveDelegateIds],
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

  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ['products-for-recruitment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name');

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch sales plans data
  const { data: salesPlansData = [], isLoading: salesPlansLoading, refetch } = useQuery({
    queryKey: ['recruitment-sales-plans', effectiveDelegateIds, selectedYear, selectedMonth, selectedSector, selectedBrick, selectedDelegate, selectedProduct],
    queryFn: async () => {
      if (effectiveDelegateIds.length === 0) return [];

      const filteredDelegateIds = selectedDelegate === 'all' ? effectiveDelegateIds : [selectedDelegate];
      
      // Build query for sales plans
      let query = supabase
        .from('sales_plans')
        .select(`
          id,
          delegate_id,
          brick_id,
          product_id,
          products!sales_plans_product_id_fkey(id, name),
          bricks!sales_plans_brick_id_fkey(id, name),
          profiles!sales_plans_delegate_id_fkey(id, first_name, last_name)
        `)
        .in('delegate_id', filteredDelegateIds);

      // Apply brick filter
      if (selectedBrick !== 'all') {
        const selectedBrickData = bricks.find(b => b.name === selectedBrick);
        if (selectedBrickData) {
          query = query.eq('brick_id', selectedBrickData.id);
        }
      }

      // Apply product filter
      if (selectedProduct !== 'all') {
        const selectedProductData = products.find(p => p.name === selectedProduct);
        if (selectedProductData) {
          query = query.eq('product_id', selectedProductData.id);
        }
      }

      const { data: salesPlans, error: salesPlansError } = await query;

      if (salesPlansError) throw salesPlansError;

      if (!salesPlans || salesPlans.length === 0) return [];

      // Fetch sales data for these plans
      const salesPlanIds = salesPlans.map(sp => sp.id);
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .in('sales_plan_id', salesPlanIds)
        .eq('year', selectedYear);

      if (salesError) throw salesError;

      // Process the data
      const processed = salesPlans.map(plan => {
        const sales = salesData?.find(s => s.sales_plan_id === plan.id);
        const targets = sales?.targets || Array(12).fill(0);
        const achievements = sales?.achievements || Array(12).fill(0);
        
        // Calculate achievement percentage for the selected month
        const monthIndex = selectedMonth - 1;
        const target = targets[monthIndex] || 0;
        const achievement = achievements[monthIndex] || 0;
        const achievementPercentage = target > 0 ? Math.round((achievement / target) * 100) : 0;

        return {
          id: plan.id,
          delegate_name: plan.profiles ? `${plan.profiles.first_name} ${plan.profiles.last_name}` : 'Unknown',
          brick_name: plan.bricks?.name || 'Unknown',
          product_name: plan.products?.name || 'Unknown',
          target,
          achievement,
          achievement_percentage: achievementPercentage,
          monthly_targets: targets,
          monthly_achievements: achievements
        };
      });

      // Apply sector filter at the processed data level (if not delegate view)
      if (!isDelegateView && selectedSector !== 'all') {
        // This would require additional logic to filter by sector
        // For now, we'll return all data since sector filtering is complex
        return processed;
      }

      return processed;
    },
    enabled: effectiveDelegateIds.length > 0,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleExportData = () => {
    console.log('Exporting recruitment data...');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearFilters = () => {
    setSelectedSector('all');
    setSelectedBrick('all');
    setSelectedDelegate('all');
    setSelectedProduct('all');
  };

  // Filter data based on search
  const filteredData = salesPlansData.filter(item =>
    item.delegate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.brick_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.product_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const floatingActions = [
    {
      label: 'Refresh Data',
      icon: RefreshCw,
      onClick: handleRefresh,
      color: 'bg-blue-600'
    },
    {
      label: 'Export Report',
      icon: Download,
      onClick: handleExportData,
      color: 'bg-green-600'
    }
  ];

  const breadcrumbItems = supervisorName 
    ? [
        { label: 'Team Management', onClick: onBack },
        { label: `Recruitment Analysis - ${supervisorName}` }
      ]
    : [
        { label: 'Recruitment Rate Analysis' }
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <RecruitmentHeader 
        onBack={onBack}
        supervisorName={supervisorName}
        isDelegateView={isDelegateView}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <BreadcrumbNavigation items={breadcrumbItems} onBack={onBack} />

        {/* Filters Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row lg:items-end space-y-4 lg:space-y-0 lg:space-x-4">
              <SearchBar
                placeholder="Search delegates, bricks, products..."
                onSearch={handleSearch}
                value={searchQuery}
                className="flex-1 lg:max-w-xs"
              />

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                  <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Only show sector filter for supervisor view */}
                {!isDelegateView && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
                    <Select value={selectedSector} onValueChange={setSelectedSector}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Sectors" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sectors</SelectItem>
                        {sectors.map((sector) => (
                          <SelectItem key={sector.id} value={sector.name}>
                            {sector.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

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

                {showDelegateFilter && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delegate</label>
                    <Select value={selectedDelegate} onValueChange={setSelectedDelegate}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Delegates" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Delegates</SelectItem>
                        {delegates.map((delegate) => (
                          <SelectItem key={delegate.id} value={delegate.id}>
                            {delegate.first_name} {delegate.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

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
              </div>

              <Button 
                variant="outline" 
                onClick={handleClearFilters}
                className="lg:ml-4"
              >
                Clear Filters
              </Button>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredData.length} of {salesPlansData.length} sales plans for {selectedMonth}/{selectedYear}
            </div>
          </CardContent>
        </Card>

        <RecruitmentSummaryCards 
          data={filteredData}
          selectedMonth={selectedMonth}
          isLoading={salesPlansLoading}
        />

        <RecruitmentTable 
          data={filteredData}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          isLoading={salesPlansLoading}
        />

        <RecruitmentLegend />
      </div>

      <FloatingActionButton actions={floatingActions} />
    </div>
  );
};

export default RythmeRecrutement;
