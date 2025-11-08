import { apiService } from '@/services/apiService';
import { Profile } from '@/types/auth';

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  profile?: Profile;
  error?: {
    message: string;
  };
}

export const fetchProfile = async (token: string): Promise<Profile | null> => {
  try {
    console.log('🔍 Fetching profile for user');
    
    const profile = await apiService.getCurrentUser(token);

    if (!profile) {
      console.log('⚠️ No profile found for user');
      return null;
    }

    console.log('✅ Profile successfully fetched:', {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      role: profile.role
    });
    
    // Map backend profile to frontend Profile type
    return {
      id: profile.id,
      first_name: profile.firstName,
      last_name: profile.lastName,
      role: profile.role,
      sector_id: profile.sectorId,
      supervisor_id: profile.supervisorId,
      created_at: profile.createdAt,
      updated_at: profile.updatedAt,
    } as Profile;
  } catch (error) {
    console.error('💥 Profile fetch exception:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      console.error('🔒 Unauthorized - clearing session');
      clearAllSessionData();
      window.location.href = '/auth';
    }
    
    return null;
  }
};

export const clearAllSessionData = () => {
  console.log('🧹 Clearing all session data');
  
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('keycloak') || 
        key.startsWith('auth') ||
        key.includes('token')) {
      localStorage.removeItem(key);
    }
  });
};

export const signIn = async (email: string, password: string): Promise<{ error?: { message: string } }> => {
  try {
    console.log('🔐 Attempting sign in for:', email);
    
    const response = await apiService.login(email, password) as AuthResponse;

    if (response.error) {
      console.error('❌ Sign in error:', response.error);
      return { error: response.error };
    }

    // Store tokens
    if (response.accessToken) {
      localStorage.setItem('keycloak_token', response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem('keycloak_refresh_token', response.refreshToken);
      }
      if (response.profile) {
        localStorage.setItem('user_profile', JSON.stringify(response.profile));
      }
    }

    console.log('✅ Sign in successful');
    return {};
  } catch (error) {
    console.error('💥 Sign in exception:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: { message: errorMessage } };
  }
};

export const signUp = async (email: string, password: string, firstName?: string, lastName?: string): Promise<{ error?: { message: string } }> => {
  try {
    console.log('📝 Attempting sign up for:', email);
    
    // Note: Sign up might need to be handled through Keycloak directly
    // For now, we'll return an error indicating it needs to be done through Keycloak admin
    console.warn('⚠️ Sign up should be done through Keycloak admin console');
    return { error: { message: 'User registration should be done through Keycloak admin console' } };
  } catch (error) {
    console.error('💥 Sign up exception:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: { message: errorMessage } };
  }
};
