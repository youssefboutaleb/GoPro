
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
