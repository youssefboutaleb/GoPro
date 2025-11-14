import { Doctor, Brick, query, queryOne, generateUUID } from '@/lib/db';

interface SpecialtyResult {
  specialty: string;
}

export interface DoctorWithDelegateInfo extends Doctor {
  delegate_id?: string;
  delegate_first_name?: string;
  delegate_last_name?: string;
  visit_date?: Date;
  visit_status?: string;
}

export class DoctorService {
  // Get all doctors (maintaining backward compatibility)
  static async getDoctors(): Promise<Doctor[]> {
    return await this.getAllDoctors();
  }

  // Get all doctors
  static async getAllDoctors(): Promise<Doctor[]> {
    return await query<Doctor>('SELECT * FROM doctors ORDER BY first_name, last_name');
  }

  // Get doctor by ID
  static async getDoctorById(id: string): Promise<Doctor | null> {
    return await queryOne<Doctor>('SELECT * FROM doctors WHERE id = $1', [id]);
  }

  // Get doctors by brick (maintaining backward compatibility)
  static async getDoctorsByBrick(brickId: string): Promise<Doctor[]> {
    return await query<Doctor>(
      'SELECT * FROM doctors WHERE brick_id = $1 ORDER BY first_name, last_name',
      [brickId]
    );
  }

  // Get doctors by specialty (maintaining backward compatibility)
  static async getDoctorsBySpecialty(specialty: string): Promise<Doctor[]> {
    return await query<Doctor>(
      'SELECT * FROM doctors WHERE specialty = $1 ORDER BY first_name, last_name',
      [specialty]
    );
  }

  // Create new doctor
  static async createDoctor(doctor: Omit<Doctor, 'id' | 'created_at'>): Promise<Doctor> {
    const id = generateUUID();
    const result = await queryOne<Doctor>(
      `INSERT INTO doctors (id, first_name, last_name, specialty, brick_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, doctor.first_name, doctor.last_name, doctor.specialty, doctor.brick_id]
    );
    if (!result) throw new Error('Failed to create doctor');
    return result;
  }

  // Update doctor
  static async updateDoctor(id: string, doctor: Partial<Omit<Doctor, 'id' | 'created_at'>>): Promise<Doctor | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;

    Object.entries(doctor).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = $${paramCounter}`);
        values.push(value);
        paramCounter++;
      }
    });

    if (updates.length === 0) return await this.getDoctorById(id);

    values.push(id);
    const query = `
      UPDATE doctors
      SET ${updates.join(', ')}
      WHERE id = $${paramCounter}
      RETURNING *
    `;

    return await queryOne<Doctor>(query, values);
  }

  // Delete doctor
  static async deleteDoctor(id: string): Promise<boolean> {
    const result = await queryOne<{ id: string }>(
      'DELETE FROM doctors WHERE id = $1 RETURNING id',
      [id]
    );
    return result !== null;
  }

  // Get all bricks (maintaining backward compatibility)
  static async getBricks(): Promise<Brick[]> {
    return await query<Brick>('SELECT * FROM bricks ORDER BY name');
  }

  // Search doctors
  static async searchDoctors(searchTerm: string): Promise<Doctor[]> {
    const term = `%${searchTerm}%`;
    return await query<Doctor>(
      `SELECT * FROM doctors 
       WHERE first_name ILIKE $1 
       OR last_name ILIKE $1 
       OR specialty ILIKE $1
       ORDER BY first_name, last_name`,
      [term]
    );
  }

  // Get doctors by region
  static async getDoctorsByRegion(regionId: string): Promise<Doctor[]> {
    return await query<Doctor>(`
      SELECT d.* 
      FROM doctors d
      JOIN bricks b ON d.brick_id = b.id
      WHERE b.region_id = $1
      ORDER BY d.first_name, d.last_name
    `, [regionId]);
  }

  // Get doctor visit history
  static async getDoctorVisitHistory(doctorId: string): Promise<DoctorWithDelegateInfo[]> {
    return await query<DoctorWithDelegateInfo>(`
      SELECT v.*, vp.delegate_id, p.first_name as delegate_first_name, p.last_name as delegate_last_name
      FROM visits v
      JOIN visit_plans vp ON v.visit_plan_id = vp.id
      JOIN profiles p ON vp.delegate_id = p.id
      WHERE vp.doctor_id = $1
      ORDER BY v.visit_date DESC
    `, [doctorId]);
  }

  // Get distinct specialties
  static async getSpecialties(): Promise<string[]> {
    const specialties = await query<SpecialtyResult>(
      'SELECT DISTINCT specialty FROM doctors WHERE specialty IS NOT NULL ORDER BY specialty'
    );
    return specialties.map(row => row.specialty);
  }
}
    