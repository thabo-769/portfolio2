import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  onAuthChange,
  signIn as fbSignIn,
  signOut as fbSignOut,
} from '../firebase/projectsService';
import { isFirebaseConfigured } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isConfigured = isFirebaseConfigured();

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthChange(nextUser => {
      setUser(nextUser);
      setLoading(false);
    });
    return unsubscribe;
  }, [isConfigured]);

  const signIn = async (email: string, password: string) => {
    const u = await fbSignIn(email, password);
    setUser(u);
  };

  const signOut = async () => {
    await fbSignOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isConfigured, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};