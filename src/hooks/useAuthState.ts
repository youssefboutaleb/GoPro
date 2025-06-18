
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';
import { fetchProfile, clearAllSessionData } from '@/utils/authUtils';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [signOutLoading, setSignOutLoading] = useState(false);

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
        setUser(null);
        setSession(null);
        setProfile(null);
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
          try {
            // Add timeout to profile fetch to prevent hanging
            const timeoutPromise = new Promise<Profile | null>((_, reject) => {
              setTimeout(() => reject(new Error('Profile fetch timeout in auth state change')), 15000);
            });
            
            const userProfile = await Promise.race([
              fetchProfile(session.user.id),
              timeoutPromise
            ]);
            
            console.log('📦 Profile fetch result:', userProfile ? 'Success' : 'Failed/No profile found');
            setProfile(userProfile);
            
            if (userProfile) {
              console.log('🎉 Profile set successfully! Welcome:', userProfile.first_name, userProfile.last_name);
            } else {
              console.log('⚠️ Profile could not be loaded, but user is authenticated');
            }
          } catch (error) {
            console.error('💥 Error during profile fetch:', error);
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      }
      
      if (event === 'INITIAL_SESSION') {
        console.log('🔧 INITIAL_SESSION event detected - session exists:', !!session);
        if (session) {
          console.log('🔧 Setting initial session state');
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            console.log('👤 Fetching initial profile...');
            try {
              // Add timeout for initial profile fetch as well
              const timeoutPromise = new Promise<Profile | null>((_, reject) => {
                setTimeout(() => reject(new Error('Initial profile fetch timeout')), 15000);
              });
              
              const userProfile = await Promise.race([
                fetchProfile(session.user.id),
                timeoutPromise
              ]);
              
              console.log('📦 Initial profile fetch result:', userProfile ? 'Success' : 'Failed/No profile found');
              setProfile(userProfile);
              
              if (userProfile) {
                console.log('🎉 Initial profile loaded! Welcome:', userProfile.first_name, userProfile.last_name);
              }
            } catch (error) {
              console.error('💥 Error during initial profile fetch:', error);
              setProfile(null);
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
        
        // Manually trigger profile fetch if session exists but auth events haven't fired
        if (session?.user) {
          console.log('🔧 Manual session setup - setting user and fetching profile');
          setSession(session);
          setUser(session.user);
          
          try {
            console.log('👤 Manually fetching profile for user:', session.user.id);
            
            // Add timeout for manual profile fetch
            const timeoutPromise = new Promise<Profile | null>((_, reject) => {
              setTimeout(() => reject(new Error('Manual profile fetch timeout')), 15000);
            });
            
            const userProfile = await Promise.race([
              fetchProfile(session.user.id),
              timeoutPromise
            ]);
            
            console.log('📦 Manual profile fetch result:', userProfile ? 'Success' : 'Failed/No profile found');
            setProfile(userProfile);
            
            if (userProfile) {
              console.log('🎉 Manual profile loaded! Welcome:', userProfile.first_name, userProfile.last_name);
            } else {
              console.log('⚠️ Manual profile fetch - no profile found for user');
            }
          } catch (error) {
            console.error('💥 Error during manual profile fetch:', error);
            setProfile(null);
          }
        }
        
        if (!session) {
          setLoading(false);
        }
      } catch (error) {
        console.error('💥 Failed to initialize auth:', error);
        setLoading(false);
      }
    };

    // Reduce timeout to be more responsive
    const timeoutId = setTimeout(() => {
      console.log('⏰ Auth initialization timeout reached');
      setLoading(false);
    }, 3000); // Reduced from 5000 to 3000

    initializeAuth();

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
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
      
      clearAllSessionData();
      setUser(null);
      setSession(null);
      setProfile(null);
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
      setUser(null);
      setSession(null);
      setProfile(null);
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
    signOutLoading,
    signOut
  };
};
