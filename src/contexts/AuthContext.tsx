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

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('🔍 Starting profile fetch for user:', userId);
      
      // First, let's check what session we have
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('📋 Current session status:', !!sessionData.session, 'User:', sessionData.session?.user?.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Profile fetch error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return null;
      }

      if (!data) {
        console.log('⚠️ No profile found for user:', userId, 'This might be normal for new users');
        return null;
      }

      console.log('✅ Profile successfully fetched:', {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role
      });
      
      return data;
    } catch (error) {
      console.error('💥 Profile fetch exception:', error);
      return null;
    }
  };

  const clearAllSessionData = () => {
    console.log('🧹 Clearing all session data');
    setUser(null);
    setSession(null);
    setProfile(null);
    
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('supabase.auth.token') || 
          key.startsWith('sb-') || 
          key.includes('supabase') ||
          key.includes('auth')) {
        localStorage.removeItem(key);
      }
    });
  };

  useEffect(() => {
    console.log('🚀 AuthProvider initializing...');
    setSignOutLoading(false);
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, 'Session exists:', !!session, 'User ID:', session?.user?.id);
      
      if (event === 'SIGNED_OUT') {
        console.log('👋 SIGNED_OUT event detected');
        clearAllSessionData();
        setSignOutLoading(false);
        setTimeout(() => {
          window.location.href = '/auth';
        }, 100);
        return;
      }
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('✅ Setting session and user state after successful auth');
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 Fetching profile for authenticated user...');
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
          
          if (userProfile) {
            console.log('🎉 Profile set successfully! Welcome:', userProfile.first_name, userProfile.last_name);
          } else {
            console.log('⚠️ Profile could not be loaded, but user is authenticated');
          }
        } else {
          setProfile(null);
        }
      }
      
      if (event === 'INITIAL_SESSION') {
        if (session) {
          console.log('🔧 Setting initial session state');
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            console.log('👤 Fetching initial profile...');
            const userProfile = await fetchProfile(session.user.id);
            setProfile(userProfile);
            
            if (userProfile) {
              console.log('🎉 Initial profile loaded! Welcome:', userProfile.first_name, userProfile.last_name);
            }
          }
        } else {
          console.log('❌ No initial session found');
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      }
      
      setLoading(false);
    });

    const initializeAuth = async () => {
      try {
        console.log('🔍 Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          setLoading(false);
          return;
        }

        console.log('📊 Initial session status:', session ? 'Found' : 'Not found', session?.user?.id);
        
        if (!session) {
          setLoading(false);
        }
      } catch (error) {
        console.error('💥 Failed to initialize auth:', error);
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      console.log('⏰ Auth initialization timeout reached');
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
      console.log('🔐 Attempting sign in for:', email);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
      } else {
        console.log('✅ Sign in API call successful');
      }

      return { error };
    } catch (error) {
      console.error('💥 Sign in exception:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      console.log('📝 Attempting sign up for:', email);
      
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
        console.error('❌ Sign up error:', error);
      } else {
        console.log('✅ Sign up API call successful');
      }

      return { error };
    } catch (error) {
      console.error('💥 Sign up exception:', error);
      return { error };
    }
  };

  const signOut = async () => {
    if (signOutLoading) {
      console.log('⏳ Sign out already in progress');
      return { error: null };
    }

    try {
      setSignOutLoading(true);
      console.log('🚪 Starting sign out process...');
      
      clearAllSessionData();
      setSignOutLoading(false);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Supabase signOut API returned error:', error);
      } else {
        console.log('✅ Supabase signOut API call successful');
      }
      
      setTimeout(() => {
        window.location.href = '/auth';
      }, 100);
      
      return { error: null };
    } catch (error) {
      console.error('💥 Sign out exception:', error);
      clearAllSessionData();
      setSignOutLoading(false);
      
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
