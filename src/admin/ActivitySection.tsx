import React from 'react';
import { Activity, Loader2 } from 'lucide-react';
import { usePortfolioCms } from '../context/PortfolioCmsContext';

export const ActivitySection: React.FC = () => {
  const { activity, loading } = usePortfolioCms();

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-[1.75rem] border border-white/10 bg-white/5 py-24 text-zinc-300">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
          <Activity className="h-3.5 w-3.5" />
          Activity
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Activity log</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
          A chronological record of important dashboard actions and portfolio changes.
        </p>
      </div>

      {activity.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-black/20 text-center">
          <p className="text-sm font-medium text-white">No activity yet</p>
          <p className="mt-2 max-w-sm text-sm text-zinc-500">
            Project, content, referral, and settings changes will appear here as they are made.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-black/30 text-left text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                <tr>
                  <th className="px-4 py-4">Action</th>
                  <th className="px-4 py-4">Item</th>
                  <th className="px-4 py-4">User</th>
                  <th className="px-4 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {activity.map(entry => (
                  <tr key={entry.id} className="bg-black/10">
                    <td className="px-4 py-4 align-top text-sm font-medium text-white">{entry.action}</td>
                    <td className="px-4 py-4 align-top text-sm text-zinc-300">
                      {entry.item}
                      {entry.details && <p className="mt-1 text-xs text-zinc-500">{entry.details}</p>}
                    </td>
                    <td className="px-4 py-4 align-top text-sm text-zinc-400">{entry.user}</td>
                    <td className="px-4 py-4 align-top text-sm text-zinc-400">
                      {new Date(entry.createdAt).toLocaleDateString()} <span className="text-zinc-600">·</span>{' '}
                      {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitySection;
