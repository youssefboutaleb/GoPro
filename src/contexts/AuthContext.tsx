
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

  const clearSessionAndRedirect = () => {
    console.log('Clearing session and redirecting manually');
    setUser(null);
    setSession(null);
    setProfile(null);
    setSignOutLoading(false);
    
    // Clear any local storage items related to Supabase
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('supabase.auth.token') || key.startsWith('sb-')) {
        localStorage.removeItem(key);
        console.log('Removed local storage key:', key);
      }
    });
    
    // Force redirect
    setTimeout(() => {
      window.location.href = '/auth';
    }, 100);
  };

  useEffect(() => {
    console.log('AuthProvider initializing...');
    
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, 'Session exists:', !!session, 'User ID:', session?.user?.id);
      
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
        
        // Handle successful sign out
        if (event === 'SIGNED_OUT') {
          console.log('SIGNED_OUT event detected - user signed out successfully');
          setSignOutLoading(false);
          
          // Navigate to auth page after sign out
          setTimeout(() => {
            console.log('Redirecting to /auth after SIGNED_OUT event');
            window.location.href = '/auth';
          }, 100);
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
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
      } else {
        console.log('Sign in successful');
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
        console.log('Sign up successful');
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
      console.log('Starting sign out process...');
      console.log('Current session exists:', !!session);
      console.log('Current user exists:', !!user);
      
      // Check Supabase client status
      console.log('Supabase client config:', {
        url: supabase.supabaseUrl,
        key: supabase.supabaseKey.substring(0, 20) + '...',
      });
      
      console.log('Calling supabase.auth.signOut()...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase signOut API returned error:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          statusCode: error.statusCode,
        });
        
        // If API call failed, force manual sign out
        console.log('API sign out failed, attempting manual session clearing');
        clearSessionAndRedirect();
        return { error };
      }
      
      console.log('Supabase signOut API call successful');
      console.log('Waiting for onAuthStateChange to fire SIGNED_OUT event...');
      
      // Set up a fallback mechanism in case onAuthStateChange doesn't fire
      const fallbackTimeout = setTimeout(() => {
        console.log('Fallback: onAuthStateChange SIGNED_OUT event did not fire within 5 seconds');
        console.log('Current auth state:', { user: !!user, session: !!session, signOutLoading });
        
        // Check if we're still authenticated - if so, force manual sign out
        if (user || session) {
          console.log('User still authenticated after 5 seconds, forcing manual sign out');
          clearSessionAndRedirect();
        } else {
          console.log('User appears to be signed out, just redirecting');
          setSignOutLoading(false);
          window.location.href = '/auth';
        }
      }, 5000);
      
      // Clear the fallback if successful sign out happens
      const clearFallback = () => {
        console.log('Clearing fallback timeout');
        clearTimeout(fallbackTimeout);
      };
      
      // Store the clear function for potential cleanup
      (window as any).__clearSignOutFallback = clearFallback;
      
      return { error: null };
    } catch (error) {
      console.error('Sign out exception:', error);
      console.log('Exception during sign out, attempting manual session clearing');
      clearSessionAndRedirect();
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
