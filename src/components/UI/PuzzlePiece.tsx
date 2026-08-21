import React from 'react';
import { motion } from 'framer-motion';
import { SkillItem } from '../../data/skills';
import { SkillIcon } from './SkillIcons';
import { Sparkles, CheckCircle2, Layers, Link as LinkIcon } from 'lucide-react';

interface PuzzlePieceProps {
  skill: SkillItem;
  index: number;
  isAssembled: boolean;
  isHovered: boolean;
  isSelected: boolean;
  isNeighborHovered: boolean;
  isFilteredOut: boolean;
  onHover: (id: string | null) => void;
  onClick: (skill: SkillItem) => void;
}

export const PuzzlePiece: React.FC<PuzzlePieceProps> = ({
  skill,
  index,
  isAssembled,
  isHovered,
  isSelected,
  isNeighborHovered,
  isFilteredOut,
  onHover,
  onClick,
}) => {
  // Edge connector renderers
  const renderTopEdge = () => {
    if (skill.edges.top === 'tab') {
      return (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-3 rounded-t-full bg-[#0C0C0C] border-t border-x border-[#27272A] z-10 shadow-sm" />
      );
    }
    if (skill.edges.top === 'socket') {
      return (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-2 rounded-b-full bg-[#000000] border-b border-x border-[#1F1F1F] z-10 shadow-inner" />
      );
    }
    return null;
  };

  const renderBottomEdge = () => {
    if (skill.edges.bottom === 'tab') {
      return (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-3 rounded-b-full bg-[#0C0C0C] border-b border-x border-[#27272A] z-10 shadow-sm" />
      );
    }
    if (skill.edges.bottom === 'socket') {
      return (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-2 rounded-t-full bg-[#000000] border-t border-x border-[#1F1F1F] z-10 shadow-inner" />
      );
    }
    return null;
  };

  const renderRightEdge = () => {
    if (skill.edges.right === 'tab') {
      return (
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-6 rounded-r-full bg-[#0C0C0C] border-r border-y border-[#27272A] z-10 shadow-sm" />
      );
    }
    if (skill.edges.right === 'socket') {
      return (
        <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-5 rounded-l-full bg-[#000000] border-l border-y border-[#1F1F1F] z-10 shadow-inner" />
      );
    }
    return null;
  };

  const renderLeftEdge = () => {
    if (skill.edges.left === 'tab') {
      return (
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-6 rounded-l-full bg-[#0C0C0C] border-l border-y border-[#27272A] z-10 shadow-sm" />
      );
    }
    if (skill.edges.left === 'socket') {
      return (
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-5 rounded-r-full bg-[#000000] border-r border-y border-[#1F1F1F] z-10 shadow-inner" />
      );
    }
    return null;
  };

  return (
    <motion.div
      id={`puzzle-piece-${skill.id}`}
      layout
      initial={{
        x: skill.scatter.x * 1.5,
        y: skill.scatter.y * 1.5,
        rotate: skill.scatter.rotate * 1.6,
        scale: 0.88,
        opacity: 0,
      }}
      animate={
        isAssembled
          ? {
              x: 0,
              y: 0,
              rotate: 0,
              scale: isHovered || isSelected ? 1.04 : isNeighborHovered ? 1.01 : 1,
              opacity: isFilteredOut ? 0.25 : 1,
            }
          : {
              x: skill.scatter.x * 1.5,
              y: skill.scatter.y * 1.5,
              rotate: skill.scatter.rotate * 1.6,
              scale: 0.88,
              opacity: 0.3,
            }
      }
      transition={{
        type: 'spring',
        stiffness: 65,
        damping: 15,
        mass: 1.1,
        delay: isAssembled ? (index % 6) * 0.08 : 0,
      }}
      whileHover={{
        y: -6,
        transition: { duration: 0.2 },
      }}
      onMouseEnter={() => onHover(skill.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(skill)}
      className={`relative select-none cursor-pointer rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-colors duration-300 text-left ${
        isHovered || isSelected
          ? 'z-30 bg-[#161618] border border-white/80 shadow-[0_0_30px_rgba(255,255,255,0.15)] ring-1 ring-[#B91C1C]/40'
          : isNeighborHovered
          ? 'z-20 bg-[#121214] border border-[#B91C1C]/60 shadow-[0_0_20px_rgba(185,28,28,0.2)]'
          : 'z-10 bg-[#0C0C0C]/90 border border-[#1F1F1F] hover:border-[#3F3F46] shadow-[0_10px_25px_rgba(0,0,0,0.8)]'
      }`}
      style={{
        minHeight: '175px',
      }}
    >
      {/* Physical Puzzle Interlocking Tabs */}
      {renderTopEdge()}
      {renderBottomEdge()}
      {renderRightEdge()}
      {renderLeftEdge()}

      {/* Subtle Corner Notch Indicator */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div
            className="p-2 rounded-xl bg-[#000000] border border-[#1F1F1F] flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner"
            style={{ borderColor: isHovered ? skill.accentBorder : '#1F1F1F' }}
          >
            <SkillIcon id={skill.id} className="w-5 h-5" />
          </div>

          <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A]">
            0{index + 1}
          </span>
        </div>

        {/* Level Tag & Red Accent Dot if Hovered */}
        <div className="flex items-center gap-1.5">
          {isNeighborHovered && (
            <span className="inline-flex items-center gap-1 text-[9px] font-mono text-[#B91C1C] bg-[#B91C1C]/10 border border-[#B91C1C]/30 px-1.5 py-0.5 rounded">
              <LinkIcon className="w-2.5 h-2.5" />
              <span>LINKED</span>
            </span>
          )}

          <span
            className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border transition-all"
            style={{
              backgroundColor: isHovered ? '#FFFFFF' : '#000000',
              color: isHovered ? '#000000' : '#A1A1AA',
              borderColor: isHovered ? '#FFFFFF' : '#1F1F1F',
            }}
          >
            {skill.level}
          </span>
        </div>
      </div>

      {/* Skill Info */}
      <div className="space-y-1.5 my-auto text-left">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-serif font-bold text-base sm:text-lg text-white uppercase tracking-tight group-hover:text-white transition-colors">
            {skill.name}
          </h3>
        </div>

        <p className="text-[11px] text-[#A1A1AA] font-sans font-normal line-clamp-2 leading-relaxed">
          {skill.useCase}
        </p>
      </div>

      {/* Footer: Experience & Interlock Status */}
      <div className="pt-3 mt-3 border-t border-[#1F1F1F] flex items-center justify-between text-left">
        <span className="text-[10px] font-mono text-[#71717A] tracking-wider uppercase">
          {skill.experience}
        </span>

        {/* Puzzle Interlocking Seam Icon */}
        <div className="flex items-center gap-1">
          <span
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{
              backgroundColor: isHovered ? '#B91C1C' : isAssembled ? '#22C55E' : '#71717A',
            }}
          />
          <span className="text-[9px] font-mono text-[#71717A] uppercase">
            {isHovered ? 'INTERLOCKED' : isAssembled ? 'SNAPPED' : 'SCATTERED'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
