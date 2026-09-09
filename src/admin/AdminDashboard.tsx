import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Chrome, Loader2, LockKeyhole } from 'lucide-react';
import { DashboardLayout, AdminSection } from './DashboardLayout';
import { Overview } from './Overview';
import { ContentSection } from './ContentSection';
import { ProjectsManager } from './ProjectsManager';
import { MessagesSection } from './MessagesSection';
import { AnalyticsSection } from './AnalyticsSection';
import { ActivitySection } from './ActivitySection';
import { RemoteDevicesPage } from '../communication/remoteDevices/pages/RemoteDevicesPage';
import { GlobalSearchResults } from './GlobalSearchResults';
import { Trash } from './Trash';
import { SettingsSection } from './SettingsSection';
import { usePortfolioCms } from '../context/PortfolioCmsContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ToastContext';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signIn, signInWithGoogle, signOut, isAuthorized } = useAuth();
  const { toast } = useToast();
  const { settings, projects, messages, loading: cmsLoading, notConfigured } = usePortfolioCms();

  const [section, setSection] = useState<AdminSection>('overview');
  const [demoMode] = useState<boolean>(() =>
    import.meta.env.VITE_FREE_DASHBOARD_ACCESS === 'true' || !import.meta.env.VITE_FIREBASE_API_KEY
  );
  const [globalSearch, setGlobalSearch] = useState('');
  const [unlocked, setUnlocked] = useState(demoMode || Boolean(user && isAuthorized));

  useEffect(() => {
    if (user && isAuthorized) {
      setUnlocked(true);
    }
  }, [user, isAuthorized]);

  const unreadCount = useMemo(
    () => messages.filter(message => !message.read && !message.archived).length,
    [messages]
  );

  const trashCount = useMemo(() => projects.filter(project => project.isDeleted).length, [projects]);

  const handleLogout = async () => {
    if (!user) {
      navigate('/');
      return;
    }
    await signOut();
    toast('Signed out successfully.', 'info');
    navigate('/');
  };

  const loading = cmsLoading;

  if (loading) {
    return (
      <div className="admin-theme flex min-h-screen items-center justify-center bg-[#000000] text-white">
        <Loader2 className="h-7 w-7 animate-spin text-white" />
      </div>
    );
  }

  if (!unlocked) {
    return (
      <DashboardUnlock
        demoMode={demoMode}
        onUnlock={() => setUnlocked(true)}
        signIn={signIn}
        signInWithGoogle={signInWithGoogle}
      />
    );
  }

  if (!demoMode && !isAuthorized) {
    return (
      <div className="admin-theme flex min-h-screen items-center justify-center bg-[#000000] px-6 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0C0C0C] p-8 text-center">
          <h1 className="text-2xl font-semibold">Admin access required</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            This Firebase account is not authorized to manage portfolio data.
          </p>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-6 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (section) {
      case 'overview':
        return <Overview onNavigate={setSection} />;
      case 'content':
        return <ContentSection />;
      case 'projects':
        return <ProjectsManager />;
      case 'messages':
        return <MessagesSection />;
      case 'remoteDevices':
        return <RemoteDevicesPage />;
      case 'analytics':
        return <AnalyticsSection />;
      case 'activity':
        return <ActivitySection />;
      case 'trash':
        return <Trash />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <Overview onNavigate={setSection} />;
    }
  };

  return (
    <DashboardLayout
      active={section}
      onNavigate={setSection}
      trashCount={trashCount}
      unreadCount={unreadCount}
      searchValue={globalSearch}
      onSearchChange={setGlobalSearch}
      statusLabel={settings.availabilityStatus}
      onLogout={handleLogout}
    >
      {demoMode && (
        <div className="mb-6 rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
          Free dashboard mode is active. Changes are saved in this browser and do not require Firebase billing or admin authorization.
        </div>
      )}

      {notConfigured && !demoMode && (
        <div className="mb-6 rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
          Firebase is not configured. Cloud sync is disabled until the environment variables are added.
        </div>
      )}

      {globalSearch.trim() && (
        <GlobalSearchResults
          query={globalSearch}
          onNavigate={sectionId => {
            setSection(sectionId);
            if (sectionId !== section) {
              setGlobalSearch('');
            }
          }}
        />
      )}

      {renderSection()}
    </DashboardLayout>
  );
};

