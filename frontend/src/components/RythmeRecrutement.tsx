
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, TrendingUp, Calendar, Filter, Target, Package, Building, Users } from 'lucide-react';
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
  monthly_target: number;
  achievements: number[];
  rate: number | null;
  rythme_recrutement: number | null;
  row_color: 'red' | 'yellow' | 'green' | 'gray';
  delegate_id: string;
  delegate_name: string;
  supervisor_id?: string;
  supervisor_name?: string;
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
                    ? `Sales performance analysis for ${supervisorName}`
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
  const [selectedProduct, setSelectedProduct] = useState<string>('Nebilet');
  const [selectedBrick, setSelectedBrick] = useState<string>('all');
  const [selectedDelegate, setSelectedDelegate] = useState<string>('all');
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>('all');

  // Use provided delegateIds or fallback to current user
  const baseDelegateIds = delegateIds.length > 0 ? delegateIds : [profile?.id].filter(Boolean);
  
  // Check if this is a Sales Director view
  const isSalesDirectorView = profile?.role === 'Sales Director' && delegateIds.length > 0;
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Helper functions
  const getLastDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getMonthNames = () => {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  };

  // Fetch supervisors for Sales Director filtering
  const { data: supervisors = [] } = useQuery({
    queryKey: ['supervisors-for-filter-recruitment', profile?.id],
    queryFn: async () => {
      if (!isSalesDirectorView || !profile?.id) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('supervisor_id', profile.id)
        .eq('role', 'Supervisor');

      if (error) throw error;
      return data || [];
    },
    enabled: isSalesDirectorView,
  });

  // Calculate effective delegate IDs based on filters
  const getEffectiveDelegateIds = () => {
    let filtered = baseDelegateIds;
    
    if (selectedSupervisor !== 'all') {
      // Filter to only delegates under the selected supervisor
      filtered = delegates
        .filter(d => d.supervisor_id === selectedSupervisor)
        .map(d => d.id);
    }
    
    if (selectedDelegate !== 'all') {
      filtered = [selectedDelegate];
    }
    
    return filtered;
  };

  const effectiveDelegateIds = getEffectiveDelegateIds();

  // Fetch delegates with supervisor filtering
  const { data: delegates = [] } = useQuery({
    queryKey: ['delegates-for-filter-recruitment', baseDelegateIds.join(','), selectedSupervisor],
    queryFn: async () => {
      if (baseDelegateIds.length === 0) return [];
      
      let query = supabase
        .from('profiles')
        .select('id, first_name, last_name, supervisor_id')
        .in('id', baseDelegateIds)
        .eq('role', 'Delegate');

      if (selectedSupervisor !== 'all') {
        query = query.eq('supervisor_id', selectedSupervisor);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: baseDelegateIds.length > 0,
  });

  // Fetch products for filter - only Nebilet
  const { data: products = [] } = useQuery({
    queryKey: ['products-for-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .eq('name', 'Nebilet');

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

  // Fetch sales plans data
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

  // Fetch delegate profiles with supervisor info
  const { data: delegateProfiles = [] } = useQuery({
    queryKey: ['delegate-profiles-recruitment', effectiveDelegateIds.join(',')],
    queryFn: async () => {
      if (effectiveDelegateIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, supervisor_id')
        .in('id', effectiveDelegateIds);

      if (error) throw error;
      return data || [];
    },
    enabled: effectiveDelegateIds.length > 0,
  });

  // Fetch supervisor profiles for grouping
  const { data: supervisorProfiles = [] } = useQuery({
    queryKey: ['supervisor-profiles-recruitment', delegateProfiles],
    queryFn: async () => {
      if (!isSalesDirectorView || delegateProfiles.length === 0) return [];
      
      const supervisorIds = [...new Set(delegateProfiles.map(d => d.supervisor_id).filter(Boolean))];
      if (supervisorIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', supervisorIds);

      if (error) throw error;
      return data || [];
    },
    enabled: isSalesDirectorView && delegateProfiles.length > 0,
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

  // Process data when all queries are complete
  const { data: processedData = [], isLoading: isProcessing } = useQuery({
    queryKey: ['processed-recruitment-data', salesPlansData, salesData, allProducts, allBricks, delegateProfiles, supervisorProfiles, selectedMonth, selectedProduct, selectedBrick],
    queryFn: async () => {
      console.log('Processing recruitment data...');
      
      if (!salesPlansData.length || !allProducts.length || !allBricks.length) {
        console.log('Missing data for processing');
        return [];
      }

      const processed: RecruitmentData[] = [];
      const now = new Date();
      const currMonthIndex = now.getMonth(); // 0=Jan, 1=Feb...

      for (const salesPlan of salesPlansData) {
        const product = allProducts.find(p => p.id === salesPlan.product_id);
        const brick = allBricks.find(b => b.id === salesPlan.brick_id);
        const delegate = delegateProfiles.find(d => d.id === salesPlan.delegate_id);
        const supervisor = isSalesDirectorView 
          ? supervisorProfiles.find(s => s.id === delegate?.supervisor_id)
          : null;

        if (!product || !brick || !delegate) {
          console.log('Missing product, brick, or delegate data for sales plan:', salesPlan.id);
          continue;
        }

        // Apply filters
        if (selectedProduct !== 'all' && product.name !== selectedProduct) {
          continue;
        }

        if (selectedBrick !== 'all' && brick.name !== selectedBrick) {
          continue;
        }

        const planSales = salesData.filter(s => s.sales_plan_id === salesPlan.id);
        
        let achievements = Array(12).fill(0);
        let monthlyTarget = 0;

        if (planSales.length > 0) {
          const salesRecord = planSales[0];
          achievements = (salesRecord.achievements || Array(12).fill(0)).map(v => Number(v ?? 0));
          monthlyTarget = Number(salesRecord['monthly target'] ?? 0);
        }

        // Calculate Rate (average realization % for past months)
        const visibleMonths = achievements.slice(0, currMonthIndex);
        const ratios = visibleMonths
          .map(a => monthlyTarget > 0 ? (a / monthlyTarget) * 100 : null)
          .filter(v => v !== null) as number[];

        const rate = ratios.length > 0
          ? Math.round(ratios.reduce((sum, v) => sum + v, 0) / ratios.length)
          : null;

        // Calculate Rythme de recrutement
        const m = currMonthIndex + 1; // Jan=1
        const prev = achievements.slice(0, m - 1);
        const avgPrev = prev.length > 0
          ? prev.reduce((sum, v) => sum + v, 0) / prev.length
          : null;
        const denom = ((14 - m) * (13 - m)) / 2;

        let rythmeRecrutement = null;
        if (avgPrev !== null && monthlyTarget > 0 && denom > 0) {
          rythmeRecrutement = ((monthlyTarget - avgPrev) * 12) / denom;
          rythmeRecrutement = Math.max(0, Math.round(rythmeRecrutement));
        }

        // Determine row color based on rate
        let rowColor: 'red' | 'yellow' | 'green' | 'gray' = 'gray';
        if (rate !== null) {
          if (rate >= 100) {
            rowColor = 'green';
          } else if (rate >= 80) {
            rowColor = 'yellow';
          } else {
            rowColor = 'red';
          }
        }

        processed.push({
          id: salesPlan.id,
          product_name: product.name,
          brick_name: brick.name,
          monthly_target: monthlyTarget,
          achievements,
          rate,
          rythme_recrutement: rythmeRecrutement,
          row_color: rowColor,
          delegate_id: salesPlan.delegate_id,
          delegate_name: `${delegate.first_name} ${delegate.last_name}`,
          supervisor_id: delegate.supervisor_id,
          supervisor_name: supervisor ? `${supervisor.first_name} ${supervisor.last_name}` : undefined
        });
      }

      console.log('Processed recruitment data:', processed.length, 'items');
      return processed;
    },
    enabled: !salesPlansLoading && !salesLoading && allProducts.length > 0 && allBricks.length > 0 && delegateProfiles.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // Group data by supervisor and delegate
  const groupedData = React.useMemo(() => {
    if (isSalesDirectorView && selectedSupervisor === 'all') {
      // Group by supervisor first, then by delegate within each supervisor
      const supervisorGroups: { [key: string]: { [key: string]: RecruitmentData[] } } = {};
      
      processedData.forEach(plan => {
        const supervisorKey = plan.supervisor_id 
          ? `${plan.supervisor_id}|${plan.supervisor_name || 'Unknown Supervisor'}`
          : 'unknown|No Supervisor';
        const delegateKey = `${plan.delegate_id}|${plan.delegate_name}`;
        
        if (!supervisorGroups[supervisorKey]) {
          supervisorGroups[supervisorKey] = {};
        }
        if (!supervisorGroups[supervisorKey][delegateKey]) {
          supervisorGroups[supervisorKey][delegateKey] = [];
        }
        supervisorGroups[supervisorKey][delegateKey].push(plan);
      });
      
      return supervisorGroups;
    } else if (effectiveDelegateIds.length > 1) {
      // Group by delegate only
      const groups: { [key: string]: RecruitmentData[] } = {};
      processedData.forEach(plan => {
        const key = `${plan.delegate_id}|${plan.delegate_name}`;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(plan);
      });
      return { 'single': groups };
    }
    
    return { 'single': { 'all': processedData } };
  }, [processedData, effectiveDelegateIds, isSalesDirectorView, selectedSupervisor]);

  const isLoading = salesPlansLoading || salesLoading || isProcessing;
  const error = salesPlansError;

  const monthNames = getMonthNames();
  const displayMonths = monthNames.slice(0, currentMonth);

  const breadcrumbItems = [
    { label: 'Rythme de Recrutement' }
  ];

  const handleClearFilters = () => {
    setSelectedProduct('Nebilet');
    setSelectedBrick('all');
    setSelectedDelegate('all');
    setSelectedSupervisor('all');
  };

  const getRowColorClass = (color: 'red' | 'yellow' | 'green' | 'gray') => {
    switch (color) {
      case 'green':
        return 'bg-green-50 border-l-4 border-l-green-500';
      case 'yellow':
        return 'bg-yellow-50 border-l-4 border-l-yellow-500';
      case 'red':
        return 'bg-red-50 border-l-4 border-l-red-500';
      case 'gray':
        return 'bg-gray-50 border-l-4 border-l-gray-300';
      default:
        return '';
    }
  };

  const getRateColor = (rate: number | null) => {
    if (rate === null) return 'text-gray-600 bg-gray-100';
    if (rate >= 100) return 'text-green-600 bg-green-100';
    if (rate >= 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getMonthHighlightClass = (monthIndex: number) => {
    if (monthIndex < selectedMonth) {
      return 'bg-blue-50 border-2 border-blue-200';
    }
    return '';
  };

  const renderTable = (data: RecruitmentData[], delegateName?: string) => {
    const currMonthIndex = new Date().getMonth();
    const displayMonths = monthNames.slice(0, currMonthIndex);
    
    return (
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
              <th className="text-center py-3 px-4 font-medium text-gray-700">
                <div>Rythme de recrutement</div>
                <div className="text-xs font-normal text-gray-500 mt-1">
                  ((Target−moyenne)×12)/((14−m)(13−m)/2)
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((plan) => (
              <tr key={plan.id} className={getRowColorClass(plan.row_color)}>
                <td className="py-4 px-4 font-medium">
                  {plan.product_name}
                </td>
                <td className="py-4 px-4">
                  {plan.brick_name}
                </td>
                {displayMonths.map((_, index) => {
                  const achievement = plan.achievements[index] || 0;
                  const target = plan.monthly_target;
                  const ratio = target > 0 ? Math.round((achievement / target) * 100) : 0;
                  
                  return (
                    <td 
                      key={index} 
                      className={`py-4 px-4 text-center ${getMonthHighlightClass(index)}`}
                    >
                      <div className="text-sm">
                        <div className="font-medium">
                          {Math.round(achievement).toLocaleString('fr-FR')} / {Math.round(target).toLocaleString('fr-FR')}
                        </div>
                        <div className={`text-xs mt-1 px-1 py-0.5 rounded ${getRateColor(ratio)}`}>
                          {ratio}%
                        </div>
                      </div>
                    </td>
                  );
                })}
                <td className="py-4 px-4 text-center">
                  {plan.rate !== null ? (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRateColor(plan.rate)}`}>
                      {plan.rate}%
                    </span>
                  ) : (
                    <span className="text-gray-400">–</span>
                  )}
                </td>
                <td className="py-4 px-4 text-center">
                  {plan.rythme_recrutement !== null ? (
                    <span className="text-sm font-medium text-gray-900">
                      {plan.rythme_recrutement.toLocaleString('fr-FR')}
                    </span>
                  ) : (
                    <span className="text-gray-400">–</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
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
                    Analyzing recruitment rhythm for {supervisorName}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Supervisor Filter - only show for Sales Director */}
              {isSalesDirectorView && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supervisor</label>
                  <Select value={selectedSupervisor} onValueChange={setSelectedSupervisor}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Supervisors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Supervisors</SelectItem>
                      {supervisors.map((supervisor) => (
                        <SelectItem key={supervisor.id} value={supervisor.id}>
                          {supervisor.first_name} {supervisor.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct} disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Nebilet" />
                  </SelectTrigger>
                  <SelectContent>
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
                Filter recruitment data by {isSalesDirectorView ? 'supervisor, ' : ''}delegate, product and brick location
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
                {processedData.length > 0 && processedData.some(item => item.rate !== null)
                  ? Math.round(
                      processedData
                        .filter(item => item.rate !== null)
                        .reduce((sum, item) => sum + (item.rate || 0), 0) / 
                      processedData.filter(item => item.rate !== null).length
                    )
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
              <div>
                {isSalesDirectorView && selectedSupervisor === 'all' && Object.keys(groupedData).length > 1 ? (
                  <div className="space-y-8">
                    {(Object.entries(groupedData) as [string, { [key: string]: RecruitmentData[] }][]).map(([supervisorKey, delegateGroups]) => {
                      const [supervisorId, supervisorName] = supervisorKey.split('|');
                      const totalDelegates = Object.keys(delegateGroups).length;
                      
                      return (
                        <div key={supervisorKey}>
                          {/* Supervisor Section Header */}
                          <div className="mb-6">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="p-2 bg-purple-100 rounded-full">
                                <Building className="h-6 w-6 text-purple-600" />
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900">{supervisorName}</h3>
                                <p className="text-sm text-gray-600">{totalDelegates} delegate{totalDelegates !== 1 ? 's' : ''}</p>
                              </div>
                            </div>
                            <Separator className="mb-4" />
                          </div>
                          
                          {/* Delegates within this Supervisor */}
                          <div className="space-y-6 ml-8">
                            {Object.entries(delegateGroups).map(([delegateKey, data]) => {
                              const [delegateId, delegateName] = delegateKey.split('|');
                              return (
                                <div key={delegateKey}>
                                  <div className="flex items-center space-x-3 mb-3">
                                    <div className="p-1 bg-blue-100 rounded-full">
                                      <Users className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                      <h4 className="text-lg font-medium text-gray-800">{delegateName}</h4>
                                      <p className="text-xs text-gray-500">{data.length} sales plans</p>
                                    </div>
                                  </div>
                                  {renderTable(data, delegateName)}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : effectiveDelegateIds.length > 1 && Object.keys(groupedData.single || {}).length > 1 ? (
                  <div className="space-y-8">
                    {Object.entries(groupedData.single || {}).map(([key, data]) => {
                      const [delegateId, delegateName] = key.split('|');
                      return (
                        <div key={key}>
                          <div className="mb-4">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="p-2 bg-purple-100 rounded-full">
                                <Users className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{delegateName}</h3>
                                <p className="text-sm text-gray-600">{data.length} sales plans</p>
                              </div>
                            </div>
                            <Separator />
                          </div>
                          {renderTable(data, delegateName)}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  renderTable(processedData)
                )}
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
                <span>Green: Rate ≥ 100%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-50 border-l-4 border-l-yellow-500"></div>
                <span>Yellow: 80% ≤ Rate &lt; 100%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-50 border-l-4 border-l-red-500"></div>
                <span>Red: Rate &lt; 80%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-50 border-l-4 border-l-gray-300"></div>
                <span>Gray: No data</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-600">
              <p><strong>Note:</strong> Rate = average realization % across past months. Rythme = projected monthly sales needed to reach annual target.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RythmeRecrutement;
