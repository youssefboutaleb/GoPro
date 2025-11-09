import pgPromise from 'pg-promise';

const pgp = pgPromise();

// Database connection configuration
const config = {
  host: process.env.NEXT_PUBLIC_DB_HOST || 'localhost',
  port: parseInt(process.env.NEXT_PUBLIC_DB_PORT || '5432'),
  database: process.env.NEXT_PUBLIC_DB_NAME || 'medico_db',
  user: process.env.NEXT_PUBLIC_DB_USER || 'medico_user',
  password: process.env.NEXT_PUBLIC_DB_PASSWORD || 'medico_password',
};

// Create a singleton database instance
const db = pgp(config);

// Utility function to generate UUID
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Common database query wrapper with error handling
export async function query<T>(queryText: string, values: any[] = []): Promise<T[]> {
  try {
    return await db.any<T>(queryText, values);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Single row query wrapper
export async function queryOne<T>(queryText: string, values: any[] = []): Promise<T | null> {
  try {
    return await db.oneOrNone<T>(queryText, values);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Type definitions for common database entities
export interface Region {
  id: string;
  name: string;
  created_at: Date;
}

export interface Brick {
  id: string;
  name: string;
  region_id: string;
  created_at: Date;
}

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  supervisor_id?: string;
  created_at: Date;
}

export interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  specialty: string;
  brick_id: string;
  created_at: Date;
}

export interface VisitPlan {
  id: string;
  delegate_id: string;
  doctor_id: string;
  visit_frequency: number;
  status: string;
  created_at: Date;
}

export interface Visit {
  id: string;
  visit_plan_id: string;
  visit_date: Date;
  status: string;
  notes?: string;
  created_at: Date;
}

export interface ActionPlanCategory {
  id: string;
  name: string;
  created_at: Date;
}

export interface ActionPlan {
  id: string;
  title: string;
  description: string;
  created_by: string;
  supervisor_status: string;
  sales_director_status: string;
  marketing_manager_status: string;
  category_id: string;
  due_date: Date;
  targeted_delegates: string[];
  created_at: Date;
}

export interface SalesPlan {
  id: string;
  delegate_id: string;
  month: number;
  year: number;
  target_value: number;
  actual_value: number;
  status: string;
  created_at: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  created_at: Date;
}

export interface Sale {
  id: string;
  delegate_id: string;
  product_id: string;
  quantity: number;
  sale_date: Date;
  created_at: Date;
}

export default db;