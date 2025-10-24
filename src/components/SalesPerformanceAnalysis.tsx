import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Package, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface SalesPerformanceAnalysisProps {
  delegateId?: string;
}

interface SalesData {
  id: string;
  product_name: string;
  brick_name: string;
  achievements: number[];
  monthly_target: number;
  delegate_name?: string;
}

const computeRythmeDeRecrutement = (achievements: number[], monthlyTarget: number): number | null => {
  const now = new Date();
  const currMonthIndex = now.getMonth(); // 0=Janvier ... 11=Décembre
  const m = currMonthIndex + 1; // Janvier=1, Février=2, ...

  // on prend uniquement les mois AVANT le mois courant:
  const prev = achievements
    .slice(0, m - 1)
    .map(x => Number(x ?? 0));

  const avgPrev = prev.length > 0
    ? prev.reduce((sum, v) => sum + v, 0) / prev.length
    : null;

  const denom = ((14 - m) * (13 - m)) / 2;

  if (avgPrev === null || !monthlyTarget || monthlyTarget <= 0 || denom <= 0) {
    return null;
  }

  const raw = ((monthlyTarget - avgPrev) * 12) / denom;
  const val = Math.max(0, Math.round(raw)); // pas négatif

  return val;
};

const getPercentageBadgeColor = (percentage: number | null): string => {
  if (percentage === null) return 'bg-gray-500';
  if (percentage < 80) return 'bg-red-500';
  if (percentage <= 100) return 'bg-yellow-500';
  return 'bg-green-500';
};

