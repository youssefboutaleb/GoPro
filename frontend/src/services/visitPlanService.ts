import db from '@/lib/db';

export interface Visit {
  id: string;
  visit_date: string;
  status: string;
  duration: number;
  delegate_id: string;
  visit_plan_id: string;
  objective: string;
  comment: string;
  last_modified: string;
}

export interface VisitPlan {
  id: string;
  delegate_id: string;
  supervisor_id: string;
  status: string;
  created_at: string;
}

export const visitPlanService = {
  async getVisitPlans(delegateId: string): Promise<VisitPlan[]> {
    try {
      const plans = await db.any(
        `SELECT * FROM visit_plans WHERE delegate_id = $1`,
        [delegateId]
      );
      return plans;
    } catch (error) {
      console.error('Error fetching visit plans:', error);
      return [];
    }
  },

  async getVisits(planId: string): Promise<Visit[]> {
    try {
      const visits = await db.any(
        `SELECT * FROM visits WHERE visit_plan_id = $1`,
        [planId]
      );
      return visits;
    } catch (error) {
      console.error('Error fetching visits:', error);
      return [];
    }
  },

  async createVisit(visit: Omit<Visit, 'id' | 'last_modified'>): Promise<Visit | null> {
    try {
      const result = await db.one(
        `INSERT INTO visits (
          visit_date, status, duration, delegate_id, visit_plan_id, 
          objective, comment, last_modified
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP
        ) RETURNING *`,
        [
          visit.visit_date,
          visit.status,
          visit.duration,
          visit.delegate_id,
          visit.visit_plan_id,
          visit.objective,
          visit.comment
        ]
      );
      return result;
    } catch (error) {
      console.error('Error creating visit:', error);
      return null;
    }
  },

  async updateVisit(visitId: string, visit: Partial<Visit>): Promise<Visit | null> {
    try {
      const updateFields = Object.entries(visit)
        .filter(([key]) => key !== 'id' && key !== 'last_modified')
        .map(([key, _], index) => `${key} = $${index + 2}`)
        .join(', ');

      const values = Object.entries(visit)
        .filter(([key]) => key !== 'id' && key !== 'last_modified')
        .map(([_, value]) => value);

      const result = await db.one(
        `UPDATE visits 
         SET ${updateFields}, last_modified = CURRENT_TIMESTAMP 
         WHERE id = $1 
         RETURNING *`,
        [visitId, ...values]
      );
      return result;
    } catch (error) {
      console.error('Error updating visit:', error);
      return null;
    }
  },

  async deleteVisit(visitId: string): Promise<boolean> {
    try {
      await db.none(
        'DELETE FROM visits WHERE id = $1',
        [visitId]
      );
      return true;
    } catch (error) {
      console.error('Error deleting visit:', error);
      return false;
    }
  }
};