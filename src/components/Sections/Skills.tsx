import React from 'react';
import { Sparkles, Code2 } from 'lucide-react';
import { puzzleSkillsData, SkillItem } from '../../data/skills';
import { SkillIcon } from '../UI/SkillIcons';

/**
 * Redesigned public Skills section: four continuous horizontal marquee rows
 * that move in alternating directions (→, ←, →, ←) for a seamless, premium
 * technology showcase. Respects prefers-reduced-motion and pauses on hover.
 */

// Lookup helper so row definitions are robust to array reordering.
const byId = (id: string): SkillItem => {
  const found = puzzleSkillsData.find(s => s.id === id);
  if (!found) throw new Error(`Missing skill: ${id}`);
  return found;
};

// Distribute all available technologies across four balanced rows.
const ROWS: SkillItem[][] = [
  [byId('react'), byId('typescript'), byId('nextjs')],          // Row 1 →
  [byId('nodejs'), byId('expressjs'), byId('python')],          // Row 2 ←
  [byId('django'), byId('reactnative'), byId('flutter')],      // Row 3 →
  [byId('dart'), byId('mongodb'), byId('postgresql'), byId('git'), byId('devops')], // Row 4 ←
];

const ROW_DIRECTIONS: ('forward' | 'reverse')[] = ['forward', 'reverse', 'forward', 'reverse'];
const ROW_DURATIONS = [28, 34, 30, 38];

interface MarqueeRowProps {
  items: SkillItem[];
  direction: 'forward' | 'reverse';
  duration: number;
}

const MarqueeRow: React.FC<MarqueeRowProps> = ({ items, direction, duration }) => {
  // Duplicate the list twice so the -50% translation loops seamlessly.
  const doubled = [...items, ...items];
  return (
    <div className="marquee-track w-full py-3">
      <div
        className={`marquee-row marquee-row--${direction}`}
        style={{ ['--marquee-duration' as string]: `${duration}s` }}
      >
        {doubled.map((skill, i) => (
          <div
            key={`${skill.id}-${i}`}
            className="mx-3 flex items-center gap-3 px-5 sm:px-7 py-4 rounded-2xl bg-[#0C0C0C] border border-[#1F1F1F] shadow-sm hover:shadow-md hover:border-[#3F3F46] transition-all"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#18181B] text-white">
              <SkillIcon id={skill.id} className="w-6 h-6" />
            </span>
            <span className="text-sm font-semibold text-white whitespace-nowrap">
              {skill.shortName || skill.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Skills: React.FC = () => {
  return (
    <section
      id="skills"
      aria-label="Skills & Technologies"
      className="relative py-24 sm:py-32 overflow-hidden bg-[#000000] text-white font-sans border-t border-[#1F1F1F]"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 text-left">
          <div className="space-y-3 text-left">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#A1A1AA]">
              <Sparkles className="w-4 h-4" />
              TECHNOLOGIES
            </div>
            <h2 className="text-4xl sm:text-5xl font-semibold uppercase tracking-tight text-white">
              Skills
            </h2>
            <p className="text-sm sm:text-base text-[#A1A1AA] max-w-2xl">
              The technologies and tools I use to build modern, resilient software —
              a continuous showcase.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0C0C0C] border border-[#1F1F1F] text-xs font-semibold text-[#A1A1AA]">
            <Code2 className="w-4 h-4" />
            {puzzleSkillsData.length} technologies
          </div>
        </div>
      </div>

      {/* Four alternating marquee rows */}
      <div className="relative z-10">
        {ROWS.map((row, index) => (
          <MarqueeRow
            key={index}
            items={row}
            direction={ROW_DIRECTIONS[index]}
            duration={ROW_DURATIONS[index]}
          />
        ))}
      </div>
    </section>
  );
};

export default Skills;