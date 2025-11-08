
// Profile type matching backend Profile entity
export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  role: 'Admin' | 'Sales Director' | 'Marketing Manager' | 'Supervisor' | 'Delegate';
  sector_id: string | null;
  supervisor_id: string | null;
  created_at: string;
  updated_at: string;
};

// User type for Keycloak
export type User = {
  id: string;
  email: string;
  emailVerified?: boolean;
  firstName?: string;
  lastName?: string;
};

// Session type for Keycloak
export type Session = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
};

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error?: { message: string } }>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error?: { message: string } }>;
  signOut: () => Promise<{ error?: any }>;
  loading: boolean;
  profileLoading: boolean;
  signOutLoading: boolean;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
