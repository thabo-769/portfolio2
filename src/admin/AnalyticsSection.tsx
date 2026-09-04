import React, { useMemo } from 'react';
import { Activity, BarChart3, Github, Globe, Loader2, MousePointerClick, Mail as MailIcon } from 'lucide-react';
import { usePortfolioCms } from '../context/PortfolioCmsContext';

export const AnalyticsSection: React.FC = () => {
  const { analytics, analyticsEvents, projects, loading } = usePortfolioCms();

  const topProjects = useMemo(
    () =>
      analytics.mostViewedProjects.map(entry => ({
        ...entry,
        name: projects.find(project => project.id === entry.projectId)?.name ?? entry.projectId,
      })),
    [analytics.mostViewedProjects, projects]
  );

  const hasData =
    analytics.portfolioViews > 0 ||
    analytics.projectViews > 0 ||
    analytics.githubClicks > 0 ||
    analytics.liveClicks > 0 ||
    analytics.contactSubmissions > 0 ||
    analytics.referralViews > 0 ||
    analyticsEvents.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-[1.75rem] border border-white/10 bg-white/5 py-24 text-zinc-300">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-black/20 text-center">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-zinc-300">
          <BarChart3 className="h-8 w-8" />
        </div>
        <p className="mt-4 text-sm font-medium text-white">No analytics data available yet</p>
        <p className="mt-2 max-w-sm text-sm text-zinc-500">
          Real analytics will appear here once visitors load the portfolio and interact with projects or forms.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
          <BarChart3 className="h-3.5 w-3.5" />
          Analytics
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Real analytics</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
          These figures are based on events stored by the dashboard and public portfolio, not hard-coded sample data.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Portfolio views" value={analytics.portfolioViews} icon={<Globe className="h-5 w-5" />} />
        <MetricCard label="Project views" value={analytics.projectViews} icon={<Activity className="h-5 w-5" />} />
        <MetricCard label="GitHub clicks" value={analytics.githubClicks} icon={<Github className="h-5 w-5" />} />
        <MetricCard label="Live clicks" value={analytics.liveClicks} icon={<MousePointerClick className="h-5 w-5" />} />
        <MetricCard label="Contact submissions" value={analytics.contactSubmissions} icon={<MailIcon className="h-5 w-5" />} />
        <MetricCard label="Referral views" value={analytics.referralViews} icon={<Activity className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Most viewed projects</h2>
          <p className="text-sm text-zinc-400">The projects most often opened from the public portfolio.</p>

          {topProjects.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-black/20 p-6 text-sm text-zinc-500">
              No project view data yet.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {topProjects.map(project => (
                <div key={project.projectId} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-white">{project.name}</span>
                    <span className="text-zinc-400">{project.views} views</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-black/30">
                    <div
                      className="h-full rounded-full bg-white"
                      style={{ width: `${Math.min(100, (project.views / Math.max(1, topProjects[0]?.views ?? 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Snapshot</h2>
          <div className="mt-5 space-y-3 text-sm text-zinc-300">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <span>Latest update</span>
              <span className="font-medium text-white">
                {analytics.lastUpdated ? new Date(analytics.lastUpdated).toLocaleString() : 'No updates yet'}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <span>Project view events</span>
              <span className="font-medium text-white">{analytics.projectViews}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <span>Portfolio view events</span>
              <span className="font-medium text-white">{analytics.portfolioViews}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function MetricCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
      <div className="inline-flex rounded-2xl border border-white/10 bg-white/10 p-3 text-white">{icon}</div>
      <div className="mt-4 text-3xl font-semibold tracking-tight text-white">{value}</div>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">{label}</p>
    </div>
  );
}

export default AnalyticsSection;
