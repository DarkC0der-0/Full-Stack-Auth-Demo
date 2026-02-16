import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, ApiError } from '../services/api';

interface User {
  id?: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  signUp: (email: string, name: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in (token + user in localStorage)
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('currentUser');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const signUp = async (email: string, name: string, password: string): Promise<void> => {
    try {
      const response = await authApi.signUp({ email, name, password });
      
      // Store token and user
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      
      setToken(response.accessToken);
      setUser(response.user);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Failed to sign up. Please try again.');
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      const response = await authApi.signIn({ email, password });
      
      // Store token and user
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      
      setToken(response.accessToken);
      setUser(response.user);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Failed to sign in. Please try again.');
    }
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signUp,
        signIn,
        signOut,
        isAuthenticated: !!user,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
