
import { useState, useEffect } from 'react';
import { User, Session, Profile } from '@/types/auth';
import { fetchProfile, clearAllSessionData } from '@/utils/authUtils';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);

  const fetchUserProfile = async (token: string, retryCount = 0) => {
    if (profileLoading) {
      console.log('⏳ Profile fetch already in progress, skipping...');
      return;
    }

    setProfileLoading(true);
    try {
      const timeoutPromise = new Promise<Profile | null>((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 2000);
      });
      
      const userProfile = await Promise.race([
        fetchProfile(token),
        timeoutPromise
      ]);
      
      console.log('📦 Profile fetch result:', userProfile ? 'Success' : 'Failed/No profile found');
      setProfile(userProfile);
      
      if (userProfile) {
        console.log('🎉 Profile loaded! Welcome:', userProfile.first_name, userProfile.last_name);
      }
    } catch (error) {
      console.error('💥 Error during profile fetch:', error);
      
      // Retry logic with exponential backoff
      if (retryCount < 2) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`🔄 Retrying profile fetch in ${delay}ms (attempt ${retryCount + 1})`);
        setTimeout(() => {
          fetchUserProfile(token, retryCount + 1);
        }, delay);
      } else {
        console.error('❌ Max retries reached for profile fetch');
        setProfile(null);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 AuthProvider initializing...');
    setSignOutLoading(false);
    
    const initializeAuth = async () => {
      try {
        console.log('🔍 Checking for existing session...');
        
        // Check for stored token
        const token = localStorage.getItem('keycloak_token');
        const storedProfile = localStorage.getItem('user_profile');
        
        if (token) {
          console.log('📊 Found stored token');
          
          // Create session from stored token
          const sessionData: Session = {
            accessToken: token,
            refreshToken: localStorage.getItem('keycloak_refresh_token') || undefined,
          };
          setSession(sessionData);
          
          // Try to get user info from token (basic implementation)
          // In a real scenario, you'd decode the JWT token
          const userData: User = {
            id: 'user-id', // Would be extracted from token
            email: 'user@example.com', // Would be extracted from token
          };
          setUser(userData);
          
          // Load profile from localStorage or fetch from API
          if (storedProfile) {
            try {
              const profileData = JSON.parse(storedProfile);
              setProfile(profileData);
              console.log('✅ Profile loaded from localStorage');
            } catch (e) {
              console.error('❌ Error parsing stored profile:', e);
            }
          }
          
          // Fetch fresh profile from API
          if (token) {
            console.log('👤 Fetching fresh profile from API...');
            fetchUserProfile(token);
          }
        } else {
          console.log('📊 No stored session found');
          setUser(null);
          setSession(null);
          setProfile(null);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('💥 Failed to initialize auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();
    
    // Listen for storage changes (for multi-tab support)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'keycloak_token') {
        if (e.newValue) {
          console.log('🔄 Token updated in another tab, refreshing...');
          window.location.reload();
        } else {
          console.log('🔄 Token removed in another tab, signing out...');
          clearAllSessionData();
          setUser(null);
          setSession(null);
          setProfile(null);
          window.location.href = '/auth';
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const signOut = async () => {
    if (signOutLoading) {
      console.log('⏳ Sign out already in progress');
      return { error: null };
    }

    try {
      setSignOutLoading(true);
      console.log('🚪 Starting sign out process...');
      
      // Call backend logout if token exists
      const token = localStorage.getItem('keycloak_token');
      if (token) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          console.error('❌ Logout API error (continuing anyway):', error);
        }
      }
      
      clearAllSessionData();
      setUser(null);
      setSession(null);
      setProfile(null);
      setProfileLoading(false);
      setSignOutLoading(false);
      
      setTimeout(() => {
        window.location.href = '/auth';
      }, 100);
      
      return { error: null };
    } catch (error) {
      console.error('💥 Sign out exception:', error);
      clearAllSessionData();
      setUser(null);
      setSession(null);
      setProfile(null);
      setProfileLoading(false);
      setSignOutLoading(false);
      
      setTimeout(() => {
        window.location.href = '/auth';
      }, 100);
      
      return { error };
    }
  };

  return {
    user,
    profile,
    session,
    loading,
    profileLoading,
    signOutLoading,
    signOut
  };
};
