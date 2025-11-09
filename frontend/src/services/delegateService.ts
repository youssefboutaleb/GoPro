import db from '@/lib/db';

export interface VisitPlan {
  id: string;
  delegate_id: string;
  // Add other fields as needed
}

export interface SalesPlan {
  id: string;
  delegate_id: string;
  // Add other fields as needed
}

export interface ActionPlan {
  id: string;
  supervisor_status: string;
  sales_director_status: string;
  marketing_manager_status: string;
  created_by: string;
  targeted_delegates: string[];
}

export const delegateService = {
  async getVisitPlansCount(delegateId: string): Promise<number> {
    try {
      const result = await db.one(
        'SELECT COUNT(*) FROM visit_plans WHERE delegate_id = $1',
        [delegateId]
      );
      return parseInt(result.count);
    } catch (error) {
      console.error('Error fetching visit plans count:', error);
      return 0;
    }
  },

  async getSalesPlansCount(delegateId: string): Promise<number> {
    try {
      const result = await db.one(
        'SELECT COUNT(*) FROM sales_plans WHERE delegate_id = $1',
        [delegateId]
      );
      return parseInt(result.count);
    } catch (error) {
      console.error('Error fetching sales plans count:', error);
      return 0;
    }
  },

  async getActionPlans(creatorIds: string[]): Promise<ActionPlan[]> {
    try {
      const plans = await db.any(
        `SELECT id, supervisor_status, sales_director_status, 
         marketing_manager_status, created_by, targeted_delegates 
         FROM action_plans 
         WHERE created_by = ANY($1)`,
        [creatorIds]
      );
      return plans;
    } catch (error) {
      console.error('Error fetching action plans:', error);
      return [];
    }
  },

  async getDashboardStats(delegateId: string, creatorIds: string[]) {
    try {
      const [visitPlansCount, salesPlansCount, actionPlans] = await Promise.all([
        this.getVisitPlansCount(delegateId),
        this.getSalesPlansCount(delegateId),
        this.getActionPlans(creatorIds)
      ]);

      return {
        visitPlansCount,
        salesPlansCount,
        actionPlans
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return null;
    }
  }
};