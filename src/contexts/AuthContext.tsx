
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error?: any }>;
  loading: boolean;
  signOutLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      console.log('Profile fetched:', data);
      return data;
    } catch (error) {
      console.error('Profile fetch failed:', error);
      return null;
    }
  };

  const clearAllSessionData = () => {
    console.log('Clearing all session data');
    
    // Clear React state immediately
    setUser(null);
    setSession(null);
    setProfile(null);
    
    // Clear all possible Supabase-related localStorage items
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('supabase.auth.token') || 
          key.startsWith('sb-') || 
          key.includes('supabase') ||
          key.includes('auth')) {
        localStorage.removeItem(key);
        console.log('Removed localStorage key:', key);
      }
    });
    
    // Also clear sessionStorage
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      if (key.startsWith('supabase') || key.includes('auth')) {
        sessionStorage.removeItem(key);
        console.log('Removed sessionStorage key:', key);
      }
    });
  };

  // Add timeout to auto-reset isSigningOut flag
  const resetSigningOutFlag = () => {
    setTimeout(() => {
      if (isSigningOut) {
        console.log('Auto-resetting isSigningOut flag after timeout');
        setIsSigningOut(false);
      }
    }, 5000); // Reset after 5 seconds if still stuck
  };

  useEffect(() => {
    console.log('AuthProvider initializing...');
    
    // Reset signOutLoading on initialization to handle stuck state
    setSignOutLoading(false);
    
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, 'Session exists:', !!session, 'User ID:', session?.user?.id);
      console.log('Is signing out flag:', isSigningOut);
      
      // Handle sign out event
      if (event === 'SIGNED_OUT') {
        console.log('SIGNED_OUT event detected');
        clearAllSessionData();
        // Reset loading states immediately
        setSignOutLoading(false);
        setIsSigningOut(false);
        
        // Navigate to auth page after sign out
        setTimeout(() => {
          console.log('Redirecting to /auth after SIGNED_OUT event');
          window.location.href = '/auth';
        }, 100);
        return;
      }
      
      // Handle sign in events - IMPROVED LOGIC
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Reset the isSigningOut flag when we get a successful sign in
        if (isSigningOut) {
          console.log('Resetting isSigningOut flag due to successful sign in');
          setIsSigningOut(false);
        }
        
        console.log('Setting session and user state after successful auth');
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle profile fetching
        if (session?.user) {
          try {
            const userProfile = await fetchProfile(session.user.id);
            setProfile(userProfile);
          } catch (error) {
            console.error('Error fetching profile after auth change:', error);
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      }
      
      // Handle initial state
      if (event === 'INITIAL_SESSION') {
        if (session && !isSigningOut) {
          console.log('Setting initial session state');
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            try {
              const userProfile = await fetchProfile(session.user.id);
              setProfile(userProfile);
            } catch (error) {
              console.error('Error fetching profile on initial session:', error);
              setProfile(null);
            }
          }
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      }
      
      setLoading(false);
    });

    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        console.log('Initial session:', session?.user?.id);
        
        // The onAuthStateChange will handle the state update
        if (!session) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setLoading(false);
      }
    };

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('Auth initialization timeout reached');
      setLoading(false);
    }, 5000);

    initializeAuth();

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [isSigningOut]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      
      // Clear the isSigningOut flag before attempting sign in
      if (isSigningOut) {
        console.log('Clearing isSigningOut flag before sign in attempt');
        setIsSigningOut(false);
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
      } else {
        console.log('Sign in API call successful');
        // Ensure the flag is clear for the auth state change to work
        setIsSigningOut(false);
      }

      return { error };
    } catch (error) {
      console.error('Sign in exception:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      console.log('Attempting sign up for:', email);
      
      // Clear the isSigningOut flag before attempting sign up
      if (isSigningOut) {
        console.log('Clearing isSigningOut flag before sign up attempt');
        setIsSigningOut(false);
      }
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error('Sign up error:', error);
      } else {
        console.log('Sign up API call successful');
        // Ensure the flag is clear for the auth state change to work
        setIsSigningOut(false);
      }

      return { error };
    } catch (error) {
      console.error('Sign up exception:', error);
      return { error };
    }
  };

  const signOut = async () => {
    if (signOutLoading) {
      console.log('Sign out already in progress');
      return { error: null };
    }

    try {
      setSignOutLoading(true);
      setIsSigningOut(true);
      
      console.log('Starting sign out process...');
      console.log('Current session exists:', !!session);
      console.log('Current user exists:', !!user);
      
      // Set up the auto-reset timeout
      resetSigningOutFlag();
      
      // Clear session data BEFORE calling the API
      console.log('Clearing session data before API call');
      clearAllSessionData();
      
      // Reset loading states immediately after clearing data
      console.log('Resetting loading states immediately');
      setSignOutLoading(false);
      setIsSigningOut(false);
      
      console.log('Calling supabase.auth.signOut()...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase signOut API returned error:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
        });
      } else {
        console.log('Supabase signOut API call successful');
      }
      
      // Force redirect regardless of API response
      setTimeout(() => {
        console.log('Forcing redirect to /auth');
        window.location.href = '/auth';
      }, 100);
      
      return { error: null };
    } catch (error) {
      console.error('Sign out exception:', error);
      clearAllSessionData();
      setSignOutLoading(false);
      setIsSigningOut(false);
      
      setTimeout(() => {
        window.location.href = '/auth';
      }, 100);
      
      return { error };
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    signIn,
    signUp,
    signOut,
    loading,
    signOutLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
