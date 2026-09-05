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
          className="flex shrink-0 items-center gap-2 px-5 py-2 text-zinc-300 transition-colors hover:text-white sm:px-8"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-[9px] font-bold uppercase tracking-[0.12em] text-white">
            {(skill.iconName || skill.name)
              .split(' ')
              .map(part => part.charAt(0))
              .join('')
              .slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white whitespace-nowrap sm:text-[11px]">
              {skill.name}
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

      <div className="marquee-track py-2">
        <div className="marquee-row marquee-row--reverse" style={{ '--marquee-duration': '38s' } as React.CSSProperties}>
          {renderItems('tech-1')}
          {renderItems('tech-2')}
        </div>
      </div>
    </div>
  );
};

export default PrimaryTechStrip;
