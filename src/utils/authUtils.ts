
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';

export const fetchProfile = async (userId: string): Promise<Profile | null> => {
  try {
    console.log('🔍 Starting profile fetch for user:', userId);
    
    // Add a timeout promise to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Profile fetch timeout')), 10000); // 10 second timeout
    });
    
    // First, let's check what session we have
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('📋 Current session status:', !!sessionData.session, 'User:', sessionData.session?.user?.id);
    
    // Add more detailed logging for the actual query
    console.log('🔎 About to execute profiles query with userId:', userId);
    
    const queryPromise = supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    // Race between the query and timeout
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

    console.log('📊 Profile query completed:', {
      hasData: !!data,
      hasError: !!error,
      errorDetails: error ? {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      } : null,
      userData: data ? {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role
      } : null
    });

    if (error) {
      console.error('❌ Profile fetch error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Let's also check if it's an RLS issue by trying to query without filters
      console.log('🔍 Checking RLS permissions by attempting to query profiles table...');
      try {
        const { data: testData, error: testError } = await Promise.race([
          supabase.from('profiles').select('count(*)').limit(1),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Test query timeout')), 5000))
        ]);
        
        console.log('🧪 Test query result:', {
          testData,
          testError: testError ? {
            message: testError.message,
            details: testError.details,
            hint: testError.hint,
            code: testError.code
          } : null
        });
      } catch (testError) {
        console.error('🧪 Test query failed:', testError);
      }
      
      return null;
    }

    if (!data) {
      console.log('⚠️ No profile found for user:', userId, 'This might be normal for new users');
      
      // Let's check if there are any profiles in the table at all
      console.log('🔍 Checking if profiles table is accessible...');
      try {
        const { data: allProfiles, error: allError } = await Promise.race([
          supabase.from('profiles').select('id').limit(5),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('All profiles query timeout')), 5000))
        ]);
        
        console.log('📋 Profiles table check:', {
          profileCount: allProfiles?.length || 0,
          hasError: !!allError,
          errorDetails: allError ? {
            message: allError.message,
            details: allError.details,
            hint: allError.hint,
            code: allError.code
          } : null
        });
      } catch (allError) {
        console.error('📋 All profiles query failed:', allError);
      }
      
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
    if (error instanceof Error && error.message.includes('timeout')) {
      console.error('⏰ Profile fetch timed out - this indicates a database connection issue');
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
