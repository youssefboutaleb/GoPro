
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';

export const fetchProfile = async (userId: string): Promise<Profile | null> => {
  try {
    console.log('🔍 Fetching profile for user:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ Profile fetch error:', error.message);
      
      // Check if it's a JWT expired error
      if (error.message.includes('JWT') || error.message.includes('expired')) {
        console.error('🔒 JWT expired - signing out user');
        await supabase.auth.signOut();
        window.location.href = '/auth';
      }
      
      return null;
    }

    if (!data) {
      console.log('⚠️ No profile found for user:', userId);
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
    
    // Check if the error message includes JWT or expired
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('JWT') || errorMessage.includes('expired')) {
      console.error('🔒 JWT expired - signing out user');
      await supabase.auth.signOut();
      window.location.href = '/auth';
    }
    
    return null;
  }
};

export const clearAllSessionData = () => {
  console.log('🧹 Clearing all session data');
  
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

export const signIn = async (email: string, password: string) => {
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

export const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
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
