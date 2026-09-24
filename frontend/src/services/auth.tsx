import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from './api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchRolePreset: (username: string) => Promise<boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('patri_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('patri_user');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('patri_user');
      }
    }
    setIsLoading(false);
  }, [token]);

  const login = async (username: string, password: string = 'admin'): Promise<boolean> => {
    try {
      const res = await api.login(username, password);
      const { access_token, user: userData } = res.data;
      localStorage.setItem('patri_token', access_token);
      localStorage.setItem('patri_user', JSON.stringify(userData));
      setToken(access_token);
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('patri_token');
    localStorage.removeItem('patri_user');
    setToken(null);
    setUser(null);
  };

  const switchRolePreset = async (username: string): Promise<boolean> => {
    return login(username, 'admin');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        switchRolePreset,
        isAuthenticated: !!user && !!token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
