
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

export const useRecruitmentData = (selectedMonth: string) => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const monthsElapsed = parseInt(selectedMonth);

  return useQuery({
    queryKey: ['recruitment-rhythm-analysis', user?.id, selectedMonth],
    queryFn: async (): Promise<SalesPlanData[]> => {
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

          const yearToDateTargets = targets.slice(0, monthsElapsed).reduce((sum: number, val: number) => sum + (val || 0), 0);
          const yearToDateAchievements = achievements.slice(0, monthsElapsed).reduce((sum: number, val: number) => sum + (val || 0), 0);

          const monthlyPerformance = targets.slice(0, monthsElapsed).map((target: number, index: number) => {
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
};
