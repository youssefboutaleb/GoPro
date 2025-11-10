// Backend DTO types matching the Quarkus backend

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  sectorId?: string;
  supervisorId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty?: string;
  brickId?: string;
}

export interface Product {
  id: string;
  name: string;
  therapeuticClass?: 'Cardiology' | 'Fever' | 'Pain Killer' | null;
}

export interface Sector {
  id: string;
  name: string;
}

export interface Brick {
  id: string;
  name: string;
  sectorId?: string;
}

export interface Visit {
  id: string;
  visitDate: string;
  delegateId: string;
  doctorId: string;
  productId: string;
  brickId?: string;
  status: string;
  notes?: string;
  feedback?: string;
  returnIndex?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActionPlan {
  id: string;
  location: string;
  date: string;
  description?: string;
  type: string;
  createdBy: string;
  supervisorStatus: string;
  salesDirectorStatus: string;
  marketingManagerStatus: string;
  isExecuted: boolean;
  targetedDoctors?: string[];
  targetedBricks?: string[];
  targetedDelegates?: string[];
  targetedSupervisors?: string[];
  targetedSalesDirectors?: string[];
  targetedProducts?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesPlan {
  id: string;
  delegateId: string;
  productId: string;
  brickId: string;
}

export interface Sales {
  id: string;
  year: number;
  targets?: number[];
  achievements?: number[];
  salesPlanId: string;
}

// Legacy types for compatibility (snake_case from Supabase)
export interface LegacyProfile {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  sector_id?: string;
  supervisor_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Helper function to convert backend Profile to legacy format
export function profileToLegacy(profile: Profile): LegacyProfile {
  return {
    id: profile.id,
    first_name: profile.firstName,
    last_name: profile.lastName,
    role: profile.role,
    sector_id: profile.sectorId,
    supervisor_id: profile.supervisorId,
    created_at: profile.createdAt,
    updated_at: profile.updatedAt,
  };
}

