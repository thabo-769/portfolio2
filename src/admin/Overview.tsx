import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Mail,
  Sparkles,
  Star,
  TabletSmartphone,
  Trash2,
} from 'lucide-react';
import { usePortfolioCms } from '../context/PortfolioCmsContext';
import { AdminSection } from './DashboardLayout';

interface OverviewProps {
  onNavigate: (section: AdminSection) => void;
}

interface StatCard {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: string;
}

function formatDateTime(value: number | null): string {
  if (!value) return 'No activity yet';
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export const Overview: React.FC<OverviewProps> = ({ onNavigate }) => {
  const { projects, messages, activity, analytics, content, settings, loading } = usePortfolioCms();

  const stats = useMemo<StatCard[]>(() => {
    const activeProjects = projects.filter(project => !project.isDeleted);
    const published = activeProjects.filter(project => project.status === 'Published');
    const draft = activeProjects.filter(project => project.status === 'Draft');
    const trash = projects.filter(project => project.isDeleted);
    const visibleMessages = messages.filter(message => !message.deletedAt && message.status !== 'archived');
    const lastUpdated = Math.max(
      content.updatedAt ?? 0,
      settings.updatedAt ?? 0,
      ...projects.map(project => project.updatedAt ?? 0),
      ...messages.map(message => message.updatedAt ?? 0)
    );

    return [
      { label: 'Total Projects', value: String(activeProjects.length), icon: <FolderKanban className="h-5 w-5" />, tone: 'from-white to-zinc-300' },
      { label: 'Published Projects', value: String(published.length), icon: <CheckCircle2 className="h-5 w-5" />, tone: 'from-zinc-100 to-white' },
      { label: 'Draft Projects', value: String(draft.length), icon: <Sparkles className="h-5 w-5" />, tone: 'from-zinc-300 to-zinc-100' },
      { label: 'Trash', value: String(trash.length), icon: <Trash2 className="h-5 w-5" />, tone: 'from-zinc-200 to-zinc-50' },
      { label: 'Contact Messages', value: String(visibleMessages.length), icon: <Mail className="h-5 w-5" />, tone: 'from-white to-zinc-200' },
      { label: 'Portfolio Views', value: String(analytics.portfolioViews), icon: <BarChart3 className="h-5 w-5" />, tone: 'from-zinc-200 to-white' },
      { label: 'Last Updated', value: formatDateTime(lastUpdated), icon: <CalendarClock className="h-5 w-5" />, tone: 'from-white to-zinc-100' },
    ];
  }, [projects, messages, analytics.portfolioViews, content.updatedAt, settings.updatedAt]);

  const recentActivity = activity.slice(0, 8);

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
            <Activity className="h-3.5 w-3.5" />
            Overview
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Portfolio command center</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
            A live snapshot of the data powering your portfolio. Every count on this page comes from stored content, not placeholder numbers.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onNavigate('projects')}
            className="rounded-full border border-white/10 bg-white px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-zinc-100"
          >
            Review projects
          </button>
          <button
            onClick={() => onNavigate('content')}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/10"
          >
            Edit content
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.button
              key={stat.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.25 }}
              onClick={() => {
                if (stat.label.includes('Project')) onNavigate('projects');
                else if (stat.label.includes('Messages')) onNavigate('messages');
                else if (stat.label.includes('Views')) onNavigate('analytics');
              }}
              className="group rounded-3xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10"
            >
              <div className={`mb-4 inline-flex rounded-2xl border border-white/10 bg-gradient-to-br ${stat.tone} p-3 text-black shadow-lg`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-semibold tracking-tight text-white">{stat.value}</div>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">{stat.label}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
                <Clock3 className="h-3.5 w-3.5" />
                Live data
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Recent activity</h2>
              <p className="text-sm text-zinc-400">A chronological log of changes made through the dashboard.</p>
            </div>
            <button
              onClick={() => onNavigate('activity')}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition-all hover:bg-white/10"
            >
              Open log
            </button>
          </div>

          {recentActivity.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/20 text-center">
              <div className="mb-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-zinc-300">
                <Activity className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-white">No activity yet</p>
              <p className="mt-1 max-w-sm text-sm text-zinc-500">
                Once you add, edit, or publish content, those actions will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map(entry => (
                <div
                  key={entry.id}
                  className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{entry.action}</p>
                    <p className="text-sm text-zinc-400">
                      {entry.item} <span className="text-zinc-600">•</span> {entry.user}
                    </p>
                  </div>
                  <div className="text-xs text-zinc-500">
                    {new Date(entry.createdAt).toLocaleDateString()} at {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Portfolio status</h2>
                <p className="text-sm text-zinc-400">Current live availability and editorial state.</p>
              </div>
              <div className="rounded-full border border-white/10 bg-white px-3 py-1 text-xs font-semibold text-black">
                {content.home.availabilityStatus}
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm text-zinc-300">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <span>Portfolio name</span>
                <span className="font-medium text-white">{content.portfolioName}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <span>Public email</span>
                <span className="font-medium text-white">{settings.email}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <span>Theme default</span>
                <span className="font-medium text-white">{settings.darkModeDefault}</span>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">Quick actions</h2>
            <div className="mt-4 space-y-2">
              <button
                onClick={() => onNavigate('projects')}
                className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white transition-all hover:bg-black/30"
              >
                <span>Manage projects</span>
                <FolderKanban className="h-4 w-4 text-zinc-400" />
              </button>
            <button
              onClick={() => onNavigate('messages')}
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white transition-all hover:bg-black/30"
            >
              <span>Review inbox</span>
              <Mail className="h-4 w-4 text-zinc-400" />
            </button>
            <button
              onClick={() => onNavigate('remoteDevices')}
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white transition-all hover:bg-black/30"
            >
              <span>Remote access</span>
              <TabletSmartphone className="h-4 w-4 text-zinc-400" />
            </button>
            <button
              onClick={() => onNavigate('analytics')}
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white transition-all hover:bg-black/30"
            >
                <span>Inspect analytics</span>
                <BarChart3 className="h-4 w-4 text-zinc-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
