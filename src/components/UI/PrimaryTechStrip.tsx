import React from 'react';
import { usePortfolioCms } from '../../context/PortfolioCmsContext';

export const PrimaryTechStrip: React.FC = () => {
  const { skills } = usePortfolioCms();

  const items = [...skills].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  const renderItems = (prefix: string) => (
    <>
      {items.map((skill, index) => (
        <div
          key={`${prefix}-${skill.id}-${index}`}
          className="flex shrink-0 items-center gap-3 px-6 py-2 text-zinc-300 transition-colors hover:text-white sm:px-9"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
            {(skill.iconName || skill.name)
              .split(' ')
              .map(part => part.charAt(0))
              .join('')
              .slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white whitespace-nowrap sm:text-xs">
              {skill.name}
            </p>
            <p className="text-[9px] uppercase tracking-[0.18em] text-zinc-500 whitespace-nowrap sm:text-[10px]">
              {skill.category}
            </p>
          </div>
        </div>
      ))}
    </>
  );

  return (
    <div
      id="tech-marquee"
      className="relative w-full select-none overflow-hidden border-y border-white/10 bg-[#050505]"
      aria-label="Moving technology strip"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#050505] to-transparent sm:w-28" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#050505] to-transparent sm:w-28" />

      <div className="marquee-track border-b border-white/10 py-3">
        <div className="marquee-row marquee-row--forward" style={{ '--marquee-duration': '36s' } as React.CSSProperties}>
          {renderItems('forward-1')}
          {renderItems('forward-2')}
        </div>
      </div>

      <div className="marquee-track py-3">
        <div className="marquee-row marquee-row--reverse" style={{ '--marquee-duration': '42s' } as React.CSSProperties}>
          {renderItems('reverse-1')}
          {renderItems('reverse-2')}
        </div>
      </div>

      <div className="marquee-track border-t border-white/10 py-3">
        <div className="marquee-row marquee-row--forward" style={{ '--marquee-duration': '48s' } as React.CSSProperties}>
          {renderItems('forward-3')}
          {renderItems('forward-4')}
        </div>
      </div>
    </div>
  );
};

export default PrimaryTechStrip;
