import React, { useMemo, useState } from 'react';
import { AlertTriangle, Loader2, LogOut, MoonStar, Settings, ShieldCheck, Save, SunMedium, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePortfolioCms } from '../context/PortfolioCmsContext';
import { useToast } from './ToastContext';
import { defaultPortfolioContent, defaultPortfolioSettings } from '../data/portfolioDefaults';
import type { PortfolioSettings, ThemeMode } from '../types';

export const SettingsSection: React.FC = () => {
  const {
    settings,
    content,
    projects,
    skills,
    referrals,
    messages,
    media,
    deleteSkill,
    deleteReferral,
    deleteMessage,
    deleteMedia,
    permanentlyDeleteProject,
    updateSettings,
    updateContent,
    logActivity,
  } = usePortfolioCms();
  const { user, resetPassword, signOut, isConfigured } = useAuth();
  const { toast } = useToast();
  const [draft, setDraft] = useState<PortfolioSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [dangerOpen, setDangerOpen] = useState(false);

  const sessionInfo = useMemo(() => {
    const providerNames = Array.from(
      new Set(
        (user?.providerData ?? [])
          .map(provider => {
            if (provider.providerId === 'password') return 'Email / Password';
            if (provider.providerId === 'google.com') return 'Google';
            return provider.providerId;
          })
          .filter(Boolean)
      )
    );
    return providerNames.length > 0 ? providerNames.join(' · ') : 'Unknown';
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({
        ...draft,
        updatedAt: Date.now(),
      });
      await updateContent({
        ...content,
        portfolioName: draft.portfolioName,
        contact: {
          ...content.contact,
          email: draft.email,
          phone: draft.phone,
          availabilityStatus: draft.availabilityStatus,
          socials: draft.socialLinks,
        },
        updatedAt: Date.now(),
      });
      await logActivity({
        action: 'Settings changed',
        item: 'Portfolio settings',
        itemType: 'settings',
        user: 'Administrator',
      });
      toast('Settings saved successfully.', 'success');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!isConfigured || !user?.email) {
      toast('Password reset is unavailable in local demo mode.', 'warning');
      return;
    }
    await resetPassword(user.email);
    toast('Password reset email sent.', 'success');
  };

  const handleLogout = async () => {
    if (!isConfigured || !user) {
      toast('Local demo mode does not use Firebase sessions.', 'info');
      return;
    }
    await signOut();
    toast('Signed out successfully.', 'info');
  };

  const handleResetEverything = async () => {
    for (const project of projects) {
      await permanentlyDeleteProject(project);
    }
    for (const skill of skills) {
      await deleteSkill(skill.id);
    }
    for (const referral of referrals) {
      await deleteReferral(referral.id);
    }
    for (const message of messages) {
      await deleteMessage(message.id);
    }
    for (const asset of media) {
      await deleteMedia(asset.id);
    }
    await updateSettings(defaultPortfolioSettings);
    await updateContent(defaultPortfolioContent);
    setDraft(defaultPortfolioSettings);
    await logActivity({
      action: 'Portfolio data reset',
      item: 'All managed collections',
      itemType: 'settings',
      user: 'Administrator',
    });
    toast('Portfolio data reset completed.', 'success');
    setDangerOpen(false);
  };

  return (
    <div className="space-y-6 text-white">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
          <Settings className="h-3.5 w-3.5" />
          Settings
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">System settings</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
          Manage account details, portfolio contact data, appearance preferences, and destructive maintenance actions.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Account" description="Your authenticated admin session and password tools." icon={<ShieldCheck className="h-4 w-4" />}>
          <div className="space-y-4 text-sm">
            <Row label="Signed in as" value={user?.email ?? 'Not signed in'} />
            <Row label="Session provider" value={sessionInfo} />
            <Row label="Last sign in" value={user?.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : 'Unavailable'} />

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => void handleResetPassword()}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                Change password
              </button>
              <button
                onClick={() => void handleLogout()}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-zinc-100"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </Card>

        <Card title="Portfolio" description="Global contact details and public availability." icon={<SunMedium className="h-4 w-4" />}>
          <div className="grid gap-4">
            <Field label="Portfolio name">
              <input
                value={draft.portfolioName}
                onChange={e => setDraft(prev => ({ ...prev, portfolioName: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email">
                <input
                  value={draft.email}
                  onChange={e => setDraft(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                />
              </Field>
              <Field label="Phone">
                <input
                  value={draft.phone}
                  onChange={e => setDraft(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                />
              </Field>
            </div>
            <Field label="Availability status">
              <input
                value={draft.availabilityStatus}
                onChange={e => setDraft(prev => ({ ...prev, availabilityStatus: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
              />
            </Field>
            <Field label="Social links">
              <div className="space-y-2">
                {draft.socialLinks.map((link, index) => (
                  <div key={`${link.label}-${index}`} className="grid gap-2 sm:grid-cols-[1fr_1fr]">
                    <input
                      value={link.label}
                      onChange={e =>
                        setDraft(prev => ({
                          ...prev,
                          socialLinks: prev.socialLinks.map((item, idx) => (idx === index ? { ...item, label: e.target.value } : item)),
                        }))
                      }
                      placeholder="Label"
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                    />
                    <input
                      value={link.url}
                      onChange={e =>
                        setDraft(prev => ({
                          ...prev,
                          socialLinks: prev.socialLinks.map((item, idx) => (idx === index ? { ...item, url: e.target.value } : item)),
                        }))
                      }
                      placeholder="https://..."
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                    />
                  </div>
                ))}
              </div>
            </Field>
          </div>
        </Card>

        <Card title="Appearance" description="Dashboard and portfolio presentation preferences." icon={<MoonStar className="h-4 w-4" />}>
          <div className="grid gap-4">
            <Field label="Default theme">
              <div className="flex gap-2">
                {(['dark', 'light'] as ThemeMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setDraft(prev => ({ ...prev, darkModeDefault: mode }))}
                    className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold capitalize transition-all ${
                      draft.darkModeDefault === mode
                        ? 'border-white bg-white text-black'
                        : 'border-white/10 bg-black/20 text-zinc-300 hover:bg-white/5'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </Field>

            <ToggleRow
              label="Compact dashboard"
              description="Use denser spacing across admin tables and cards."
              checked={draft.dashboardPreferences.compactMode}
              onChange={checked =>
                setDraft(prev => ({
                  ...prev,
                  dashboardPreferences: { ...prev.dashboardPreferences, compactMode: checked },
                }))
              }
            />

            <ToggleRow
              label="Show advanced controls"
              description="Reveal advanced management options in the dashboard."
              checked={draft.dashboardPreferences.showAdvanced}
              onChange={checked =>
                setDraft(prev => ({
                  ...prev,
                  dashboardPreferences: { ...prev.dashboardPreferences, showAdvanced: checked },
                }))
              }
            />
          </div>
        </Card>

        <Card title="Security" description="Session health and sensitive account actions." icon={<ShieldCheck className="h-4 w-4" />}>
          <div className="space-y-3 text-sm text-zinc-300">
            <Row label="Active session" value="This browser session" />
            <Row
              label="Login history"
              value={user?.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : 'Unavailable'}
            />
            <p className="text-xs leading-relaxed text-zinc-500">
              Full multi-device session revocation requires backend Firebase Admin privileges. From the dashboard, you can sign out this session and rotate your password.
            </p>
          </div>
        </Card>
      </div>

      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              Danger zone
            </div>
            <h2 className="text-xl font-semibold text-white">Destructive actions</h2>
            <p className="max-w-2xl text-sm text-zinc-400">
              Resetting portfolio data removes projects, skills, referrals, messages, and media from the dashboard and public portfolio.
            </p>
          </div>

          <button
            onClick={() => setDangerOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-zinc-100"
          >
            <Trash2 className="h-4 w-4" />
            Delete portfolio data
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save settings'}
        </button>
      </div>

      {dangerOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl">
          <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-[#0A0A0B] p-6 text-white shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Confirm reset</p>
                  <h2 className="mt-2 text-xl font-semibold">Delete portfolio data</h2>
                </div>
              </div>
              <button
                onClick={() => setDangerOpen(false)}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-300 hover:bg-white hover:text-black"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-zinc-300">
              This will remove the current managed portfolio data and restore the default content and settings. Are you sure you want to continue?
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDangerOpen(false)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleResetEverything()}
                className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-zinc-100"
              >
                Confirm reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function Card({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-white">{icon}</div>
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="text-sm text-zinc-400">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-zinc-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`rounded-full p-2 transition-all ${checked ? 'bg-white text-black' : 'border border-white/10 bg-white/5 text-zinc-300'}`}
      >
        {checked ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

export default SettingsSection;
