import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface SkillsSectionProps {
  skillCount: number;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ skillCount }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111827]">Skills</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Your technologies are showcased publicly in four moving marquee rows.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#DCFCE7] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-[#F0FDF4] text-[#16A34A]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#111827]">Active Skills</h2>
            <p className="text-xs text-[#6B7280]">
              {skillCount} technologies displayed in the Skills section.
            </p>
          </div>
        </div>

        <p className="text-sm text-[#374151] leading-relaxed">
          The public Skills section uses a seamless marquee with four horizontal rows that move in
          alternating directions. This dashboard currently displays the technologies defined in your
          portfolio's skill data. Row order and direction are managed on the public section — no
          separate data entry is needed here.
        </p>

        <div className="mt-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] text-sm text-[#15803D]">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            To change which technologies appear, update the skill definitions in the codebase
            ({'src/data/skills.ts'}). The marquee rows derive from that list.
          </span>
        </div>
      </div>
    </div>
  );
};

export default SkillsSection;