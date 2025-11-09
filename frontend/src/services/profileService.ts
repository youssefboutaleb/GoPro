import { Profile, query, queryOne, generateUUID } from '@/lib/db';

export class ProfileService {
  // Get all profiles
  static async getAllProfiles(): Promise<Profile[]> {
    return await query<Profile>('SELECT * FROM profiles ORDER BY created_at DESC');
  }

  // Get profile by ID
  static async getProfileById(id: string): Promise<Profile | null> {
    return await queryOne<Profile>('SELECT * FROM profiles WHERE id = $1', [id]);
  }

  // Get supervisor info (maintaining backward compatibility)
  static async getSupervisorInfo(supervisorId: string): Promise<Profile | null> {
    return await this.getProfileById(supervisorId);
  }

  // Get profiles by supervisor ID
  static async getProfilesBySupervisor(supervisorId: string): Promise<Profile[]> {
    return await query<Profile>('SELECT * FROM profiles WHERE supervisor_id = $1', [supervisorId]);
  }

  // Create new profile
  static async createProfile(profile: Omit<Profile, 'id' | 'created_at'>): Promise<Profile> {
    const id = generateUUID();
    const result = await queryOne<Profile>(
      `INSERT INTO profiles (id, first_name, last_name, email, role, supervisor_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, profile.first_name, profile.last_name, profile.email, profile.role, profile.supervisor_id]
    );
    if (!result) throw new Error('Failed to create profile');
    return result;
  }

  // Update profile
  static async updateProfile(id: string, profile: Partial<Omit<Profile, 'id' | 'created_at'>>): Promise<Profile | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;

    Object.entries(profile).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = $${paramCounter}`);
        values.push(value);
        paramCounter++;
      }
    });

    if (updates.length === 0) return await this.getProfileById(id);

    values.push(id);
    const query = `
      UPDATE profiles
      SET ${updates.join(', ')}
      WHERE id = $${paramCounter}
      RETURNING *
    `;

    return await queryOne<Profile>(query, values);
  }

  // Delete profile
  static async deleteProfile(id: string): Promise<boolean> {
    const result = await queryOne<{ id: string }>(
      'DELETE FROM profiles WHERE id = $1 RETURNING id',
      [id]
    );
    return result !== null;
  }

  // Get profile by email
  static async getProfileByEmail(email: string): Promise<Profile | null> {
    return await queryOne<Profile>('SELECT * FROM profiles WHERE email = $1', [email]);
  }

  // Get delegates by region
  static async getDelegatesByRegion(regionId: string): Promise<Profile[]> {
    return await query<Profile>(`
      SELECT DISTINCT p.*
      FROM profiles p
      JOIN doctors d ON d.delegate_id = p.id
      JOIN bricks b ON d.brick_id = b.id
      WHERE b.region_id = $1 AND p.role = 'delegate'
    `, [regionId]);
  }

  // Get all delegates
  static async getAllDelegates(): Promise<Profile[]> {
    return await query<Profile>(`
      SELECT * FROM profiles 
      WHERE role = 'delegate'
      ORDER BY first_name, last_name
    `);
  }

  // Get all supervisors
  static async getAllSupervisors(): Promise<Profile[]> {
    return await query<Profile>(`
      SELECT * FROM profiles 
      WHERE role = 'supervisor'
      ORDER BY first_name, last_name
    `);
  }
}