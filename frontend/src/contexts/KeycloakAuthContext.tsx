import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Keycloak from 'keycloak-js';
import { Profile } from '@/types/auth';

interface KeycloakAuthContextType {
  keycloak: Keycloak | null;
  authenticated: boolean;
  profile: Profile | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  getToken: () => string | undefined;
}

const KeycloakAuthContext = createContext<KeycloakAuthContextType | undefined>(undefined);

interface KeycloakAuthProviderProps {
  children: ReactNode;
}

export const KeycloakAuthProvider: React.FC<KeycloakAuthProviderProps> = ({ children }) => {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initKeycloak = async () => {
      try {
        const keycloakConfig = {
          url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
          realm: import.meta.env.VITE_KEYCLOAK_REALM || 'medico',
          clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'medico-frontend'
        };

        const keycloakInstance = new Keycloak(keycloakConfig);
        
        const authenticated = await keycloakInstance.init({
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
          checkLoginIframe: false
        });

        setKeycloak(keycloakInstance);
        setAuthenticated(authenticated);

        if (authenticated && keycloakInstance.token) {
          // Fetch user profile from backend
          const response = await fetch('/api/profiles/me', {
            headers: {
              'Authorization': `Bearer ${keycloakInstance.token}`
            }
          });

          if (response.ok) {
            const profileData = await response.json();
            setProfile(profileData);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize Keycloak:', error);
        setLoading(false);
      }
    };

    initKeycloak();
  }, []);

  const login = () => {
    if (keycloak) {
      keycloak.login();
    }
  };

  const logout = () => {
    if (keycloak) {
      keycloak.logout({ redirectUri: window.location.origin });
    }
  };

  const getToken = () => {
    return keycloak?.token;
  };

  return (
    <KeycloakAuthContext.Provider value={{
      keycloak,
      authenticated,
      profile,
      loading,
      login,
      logout,
      getToken
    }}>
      {children}
    </KeycloakAuthContext.Provider>
  );
};

export const useKeycloakAuth = () => {
  const context = useContext(KeycloakAuthContext);
  if (context === undefined) {
    throw new Error('useKeycloakAuth must be used within a KeycloakAuthProvider');
  }
  return context;
};