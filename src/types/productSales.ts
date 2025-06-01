
import { Database } from '@/integrations/supabase/types';

export type ProductSales = Database['public']['Tables']['product_sales']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Brick = Database['public']['Tables']['bricks']['Row'];

export interface ProductSalesWithJoins extends ProductSales {
  products?: Pick<Product, 'name'> | null;
  bricks?: Pick<Brick, 'name' | 'region'> | null;
}

export interface ProductSalesFormData {
  product_id: string;
  brick_id: string;
  month: number;
  year: number;
  target_sales: number;
  actual_sales: number;
}
