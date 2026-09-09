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
  const adminEmails = [
    import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase(),
    'thabolanez2@gmail.com',
    'thabolanez4@gmail.com',
  ].filter(Boolean) as string[];

  const hasAdminAccess = async (candidate: User, forceRefresh = false): Promise<boolean> => {
    try {
      const token = await candidate.getIdTokenResult(forceRefresh);
      if (token.claims.admin === true) return true;
      const userEmail = candidate.email?.trim().toLowerCase();
      return !!userEmail && adminEmails.includes(userEmail);
    } catch {
      const userEmail = candidate.email?.trim().toLowerCase();
      return !!userEmail && adminEmails.includes(userEmail);
    }
  };

  useEffect(() => {
    if (!isConfigured) {
      setUser(null);
      setIsAuthorized(true);
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

  useEffect(() => {
    if (!isConfigured) {
      setIsAuthorized(true);
      return;
    }
    if (!user) {
      setIsAuthorized(false);
      return;
    }

    let cancelled = false;
    void hasAdminAccess(user).then(authorized => {
      if (!cancelled) setIsAuthorized(authorized);
    });

    return () => {
      cancelled = true;
    };
  }, [isConfigured, user]);

  const signIn = async (email: string, password: string): Promise<User> => {
    const u = await fbSignIn(email, password);
    const authorized = await hasAdminAccess(u, true);
    if (!authorized) {
      await fbSignOut().catch(() => undefined);
      setUser(null);
      setIsAuthorized(false);
      const authorizationError = new Error(`The account (${u.email || email}) is not authorized to access the admin dashboard.`);
      Object.assign(authorizationError, { code: 'auth/admin-not-authorized' });
      throw authorizationError;
    }
    setUser(u);
    setIsAuthorized(true);
    return u;
  };

  const createAccount = async (email: string, password: string): Promise<User> => {
    const u = await fbCreateAccount(email, password);
    setUser(u);
    return u;
  };

  const signInWithGoogle = async (): Promise<User> => {
    const u = await fbSignInWithGoogle();
    const authorized = await hasAdminAccess(u, true);
    if (!authorized) {
      await fbSignOut().catch(() => undefined);
      setUser(null);
      setIsAuthorized(false);
      const authorizationError = new Error(`The Google account (${u.email || 'unknown'}) is not authorized to access the admin dashboard.`);
      Object.assign(authorizationError, { code: 'auth/admin-not-authorized' });
      throw authorizationError;
    }
    setUser(u);
    setIsAuthorized(true);
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
