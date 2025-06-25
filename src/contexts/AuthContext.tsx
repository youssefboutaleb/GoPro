
import React, { createContext } from 'react';
import { AuthContextType, AuthProviderProps } from '@/types/auth';
import { useAuthState } from '@/hooks/useAuthState';
import { signIn, signUp } from '@/utils/authUtils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    user,
    profile,
    session,
    loading,
    profileLoading,
    signOutLoading,
    signOut
  } = useAuthState();

  const value: AuthContextType = {
    user,
    profile,
    session,
    signIn,
    signUp,
    signOut,
    loading,
    profileLoading,
    signOutLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
