import React, { useState } from 'react';
import { usePortfolioCms } from '../../context/PortfolioCmsContext';

const logoSlugs: Record<string, string> = {
  react: 'react',
  typescript: 'typescript',
  node: 'nodedotjs',
  'node.js': 'nodedotjs',
  three: 'threedotjs',
  'three.js': 'threedotjs',
  javascript: 'javascript',
  next: 'nextdotjs',
  'next.js': 'nextdotjs',
  firebase: 'firebase',
  supabase: 'supabase',
  python: 'python',
  figma: 'figma',
  git: 'git',
  github: 'github',
};

const logoColors: Record<string, string> = {
  react: '61DAFB',
  typescript: '3178C6',
  nodedotjs: '5FA04E',
  threedotjs: 'FFFFFF',
  javascript: 'F7DF1E',
  nextdotjs: 'FFFFFF',
  firebase: 'FFCA28',
  supabase: '3FCF8E',
  python: '3776AB',
  figma: 'F24E1E',
  git: 'F05032',
  github: 'FFFFFF',
};

const getLogoSlug = (skill: { name: string; iconName?: string }) => {
  const identifier = (skill.iconName || skill.name).trim().toLowerCase();
  return logoSlugs[identifier] || logoSlugs[skill.name.trim().toLowerCase()];
};

const SkillLogo: React.FC<{ name: string; iconName?: string }> = ({ name, iconName }) => {
  const [hasImageError, setHasImageError] = useState(false);
  const slug = getLogoSlug({ name, iconName });
  const initials = (iconName || name)
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .slice(0, 2);

  if (!slug || hasImageError) {
    return <span>{initials}</span>;
  }

  return (
    <img
      src={`https://cdn.simpleicons.org/${slug}/${logoColors[slug] || 'FFFFFF'}`}
      alt=""
      className="h-5 w-5 object-contain"
      loading="lazy"
      onError={() => setHasImageError(true)}
    />
  );
};

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
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-[9px] font-bold uppercase tracking-[0.12em] text-white">
            <SkillLogo name={skill.name} iconName={skill.iconName} />
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
