
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isSuperuser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const ensureAdminProfile = async (user: User) => {
    // Check if this is the admin user and ensure proper profile exists
    if (user.email === 'admin@admin.com') {
      try {
        // Try to get existing profile
        let { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error('Error fetching admin profile:', fetchError);
          return null;
        }

        if (!existingProfile) {
          // Create profile if it doesn't exist
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email!,
              first_name: 'Admin',
              last_name: 'User',
              role: 'superuser'
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating admin profile:', insertError);
            return null;
          }
          return newProfile;
        } else if (existingProfile.role !== 'superuser') {
          // Update existing profile to superuser if it's not already
          const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({
              role: 'superuser',
              first_name: existingProfile.first_name || 'Admin',
              last_name: existingProfile.last_name || 'User'
            })
            .eq('id', user.id)
            .select()
            .single();

          if (updateError) {
            console.error('Error updating admin profile:', updateError);
            return existingProfile;
          }
          return updatedProfile;
        }
        
        return existingProfile;
      } catch (error) {
        console.error('Error ensuring admin profile:', error);
        return null;
      }
    }
    
    // For non-admin users, fetch normally
    return fetchProfile(user.id);
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        ensureAdminProfile(session.user).then(setProfile);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const userProfile = await ensureAdminProfile(session.user);
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    console.log('Signing out...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
    } else {
      console.log('Successfully signed out');
      // Clear local state immediately
      setUser(null);
      setSession(null);
      setProfile(null);
    }
  };

  const isAdmin = profile?.role === 'admin' || profile?.role === 'superuser';
  const isSuperuser = profile?.role === 'superuser';

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isSuperuser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
