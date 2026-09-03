import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, Loader2, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ADMIN_EMAIL = (
  import.meta.env.VITE_ADMIN_EMAIL as string | undefined
);

export const AdminLogin: React.FC = () => {
  const { signIn, isConfigured } = useAuth();
  const { playSound } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playSound('click');
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (ADMIN_EMAIL && email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      setError('That email is not authorized for this dashboard.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      navigate('/admin');
    } catch (err) {
      const message =
        err instanceof Error && 'code' in err
          ? (err as { code?: string }).code
          : undefined;
      if (message === 'auth/wrong-password' || message === 'auth/user-not-found' || message === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (message === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (message === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a moment and try again.');
      } else if (message === 'auth/network-request-failed') {
        setError('Network error. Check your connection and try again.');
      } else if (!isConfigured) {
        setError('Firebase is not configured yet. Add your VITE_FIREBASE_* environment variables.');
      } else {
        setError('Something went wrong. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#FFFFFF] text-[#111827] font-sans px-4">
      {/* Soft green background accents */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#DCFCE7] rounded-full blur-3xl opacity-70 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#F0FDF4] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-[#DCFCE7]/60 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#16A34A] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to portfolio
        </Link>

        <div className="bg-white rounded-3xl border border-[#DCFCE7] shadow-[0_20px_60px_-20px_rgba(22,163,74,0.25)] p-8 sm:p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-[#16A34A] text-white shadow-lg shadow-[#16A34A]/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#111827]">Admin Control Center</h1>
              <p className="text-sm text-[#6B7280]">Restricted access · Authorized only</p>
            </div>
          </div>

          {!isConfigured && (
            <div className="mb-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] text-sm text-[#15803D]">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                Firebase is not configured. Add your <code className="font-mono text-xs">VITE_FIREBASE_*</code>{' '}
                environment variables to enable authentication.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="block text-xs font-bold uppercase tracking-wider text-[#374151]">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D1D5DB] focus:border-[#16A34A] focus:ring-2 focus:ring-[#22C55E]/30 focus:outline-none text-sm bg-white text-[#111827] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="block text-xs font-bold uppercase tracking-wider text-[#374151]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-[#D1D5DB] focus:border-[#16A34A] focus:ring-2 focus:ring-[#22C55E]/30 focus:outline-none text-sm bg-white text-[#111827] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#16A34A] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3.5 rounded-xl bg-[#F0FDF4] border border-[#FCA5A5]/50 text-sm text-[#111827]">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#15803D]" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#16A34A]/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#6B7280]">
            Secure access · Firebase Authentication
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;