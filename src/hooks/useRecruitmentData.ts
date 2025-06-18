
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SalesPlanData {
  id: string;
  product_name: string;
  brick_name: string | null;
  monthly_achievements: number[];
  monthly_targets: number[];
  recruitment_rhythm: number;
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

          // Get data only up to selected month
          const monthlyTargets = targets.slice(0, monthsElapsed);
          const monthlyAchievements = achievements.slice(0, monthsElapsed);

          // Calculate recruitment rhythm according to your formula
          const sumOfTargets = monthlyTargets.reduce((sum: number, val: number) => sum + (val || 0), 0);
          const achievementsYTD = monthlyAchievements.reduce((sum: number, val: number) => sum + (val || 0), 0);
          
          const n = 12 - monthsElapsed; // remaining months
          const denominator = n * (n + 1) / 2;
          const numerator = sumOfTargets - achievementsYTD;
          
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
            monthly_achievements: monthlyAchievements,
            monthly_targets: monthlyTargets,
            recruitment_rhythm: recruitmentRhythm,
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
