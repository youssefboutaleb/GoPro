import { ActionPlan as DBActionPlan, ActionPlanCategory, query, queryOne, generateUUID } from '@/lib/db';

// Backward compatibility interface
export interface ActionPlan {
  id: string;
  title: string;
  description: string;
  created_by: string;
  supervisor_status: 'Pending' | 'Approved' | 'Rejected';
  sales_director_status: 'Pending' | 'Approved' | 'Rejected';
  marketing_manager_status: 'Pending' | 'Approved' | 'Rejected';
  targeted_delegates: string[];
  created_at: string;
  category?: string;
  due_date?: string;
}

export interface ActionPlanWithDetails extends DBActionPlan {
  category_name?: string;
  creator_name?: string;
  delegate_names?: string[];
}

export class ActionPlanService {
  // Backward compatibility method
  static async getActionPlans(userId: string): Promise<ActionPlan[]> {
    return await query<ActionPlan>(`
      SELECT * FROM action_plans 
      WHERE created_by = $1 
      OR $1 = ANY(targeted_delegates)
      ORDER BY created_at DESC
    `, [userId]);
  }

  // Get all action plans
  static async getAllActionPlans(): Promise<ActionPlanWithDetails[]> {
    return await query<ActionPlanWithDetails>(`
      SELECT 
        ap.*,
        apc.name as category_name,
        CONCAT(p.first_name, ' ', p.last_name) as creator_name
      FROM action_plans ap
      LEFT JOIN action_plan_categories apc ON ap.category_id = apc.id
      LEFT JOIN profiles p ON ap.created_by = p.id
      ORDER BY ap.created_at DESC
    `);
  }

  // Get action plan by ID
  static async getActionPlanById(id: string): Promise<ActionPlanWithDetails | null> {
    return await queryOne<ActionPlanWithDetails>(`
      SELECT 
        ap.*,
        apc.name as category_name,
        CONCAT(p.first_name, ' ', p.last_name) as creator_name
      FROM action_plans ap
      LEFT JOIN action_plan_categories apc ON ap.category_id = apc.id
      LEFT JOIN profiles p ON ap.created_by = p.id
      WHERE ap.id = $1
    `, [id]);
  }

  // Create new action plan
  static async createActionPlan(plan: Omit<DBActionPlan, 'id' | 'created_at'>): Promise<DBActionPlan> {
    const id = generateUUID();
    const result = await queryOne<DBActionPlan>(
      `INSERT INTO action_plans (
        id, title, description, created_by, supervisor_status,
        sales_director_status, marketing_manager_status, category_id,
        due_date, targeted_delegates
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        id, plan.title, plan.description, plan.created_by,
        plan.supervisor_status || 'Pending',
        plan.sales_director_status || 'Pending',
        plan.marketing_manager_status || 'Pending',
        plan.category_id, plan.due_date, plan.targeted_delegates
      ]
    );
    if (!result) throw new Error('Failed to create action plan');
    return result;
  }

  // Update action plan
  static async updateActionPlan(id: string, plan: Partial<DBActionPlan>): Promise<DBActionPlan | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;

    Object.entries(plan)
      .filter(([key]) => key !== 'id' && key !== 'created_at')
      .forEach(([key, value]) => {
        if (value !== undefined) {
          updates.push(`${key} = $${paramCounter}`);
          values.push(value);
          paramCounter++;
        }
      });

    if (updates.length === 0) return await this.getActionPlanById(id);

    values.push(id);
    const query = `
      UPDATE action_plans
      SET ${updates.join(', ')}
      WHERE id = $${paramCounter}
      RETURNING *
    `;

    return await queryOne<DBActionPlan>(query, values);
  }

  // Delete action plan
  static async deleteActionPlan(id: string): Promise<boolean> {
    const result = await queryOne<{ id: string }>(
      'DELETE FROM action_plans WHERE id = $1 RETURNING id',
      [id]
    );
    return result !== null;
  }

  // Get action plans by creator
  static async getActionPlansByCreator(creatorId: string): Promise<ActionPlanWithDetails[]> {
    return await query<ActionPlanWithDetails>(`
      SELECT 
        ap.*,
        apc.name as category_name,
        CONCAT(p.first_name, ' ', p.last_name) as creator_name
      FROM action_plans ap
      LEFT JOIN action_plan_categories apc ON ap.category_id = apc.id
      LEFT JOIN profiles p ON ap.created_by = p.id
      WHERE ap.created_by = $1
      ORDER BY ap.created_at DESC
    `, [creatorId]);
  }

  // Get action plans for delegate
  static async getActionPlansForDelegate(delegateId: string): Promise<ActionPlanWithDetails[]> {
    return await query<ActionPlanWithDetails>(`
      SELECT 
        ap.*,
        apc.name as category_name,
        CONCAT(p.first_name, ' ', p.last_name) as creator_name
      FROM action_plans ap
      LEFT JOIN action_plan_categories apc ON ap.category_id = apc.id
      LEFT JOIN profiles p ON ap.created_by = p.id
      WHERE $1 = ANY(ap.targeted_delegates)
      ORDER BY ap.created_at DESC
    `, [delegateId]);
  }

  // Get all action plan categories
  static async getAllCategories(): Promise<ActionPlanCategory[]> {
    return await query<ActionPlanCategory>('SELECT * FROM action_plan_categories ORDER BY name');
  }

  // Create new category
  static async createCategory(name: string): Promise<ActionPlanCategory> {
    const id = generateUUID();
    const result = await queryOne<ActionPlanCategory>(
      'INSERT INTO action_plan_categories (id, name) VALUES ($1, $2) RETURNING *',
      [id, name]
    );
    if (!result) throw new Error('Failed to create category');
    return result;
  }

  // Update category
  static async updateCategory(id: string, name: string): Promise<ActionPlanCategory | null> {
    return await queryOne<ActionPlanCategory>(
      'UPDATE action_plan_categories SET name = $2 WHERE id = $1 RETURNING *',
      [id, name]
    );
  }

  // Delete category
  static async deleteCategory(id: string): Promise<boolean> {
    const result = await queryOne<{ id: string }>(
      'DELETE FROM action_plan_categories WHERE id = $1 RETURNING id',
      [id]
    );
    return result !== null;
  }

  // Update action plan status
  static async updateActionPlanStatus(
    id: string,
    role: 'supervisor' | 'sales_director' | 'marketing_manager',
    status: 'Pending' | 'Approved' | 'Rejected'
  ): Promise<DBActionPlan | null> {
    const statusField = `${role}_status`;
    return await queryOne<DBActionPlan>(
      `UPDATE action_plans SET ${statusField} = $2 WHERE id = $1 RETURNING *`,
      [id, status]
    );
  }

  // Get pending action plans by role
  static async getPendingActionPlans(role: 'supervisor' | 'sales_director' | 'marketing_manager'): Promise<ActionPlanWithDetails[]> {
    const statusField = `${role}_status`;
    return await query<ActionPlanWithDetails>(`
      SELECT 
        ap.*,
        apc.name as category_name,
        CONCAT(p.first_name, ' ', p.last_name) as creator_name
      FROM action_plans ap
      LEFT JOIN action_plan_categories apc ON ap.category_id = apc.id
      LEFT JOIN profiles p ON ap.created_by = p.id
      WHERE ap.${statusField} = 'Pending'
      ORDER BY ap.created_at DESC
    `);
  }

  // Get action plan categories (alias for getAllCategories for backward compatibility)
  static async getActionPlanCategories(): Promise<ActionPlanCategory[]> {
    return await this.getAllCategories();
  }
}