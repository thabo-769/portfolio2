import React, { useMemo, useRef, useState } from 'react';
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
  const [unlocked, setUnlocked] = useState(demoMode);

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
  const startX = useRef<number | null>(null);
  const [email, setEmail] = useState(import.meta.env.VITE_ADMIN_EMAIL?.trim() || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const formatSignInError = (signInError: unknown): string => {
    const errorCode = signInError && typeof signInError === 'object' && 'code' in signInError
      ? String((signInError as { code?: unknown }).code)
      : '';
    return errorCode === 'auth/configuration-not-found'
      ? 'Google or email sign-in is not enabled for this Firebase project.'
      : signInError instanceof Error
        ? signInError.message
        : 'Sign in failed. Please try again.';
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    startX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (startX.current === null) return;
    const distance = event.clientX - startX.current;
    startX.current = null;
    if (Math.abs(distance) >= 70) onUnlock();
  };

  return (
    <div
      className="admin-theme flex min-h-screen touch-pan-y select-none items-center justify-center bg-[#000000] px-6 text-white"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        startX.current = null;
      }}
    >
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0C0C0C]/90 p-6 shadow-[0_0_60px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-[#0C0C0C] text-white shadow-[0_0_40px_rgba(255,255,255,0.08)]">
          <LockKeyhole className="h-7 w-7" />
        </div>
        <p className="mt-6 text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-[#71717A]">Welcome back</p>
        <h1 className="mt-3 text-center text-3xl font-bold uppercase tracking-tight">Sign in</h1>
        <p className="mt-3 text-center text-sm leading-relaxed text-[#A1A1AA]">Continue to your portfolio workspace.</p>

        <form className="mt-7 space-y-4" onSubmit={async event => {
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
        }}>
          <label className="block space-y-2 text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A1A1AA]">Email</span>
            <input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30" placeholder="you@example.com" required />
          </label>
          <label className="block space-y-2 text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A1A1AA]">Password</span>
            <input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30" placeholder="••••••••" required />
          </label>
          {error && <p className="rounded-2xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs leading-relaxed text-red-200">{error}</p>}
          <button type="submit" disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-black disabled:cursor-wait disabled:opacity-60">
            {submitting ? 'Signing in...' : 'Sign in'}
            <ArrowLeftRight className="h-4 w-4" />
          </button>
          {!demoMode && (
            <>
              <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#71717A]">
                <span className="h-px flex-1 bg-white/10" />
                <span>or</span>
                <span className="h-px flex-1 bg-white/10" />
              </div>
              <button
                type="button"
                disabled={submitting}
                onClick={async () => {
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
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/10 disabled:cursor-wait disabled:opacity-60"
              >
                <Chrome className="h-4 w-4" />
                Continue with Google
              </button>
            </>
          )}
          {demoMode && <p className="text-center text-xs text-zinc-500">Demo mode: click Sign in to open the dashboard.</p>}
        </form>
      </div>
    </div>
  );
}

export default AdminDashboard;
