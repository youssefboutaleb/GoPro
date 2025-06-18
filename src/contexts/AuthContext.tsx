
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
  signOut: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
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

      console.log('Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  const clearAuthState = () => {
    console.log('Clearing auth state...');
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing authentication...');
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        console.log('Initial session:', session);
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }
        
        if (session?.user && mounted) {
          console.log('Fetching profile for logged in user...');
          try {
            const userProfile = await fetchProfile(session.user.id);
            if (mounted) {
              setProfile(userProfile);
            }
          } catch (error) {
            console.error('Failed to fetch profile during initialization:', error);
          }
        }
        
        if (mounted) {
          console.log('Setting loading to false');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Initialize auth
    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      
      if (!mounted) return;
      
      // Handle sign out explicitly
      if (event === 'SIGNED_OUT') {
        console.log('User signed out, clearing state...');
        clearAuthState();
        setLoading(false);
        return;
      }
      
      // Handle token refresh without fetching profile again
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed, updating session...');
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        return;
      }
      
      // Handle sign in
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in, updating state...');
        setSession(session);
        setUser(session.user);
        
        try {
          const userProfile = await fetchProfile(session.user.id);
          if (mounted) {
            setProfile(userProfile);
          }
        } catch (error) {
          console.error('Failed to fetch profile after sign in:', error);
        }
        
        if (mounted) {
          setLoading(false);
        }
        return;
      }
      
      // If no session exists, clear everything
      if (!session) {
        console.log('No session, clearing state...');
        clearAuthState();
        setLoading(false);
        return;
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
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

    return { error };
  };

  const signOut = async () => {
    try {
      console.log('Starting sign out process...');
      setLoading(true);
      
      // Create a timeout promise to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Sign out timeout')), 5000);
      });
      
      // Race between signOut and timeout
      const signOutPromise = supabase.auth.signOut({
        scope: 'global'
      });
      
      try {
        const { error } = await Promise.race([signOutPromise, timeoutPromise]);
        if (error) {
          console.error('Error signing out from Supabase:', error);
        } else {
          console.log('Successfully signed out from Supabase');
        }
      } catch (timeoutError) {
        console.warn('Sign out timed out, proceeding with local cleanup:', timeoutError);
      }
      
    } catch (error) {
      console.error('Error in signOut:', error);
    } finally {
      // Always clear local state regardless of server response
      console.log('Clearing local auth state...');
      clearAuthState();
      setLoading(false);
      
      // Force redirect to auth page
      console.log('Redirecting to auth page...');
      window.location.href = '/auth';
    }
  };

  const isAdmin = profile?.role === 'Admin';

  const value: AuthContextType = {
    user,
    profile,
    session,
    signIn,
    signUp,
    signOut,
    loading,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
