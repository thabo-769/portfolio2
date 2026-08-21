import React, { useState } from 'react';
import { getStoredReferrals } from '../../data/referrals';
import { Referral } from '../../types';
import { AddReferralModal } from '../UI/AddReferralModal';
import { Quote, Star, ShieldCheck, PlusCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const Referrals: React.FC = () => {
  const { playSound } = useTheme();
  const [referrals, setReferrals] = useState<Referral[]>(() => getStoredReferrals());
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  const handleReferralAdded = (newRef: Referral) => {
    setReferrals(prev => [newRef, ...prev]);
  };

  return (
    <section
      id="referrals"
      aria-label="Client & colleague testimonials"
      className="relative py-28 sm:py-36 bg-[#000000] text-white border-t border-[#1F1F1F] overflow-hidden text-left"
    >
      {/* Subtle Glows */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-[#1F1F1F]/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#0C0C0C]/60 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left mb-12">
        {/* Section Heading & Controls Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
          <div className="space-y-3 text-left">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A1A1AA] text-left">
              <span className="w-4 h-0.5 bg-[#71717A]" />
              <span>05 // SOCIAL PROOF & VERIFIED LEDGER</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white uppercase leading-[0.95] text-left">
              PEER & CLIENT <br />
              <span className="font-light text-transparent bg-clip-text bg-gradient-to-r from-white via-[#A1A1AA] to-white/70">
                ENDORSEMENTS.
              </span>
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-[#A1A1AA] max-w-xl font-normal leading-relaxed pt-1 text-left">
              Live automated feed of verified recommendations from engineering leads, founders, and technical collaborators.
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-3">
            <button
              id="btn-open-add-referral-modal"
              onClick={() => {
                playSound('click');
                setIsAddModalOpen(true);
              }}
              className="px-5 py-3 rounded-xl bg-white hover:bg-[#A1A1AA] text-[#000000] hover:font-bold text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-300 flex items-center gap-2 shadow-lg cursor-pointer hover:scale-105"
            >
              <PlusCircle className="w-4 h-4 text-[#000000]" />
              <span>Add Endorsement</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sideways Auto-Moving Testimonial Carousel Track */}
      <div className="relative w-full overflow-hidden py-4">
        {/* Left & Right Seamless Vignette Fade Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#000000] to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#000000] to-transparent z-20 pointer-events-none" />

        {/* Continuous Sideways Moving Marquee Strip */}
        <div className="animate-referrals-marquee flex items-stretch gap-6 px-4">
          {/* Set 1 */}
          {referrals.map((ref) => (
            <div
              key={`ref-1-${ref.id}`}
              id={`referral-card-${ref.id}`}
              onMouseEnter={() => playSound('hover')}
              className="w-[360px] sm:w-[440px] shrink-0 p-7 sm:p-8 rounded-3xl bg-[#0C0C0C]/85 backdrop-blur-xl border border-[#1F1F1F] hover:border-[#3F3F46] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_45px_0_rgba(0,0,0,0.9)] flex flex-col justify-between group text-left select-none cursor-default"
            >
              <div className="text-left space-y-4">
                {/* Card Header: Quote Icon, Verified Chip & Rating Stars */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#000000] border border-[#1F1F1F] group-hover:border-[#3F3F46] flex items-center justify-center text-white group-hover:scale-110 transition-all shadow-inner">
                    <Quote className="w-4 h-4 fill-current text-white" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5 text-amber-300">
                      {[...Array(ref.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current text-amber-300" />
                      ))}
                    </div>
                    {ref.verified && (
                      <span className="ml-1 text-[9px] uppercase tracking-wider font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Message Quote */}
                <p className="text-xs sm:text-sm text-[#A1A1AA] group-hover:text-white font-sans leading-relaxed italic font-normal text-left transition-colors line-clamp-4">
                  "{ref.message}"
                </p>
              </div>

              {/* Author Profile Footer */}
              <div className="pt-5 mt-6 border-t border-[#1F1F1F] flex items-center gap-3.5 text-left">
                <div className="w-11 h-11 rounded-full overflow-hidden border border-[#1F1F1F] group-hover:border-white transition-colors bg-[#000000] shrink-0 shadow-md">
                  <img
                    src={ref.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={ref.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-serif font-semibold text-base text-white tracking-tight uppercase truncate">
                      {ref.name}
                    </h3>
                    <ShieldCheck className="w-3.5 h-3.5 text-white shrink-0" />
                  </div>
                  <p className="text-xs text-[#A1A1AA] font-sans truncate">
                    {ref.role} • <span className="text-white font-medium">{ref.organization}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Set 2 (Duplicate for Seamless Infinite Loop) */}
          {referrals.map((ref) => (
            <div
              key={`ref-2-${ref.id}`}
              id={`referral-card-dup-${ref.id}`}
              onMouseEnter={() => playSound('hover')}
              className="w-[360px] sm:w-[440px] shrink-0 p-7 sm:p-8 rounded-3xl bg-[#0C0C0C]/85 backdrop-blur-xl border border-[#1F1F1F] hover:border-[#3F3F46] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_45px_0_rgba(0,0,0,0.9)] flex flex-col justify-between group text-left select-none cursor-default"
            >
              <div className="text-left space-y-4">
                {/* Card Header: Quote Icon, Verified Chip & Rating Stars */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#000000] border border-[#1F1F1F] group-hover:border-[#3F3F46] flex items-center justify-center text-white group-hover:scale-110 transition-all shadow-inner">
                    <Quote className="w-4 h-4 fill-current text-white" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5 text-amber-300">
                      {[...Array(ref.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current text-amber-300" />
                      ))}
                    </div>
                    {ref.verified && (
                      <span className="ml-1 text-[9px] uppercase tracking-wider font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Message Quote */}
                <p className="text-xs sm:text-sm text-[#A1A1AA] group-hover:text-white font-sans leading-relaxed italic font-normal text-left transition-colors line-clamp-4">
                  "{ref.message}"
                </p>
              </div>

              {/* Author Profile Footer */}
              <div className="pt-5 mt-6 border-t border-[#1F1F1F] flex items-center gap-3.5 text-left">
                <div className="w-11 h-11 rounded-full overflow-hidden border border-[#1F1F1F] group-hover:border-white transition-colors bg-[#000000] shrink-0 shadow-md">
                  <img
                    src={ref.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={ref.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-serif font-semibold text-base text-white tracking-tight uppercase truncate">
                      {ref.name}
                    </h3>
                    <ShieldCheck className="w-3.5 h-3.5 text-white shrink-0" />
                  </div>
                  <p className="text-xs text-[#A1A1AA] font-sans truncate">
                    {ref.role} • <span className="text-white font-medium">{ref.organization}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Recommendation Modal */}
      <AddReferralModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onReferralAdded={handleReferralAdded}
      />
    </section>
  );
};
