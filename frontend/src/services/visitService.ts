import { Visit as DBVisit, VisitPlan, query, queryOne, generateUUID } from '@/lib/db';

// Backward compatibility interface
export interface Visit {
  id: string;
  visit_plan_id: string;
  visit_date: string;
}

export interface VisitWithDetails extends DBVisit {
  doctor_name?: string;
  delegate_name?: string;
  brick_name?: string;
  region_name?: string;
}

export class VisitService {
  // Backward compatibility method
  static async getMonthlyVisits(startDate: string, endDate: string): Promise<Visit[]> {
    return await query<Visit>(`
      SELECT id, visit_plan_id, visit_date 
      FROM visits 
      WHERE visit_date >= $1 AND visit_date <= $2
    `, [startDate, endDate]);
  }

  // Backward compatibility method
  static async getVisitStats(delegateId: string, startDate: string, endDate: string) {
    const [visits, visitPlans] = await Promise.all([
      this.getMonthlyVisits(startDate, endDate),
      query<{ id: string }>('SELECT id FROM visit_plans WHERE delegate_id = $1', [delegateId])
    ]);

    // Calculate return index
    const returnIndex = visitPlans.length > 0
      ? Math.round((visits.length / (visitPlans.length * 2)) * 100)
      : 0;

    return {
      visitPlansCount: visitPlans.length,
      thisMonthVisits: visits.length,
      returnIndex
    };
  }

  // Get all visits
  static async getAllVisits(): Promise<DBVisit[]> {
    return await query<DBVisit>('SELECT * FROM visits ORDER BY visit_date DESC');
  }

  // Get visit by ID
  static async getVisitById(id: string): Promise<DBVisit | null> {
    return await queryOne<DBVisit>('SELECT * FROM visits WHERE id = $1', [id]);
  }

  // Get visits by delegate
  static async getVisitsByDelegate(delegateId: string): Promise<VisitWithDetails[]> {
    return await query<VisitWithDetails>(`
      SELECT 
        v.*,
        CONCAT(d.first_name, ' ', d.last_name) as doctor_name,
        b.name as brick_name,
        r.name as region_name
      FROM visits v
      JOIN visit_plans vp ON v.visit_plan_id = vp.id
      JOIN doctors d ON vp.doctor_id = d.id
      JOIN bricks b ON d.brick_id = b.id
      JOIN regions r ON b.region_id = r.id
      WHERE vp.delegate_id = $1
      ORDER BY v.visit_date DESC
    `, [delegateId]);
  }

  // Create new visit
  static async createVisit(visit: Omit<DBVisit, 'id' | 'created_at'>): Promise<DBVisit> {
    const id = generateUUID();
    const result = await queryOne<DBVisit>(
      `INSERT INTO visits (id, visit_plan_id, visit_date, status, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, visit.visit_plan_id, visit.visit_date, visit.status || 'Completed', visit.notes]
    );
    if (!result) throw new Error('Failed to create visit');
    return result;
  }

  // Update visit
  static async updateVisit(id: string, visit: Partial<Omit<DBVisit, 'id' | 'created_at'>>): Promise<DBVisit | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;

    Object.entries(visit).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = $${paramCounter}`);
        values.push(value);
        paramCounter++;
      }
    });

    if (updates.length === 0) return await this.getVisitById(id);

    values.push(id);
    const query = `
      UPDATE visits
      SET ${updates.join(', ')}
      WHERE id = $${paramCounter}
      RETURNING *
    `;

    return await queryOne<DBVisit>(query, values);
  }

  // Delete visit
  static async deleteVisit(id: string): Promise<boolean> {
    const result = await queryOne<{ id: string }>(
      'DELETE FROM visits WHERE id = $1 RETURNING id',
      [id]
    );
    return result !== null;
  }

  // Get visits by date range
  static async getVisitsByDateRange(startDate: Date, endDate: Date, delegateId?: string): Promise<VisitWithDetails[]> {
    const baseQuery = `
      SELECT 
        v.*,
        CONCAT(d.first_name, ' ', d.last_name) as doctor_name,
        b.name as brick_name,
        r.name as region_name
      FROM visits v
      JOIN visit_plans vp ON v.visit_plan_id = vp.id
      JOIN doctors d ON vp.doctor_id = d.id
      JOIN bricks b ON d.brick_id = b.id
      JOIN regions r ON b.region_id = r.id
      WHERE v.visit_date BETWEEN $1 AND $2
    `;

    const sqlQuery = delegateId 
      ? `${baseQuery} AND vp.delegate_id = $3 ORDER BY v.visit_date DESC`
      : `${baseQuery} ORDER BY v.visit_date DESC`;

    const params = delegateId ? [startDate, endDate, delegateId] : [startDate, endDate];
    return await query<VisitWithDetails>(sqlQuery, params);
  }

  // Get visit plans
  static async getVisitPlans(): Promise<VisitPlan[]> {
    return await query<VisitPlan>('SELECT * FROM visit_plans ORDER BY created_at DESC');
  }

  // Create visit plan
  static async createVisitPlan(plan: Omit<VisitPlan, 'id' | 'created_at'>): Promise<VisitPlan> {
    const id = generateUUID();
    const result = await queryOne<VisitPlan>(
      `INSERT INTO visit_plans (id, delegate_id, doctor_id, visit_frequency, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, plan.delegate_id, plan.doctor_id, plan.visit_frequency || 1, plan.status || 'Active']
    );
    if (!result) throw new Error('Failed to create visit plan');
    return result;
  }

  // Update visit plan
  static async updateVisitPlan(id: string, plan: Partial<Omit<VisitPlan, 'id' | 'created_at'>>): Promise<VisitPlan | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;

    Object.entries(plan).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = $${paramCounter}`);
        values.push(value);
        paramCounter++;
      }
    });

    if (updates.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE visit_plans
      SET ${updates.join(', ')}
      WHERE id = $${paramCounter}
      RETURNING *
    `;

    return await queryOne<VisitPlan>(query, values);
  }

  // Delete visit plan
  static async deleteVisitPlan(id: string): Promise<boolean> {
    const result = await queryOne<{ id: string }>(
      'DELETE FROM visit_plans WHERE id = $1 RETURNING id',
      [id]
    );
    return result !== null;
  }

  // Get visit plans by delegate
  static async getVisitPlansByDelegate(delegateId: string): Promise<VisitPlan[]> {
    return await query<VisitPlan>(
      'SELECT * FROM visit_plans WHERE delegate_id = $1 ORDER BY created_at DESC',
      [delegateId]
    );
  }

  // Get visit plans by doctor
  static async getVisitPlansByDoctor(doctorId: string): Promise<VisitPlan[]> {
    return await query<VisitPlan>(
      'SELECT * FROM visit_plans WHERE doctor_id = $1 ORDER BY created_at DESC',
      [doctorId]
    );
  }
}