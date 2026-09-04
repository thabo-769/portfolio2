import React, { useMemo, useState } from 'react';
import { Quote, PlusCircle, ShieldCheck, Star } from 'lucide-react';
import { AddReferralModal } from '../UI/AddReferralModal';
import { useTheme } from '../../context/ThemeContext';
import { usePortfolioCms } from '../../context/PortfolioCmsContext';
import { initialReferrals } from '../../data/referrals';

export const Referrals: React.FC = () => {
  const { playSound } = useTheme();
  const { referrals } = usePortfolioCms();
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  const visibleReferrals = useMemo(
    () => {
      const source = referrals.length > 0 ? referrals : initialReferrals;
      return source
        .filter(referral => !referral.isDeleted)
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    },
    [referrals]
  );

  return (
    <section
      id="referrals"
      aria-label="Client & colleague testimonials"
      className="relative border-t border-white/10 bg-[#000000] py-28 text-left text-white sm:py-36"
    >
      <div className="pointer-events-none absolute left-0 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-white/5 blur-[130px]" />
      <div className="pointer-events-none absolute right-1/4 top-0 h-96 w-96 rounded-full bg-white/5 blur-[160px]" />

      <div className="relative z-10 mx-auto mb-12 max-w-7xl px-4 text-left sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3 text-left">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A1A1AA]">
              <span className="h-0.5 w-4 bg-[#71717A]" />
              <span>Social proof</span>
            </div>

            <h2 className="text-3xl font-bold uppercase tracking-tight text-white leading-[0.95] sm:text-4xl md:text-5xl">
              Peer and client
              <br />
              <span className="font-light text-transparent bg-clip-text bg-gradient-to-r from-white via-[#A1A1AA] to-white/70">
                endorsements
              </span>
            </h2>

            <p className="max-w-xl pt-1 text-sm font-normal leading-relaxed text-[#A1A1AA] sm:text-base">
              Live testimonials from collaborators and clients. New submissions are stored in the dashboard and reflected here automatically.
            </p>
          </div>

          <button
            onClick={() => {
              playSound('click');
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-black transition-all duration-300 hover:scale-105 hover:bg-[#A1A1AA] sm:text-sm"
          >
            <PlusCircle className="h-4 w-4" />
            Add endorsement
          </button>
        </div>
      </div>

      <div className="relative w-full overflow-hidden py-4">
        <div className="absolute left-0 top-0 bottom-0 z-20 w-16 bg-gradient-to-r from-black to-transparent sm:w-32 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 z-20 w-16 bg-gradient-to-l from-black to-transparent sm:w-32 pointer-events-none" />

        <div className="animate-referrals-marquee flex items-stretch gap-6 px-4">
          {[...visibleReferrals, ...visibleReferrals].map((ref, index) => (
            <Card key={`${ref.id}-${index}`} refItem={ref} playSound={playSound} />
          ))}
        </div>
      </div>

      {visibleReferrals.length === 0 && (
        <div className="mx-auto mt-8 max-w-7xl px-4 text-center text-sm text-[#A1A1AA] sm:px-6 lg:px-8">
          No testimonials have been published yet.
        </div>
      )}

      <AddReferralModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onReferralAdded={() => undefined}
      />
    </section>
  );
};

function Card({
  refItem,
  playSound,
}: {
  refItem: {
    id: string;
    name: string;
    role: string;
    organization: string;
    avatarUrl?: string;
    message: string;
    rating: number;
    verified?: boolean;
  };
  playSound: (type?: 'click' | 'pop' | 'success' | 'hover') => void;
}) {
  return (
    <div
      onMouseEnter={() => playSound('hover')}
      className="group flex w-[360px] shrink-0 select-none flex-col justify-between rounded-3xl border border-white/10 bg-[#0C0C0C]/85 p-7 shadow-[0_20px_45px_0_rgba(0,0,0,0.9)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-white/20 sm:w-[440px] sm:p-8"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black text-white transition-all group-hover:scale-110">
            <Quote className="h-4 w-4 fill-current text-white" />
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5 text-white">
              {[...Array(refItem.rating)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current text-white" />
              ))}
            </div>
            {refItem.verified && (
              <span className="ml-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-300">
                Verified
              </span>
            )}
          </div>
        </div>

        <p className="line-clamp-4 text-left text-xs leading-relaxed italic text-[#A1A1AA] transition-colors group-hover:text-white sm:text-sm">
          "{refItem.message}"
        </p>
      </div>

      <div className="mt-6 flex items-center gap-3.5 border-t border-white/10 pt-5">
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-white/10 bg-black">
          <img
            src={refItem.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
            alt={refItem.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-base font-semibold uppercase tracking-tight text-white">{refItem.name}</h3>
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-white" />
          </div>
          <p className="truncate text-xs text-[#A1A1AA]">
            {refItem.role} • <span className="font-medium text-white">{refItem.organization}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Referrals;
