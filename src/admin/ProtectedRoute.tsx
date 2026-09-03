import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * Guards the /admin dashboard. While the auth state is still resolving we show
 * a lightweight loader; once resolved, unauthenticated users are redirected to
 * /admin/login so direct URL access is always blocked.
 */
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isConfigured } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0FDF4]">
        <Loader2 className="w-8 h-8 text-[#16A34A] animate-spin" />
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0FDF4] px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#DCFCE7] p-8 text-center shadow-lg">
          <h1 className="text-lg font-bold text-[#111827]">Firebase not configured</h1>
          <p className="text-sm text-[#6B7280] mt-2">
            Add your <code className="font-mono text-xs">VITE_FIREBASE_*</code> environment variables to
            access the admin dashboard.
          </p>
          <a href="/" className="mt-5 inline-flex px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-semibold transition-all">
            Back to portfolio
          </a>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;