const SalesPerformanceAnalysis: React.FC<SalesPerformanceAnalysisProps> = ({ delegateId }) => {
  const now = new Date();
  const currentMonthIndex = now.getMonth();
  const currentMonth = currentMonthIndex + 1;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const targetBricks = ['Gabes 2', 'Kebili', '2A1', '2B1', '3A1', '1A4'];
  const targetProduct = 'Nebilet';
  const defaultMonthlyTarget = 600;

  const { data: salesData = [], isLoading } = useQuery({
    queryKey: ['sales-performance', delegateId, targetProduct],
    queryFn: async () => {
      // Get delegate profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('id', delegateId)
        .single();

      if (!profile) throw new Error('Delegate not found');

      const delegateName = `${profile.first_name} ${profile.last_name}`;

      // Get product and brick IDs
      const { data: products } = await supabase
        .from('products')
        .select('id, name')
        .eq('name', targetProduct);

      const { data: bricks } = await supabase
        .from('bricks')
        .select('id, name')
        .in('name', targetBricks);

      if (!products || products.length === 0) throw new Error('Product not found');
      if (!bricks || bricks.length === 0) throw new Error('Bricks not found');

      const productId = products[0].id;
      const brickMap = new Map(bricks.map(b => [b.name, b.id]));

      const result: SalesData[] = [];
      let dataCreated = false;

      // For each brick in the specific order
      for (const brickName of targetBricks) {
        const brickId = brickMap.get(brickName);
        if (!brickId) continue;

        // Check if sales_plan exists
        let { data: salesPlan } = await supabase
          .from('sales_plans')
          .select('id')
          .eq('delegate_id', delegateId)
          .eq('product_id', productId)
          .eq('brick_id', brickId)
          .maybeSingle();

        // Create sales_plan if it doesn't exist
        if (!salesPlan) {
          const { data: newPlan } = await supabase
            .from('sales_plans')
            .insert({
              delegate_id: delegateId,
              product_id: productId,
              brick_id: brickId
            })
            .select('id')
            .single();
          
          salesPlan = newPlan;
          dataCreated = true;
        }

        if (!salesPlan) continue;

        // Check if sales record exists
        let { data: salesRecord } = await supabase
          .from('sales')
          .select('*')
          .eq('sales_plan_id', salesPlan.id)
          .eq('year', 2025)
          .maybeSingle();

        // Create or update sales record
        if (!salesRecord) {
          const achievements = Array.from({ length: 12 }, () => {
            const variation = 0.7 + Math.random() * 0.6;
            return Math.round(defaultMonthlyTarget * variation);
          });

          const { data: newSales } = await supabase
            .from('sales')
            .insert({
              sales_plan_id: salesPlan.id,
              year: 2025,
              achievements,
              'monthly target': defaultMonthlyTarget
            })
            .select('*')
            .single();

          salesRecord = newSales;
          dataCreated = true;
        }

        if (salesRecord) {
          let achievements = salesRecord.achievements || [];
          if (typeof achievements === 'string') {
            achievements = JSON.parse(achievements);
          }
          achievements = Array.isArray(achievements) 
            ? achievements.map(v => Number(v ?? 0))
            : [];
          
          while (achievements.length < 12) {
            achievements.push(0);
          }

          result.push({
            id: salesPlan.id,
            product_name: targetProduct,
            brick_name: brickName,
            achievements,
            monthly_target: Number(salesRecord['monthly target'] ?? defaultMonthlyTarget),
            delegate_name: delegateName,
          });
        }
      }

      if (dataCreated) {
        setTimeout(() => {
          toast.success('Sales data populated successfully');
        }, 100);
      }

      return result;
    },
  });

  // Calculate stats
  const totalSalesPlans = salesData.length;
  
  const averageRate = salesData.length > 0
    ? salesData.reduce((sum, row) => {
        const monthsToConsider = row.achievements.slice(0, currentMonth - 1);
        const rates = monthsToConsider.map((ach, i) => 
          row.monthly_target > 0 ? (ach / row.monthly_target) * 100 : 0
        );
        const avgRate = rates.length > 0 
          ? rates.reduce((a, b) => a + b, 0) / rates.length 
          : 0;
        return sum + avgRate;
      }, 0) / salesData.length
    : 0;

  const visibleMonths = monthNames.slice(0, currentMonth - 1);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active sales plans</p>
                <p className="text-3xl font-bold">{totalSalesPlans}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Team average</p>
                <p className="text-3xl font-bold">{averageRate.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current period</p>
                <p className="text-3xl font-bold">{monthNames[currentMonthIndex]}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Performance Analysis Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sales Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 bg-gray-50">Product</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 bg-gray-50">Brick</th>
                  {visibleMonths.map((month) => (
                    <th key={month} className="px-4 py-3 text-center font-semibold text-gray-700 bg-gray-50 min-w-[120px]">
                      {month}
                    </th>
                  ))}
                  {/* Future months - grayed out */}
                  {monthNames.slice(currentMonth - 1).map((month) => (
                    <th key={month} className="px-4 py-3 text-center font-semibold text-gray-400 bg-gray-50 min-w-[120px]">
                      {month}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 bg-gray-50 min-w-[100px]">
                    Rate
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 bg-gray-50 min-w-[150px]">
                    Rythme de recrutement
                    <span className="text-xs text-gray-500 block font-normal">
                      ((Target − moyenne des mois précédents)*12)/((14−m)(13−m)/2)
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {salesData.length === 0 ? (
                  <tr>
                    <td colSpan={2 + 12 + 2} className="px-4 py-8 text-center text-gray-500">
                      No sales data available
                    </td>
                  </tr>
                ) : (
                  salesData.map((row) => {
                    // Calculate Rate for this row
                    const monthsToConsider = row.achievements.slice(0, currentMonth - 1);
                    const rates = monthsToConsider.map((ach, i) => 
                      row.monthly_target > 0 ? (ach / row.monthly_target) * 100 : null
                    );
                    const validRates = rates.filter(r => r !== null) as number[];
                    const avgRate = validRates.length > 0 
                      ? validRates.reduce((a, b) => a + b, 0) / validRates.length 
                      : null;

                    // Calculate Rythme de recrutement
                    const rythme = computeRythmeDeRecrutement(row.achievements, row.monthly_target);

                    return (
                      <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.product_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{row.brick_name}</td>
                        
                        {/* Visible months */}
                        {row.achievements.slice(0, currentMonth - 1).map((ach, i) => {
                          const target = row.monthly_target;
                          const percentage = target > 0 ? (ach / target) * 100 : null;
                          
                          return (
                            <td key={i} className="px-4 py-3 text-center">
                              <div className="space-y-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {ach.toLocaleString('fr-FR')} / {target.toLocaleString('fr-FR')}
                                </div>
                                <div className="flex justify-center">
                                  <Badge 
                                    className={`${getPercentageBadgeColor(percentage)} text-white text-xs px-2 py-0.5`}
                                  >
                                    {percentage !== null ? `${Math.round(percentage)}%` : '–'}
                                  </Badge>
                                </div>
                              </div>
                            </td>
                          );
                        })}

                        {/* Future months - empty or grayed */}
                        {Array.from({ length: 12 - (currentMonth - 1) }).map((_, i) => (
                          <td key={`future-${i}`} className="px-4 py-3 text-center text-gray-300">
                            –
                          </td>
                        ))}

                        {/* Rate column */}
                        <td className="px-4 py-3 text-center">
                          <Badge 
                            className={`${getPercentageBadgeColor(avgRate)} text-white text-sm px-3 py-1`}
                          >
                            {avgRate !== null ? `${Math.round(avgRate)}%` : '–'}
                          </Badge>
                        </td>

                        {/* Rythme de recrutement column */}
                        <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                          {rythme !== null ? rythme.toLocaleString('fr-FR') : '–'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesPerformanceAnalysis;
