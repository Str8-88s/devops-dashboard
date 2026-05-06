import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
  accessToken: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Silent refresh on mount — restore session if refresh token cookie exists
  useEffect(() => {
    fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.data?.accessToken) setAccessToken(data.data.accessToken);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const login = (token: string) => setAccessToken(token);
  const logout = () => {
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ accessToken, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

