
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Profile fetch failed:', error);
      return null;
    }
  };

  const clearAuthState = () => {
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) setLoading(false);
          return;
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }
        
        if (session?.user && mounted) {
          try {
            const userProfile = await fetchProfile(session.user.id);
            if (mounted) {
              setProfile(userProfile);
            }
          } catch (error) {
            console.error('Error fetching profile during init:', error);
          }
        }
        
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
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
      console.log('Auth state change:', event, session?.user?.id);
      
      if (!mounted) return;
      
      try {
        // Handle sign out explicitly
        if (event === 'SIGNED_OUT') {
          clearAuthState();
          setLoading(false);
          return;
        }
        
        // Handle token refresh without fetching profile again
        if (event === 'TOKEN_REFRESHED') {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          return;
        }
        
        // Handle sign in
        if (event === 'SIGNED_IN' && session) {
          setSession(session);
          setUser(session.user);
          
          try {
            const userProfile = await fetchProfile(session.user.id);
            if (mounted) {
              setProfile(userProfile);
            }
          } catch (error) {
            console.error('Error fetching profile on sign in:', error);
          }
          
          if (mounted) {
            setLoading(false);
          }
          return;
        }
        
        // Handle any other session state
        setSession(session);
        setUser(session?.user ?? null);
        
        // If no session exists, clear everything
        if (!session) {
          clearAuthState();
        }
        
        // Always set loading to false at the end
        setLoading(false);
        
      } catch (error) {
        console.error('Error in auth state change handler:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
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
    } catch (error) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clear local state immediately
      clearAuthState();
      
      // Try to sign out from Supabase in the background
      await supabase.auth.signOut({
        scope: 'global'
      });
      
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
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
