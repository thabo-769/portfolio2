import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  onAuthChange,
  createAccount as fbCreateAccount,
  signIn as fbSignIn,
  signInWithGoogle as fbSignInWithGoogle,
  resetPassword as fbResetPassword,
  signOut as fbSignOut,
} from '../firebase/projectsService';
import { isFirebaseConfigured, persistFirebaseAuth } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  isAuthorized: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  createAccount: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isConfigured = isFirebaseConfigured();
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase() || '';
  const isAuthorized = !adminEmail || user?.email?.trim().toLowerCase() === adminEmail;

  useEffect(() => {
    if (!isConfigured) {
      setUser(null);
      setLoading(false);
      return;
    }
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    void persistFirebaseAuth()
      .then(() => {
        if (cancelled) return;
        unsubscribe = onAuthChange(nextUser => {
          setUser(nextUser);
          setLoading(false);

        });
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [isConfigured]);

  const signIn = async (email: string, password: string): Promise<User> => {
    const u = await fbSignIn(email, password);
    setUser(u);
    return u;
  };

  const createAccount = async (email: string, password: string): Promise<User> => {
    const u = await fbCreateAccount(email, password);
    setUser(u);
    return u;
  };

  const signInWithGoogle = async (): Promise<User> => {
    const u = await fbSignInWithGoogle();
    setUser(u);
    return u;
  };

  const resetPassword = async (email: string): Promise<void> => {
    await fbResetPassword(email);
  };

  const signOut = async () => {
    await fbSignOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured,
        isAuthorized,
        signIn,
        createAccount,
        signInWithGoogle,
        resetPassword,
        signOut,
      }}
    >
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