function DashboardUnlock({
  demoMode,
  onUnlock,
  signIn,
  signInWithGoogle,
}: {
  demoMode: boolean;
  onUnlock: () => void;
  signIn: (email: string, password: string) => Promise<unknown>;
  signInWithGoogle: () => Promise<unknown>;
}) {
  const [email, setEmail] = useState(import.meta.env.VITE_ADMIN_EMAIL?.trim() || '');
  const [password, setPassword] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const formatSignInError = (signInError: unknown): string => {
    const errorCode = signInError && typeof signInError === 'object' && 'code' in signInError
      ? String((signInError as { code?: unknown }).code)
      : '';
    if (errorCode === 'auth/configuration-not-found' || errorCode === 'auth/operation-not-allowed') {
      return 'Google sign-in is not enabled in Firebase Authentication console yet.';
    }
    if (errorCode === 'auth/popup-closed-by-user') {
      return 'Sign-in window was closed before completion.';
    }
    return signInError instanceof Error ? signInError.message : 'Sign in failed. Please try again.';
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSubmitting(true);
    try {
      await signInWithGoogle();
      onUnlock();
    } catch (signInError) {
      setError(formatSignInError(signInError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-theme flex min-h-screen items-center justify-center bg-[#000000] px-6 text-white">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0C0C0C]/90 p-6 shadow-[0_0_60px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-[#0C0C0C] text-white shadow-[0_0_40px_rgba(255,255,255,0.08)]">
          <LockKeyhole className="h-7 w-7" />
        </div>
        <p className="mt-6 text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-[#71717A]">Admin Access Required</p>
        <h1 className="mt-2 text-center text-3xl font-bold uppercase tracking-tight">Sign in</h1>
        <p className="mt-2 text-center text-xs leading-relaxed text-[#A1A1AA]">Sign in with your authorized Google account to manage your portfolio.</p>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs leading-relaxed text-red-300">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <button
            type="button"
            disabled={submitting}
            onClick={handleGoogleSignIn}
            className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-white px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-black transition-all hover:bg-zinc-200 disabled:cursor-wait disabled:opacity-60 shadow-lg"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            {submitting ? 'Authenticating...' : 'Sign in with Google'}
          </button>

          {!showEmailForm ? (
            <button
              type="button"
              onClick={() => setShowEmailForm(true)}
              className="w-full text-center text-[11px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Sign in with Email & Password instead
            </button>
          ) : (
            <form
              className="space-y-3 pt-2 border-t border-white/10"
              onSubmit={async event => {
                event.preventDefault();
                setError('');
                if (demoMode) {
                  onUnlock();
                  return;
                }
                setSubmitting(true);
                try {
                  await signIn(email.trim(), password);
                  onUnlock();
                } catch (signInError) {
                  setError(formatSignInError(signInError));
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <label className="block space-y-1.5 text-left">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A1A1AA]">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  autoComplete="email"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-white/30"
                  placeholder="you@example.com"
                  required
                />
              </label>
              <label className="block space-y-1.5 text-left">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A1A1AA]">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-white/30"
                  placeholder="••••••••"
                  required
                />
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 disabled:opacity-60 transition-colors"
              >
                {submitting ? 'Signing in...' : 'Sign in with Password'}
                <ArrowLeftRight className="h-3.5 w-3.5" />
              </button>
            </form>
          )}

          {demoMode && (
            <p className="pt-2 text-center text-[11px] leading-relaxed text-zinc-500">
              Demo Mode is enabled locally. Clicking Sign in will unlock the workspace.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
