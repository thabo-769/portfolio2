import React, { useMemo } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { usePortfolioCms } from '../context/PortfolioCmsContext';

export const Trash: React.FC = () => {
  const { referrals, loading } = usePortfolioCms();

  const trashedReferrals = useMemo(
    () => referrals.filter(referral => referral.isDeleted),
    [referrals]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-[1.75rem] border border-white/10 bg-white/5 py-24 text-zinc-300">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
            <Trash2 className="h-3.5 w-3.5" />
            Trash
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">System trash</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
            Projects are managed directly on GitHub. Deleted system items will appear here.
          </p>
        </div>
      </div>

      {trashedReferrals.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-black/20 text-center">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-zinc-300">
            <Trash2 className="h-8 w-8" />
          </div>
          <p className="mt-4 text-sm font-medium text-white">Trash is empty</p>
          <p className="mt-2 max-w-sm text-sm text-zinc-500">Deleted items will appear here with restore actions.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trashedReferrals.map(item => (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-medium text-white">{item.name}</p>
              <p className="text-xs text-zinc-400">{item.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Trash;
