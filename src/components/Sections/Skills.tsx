import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { puzzleSkillsData, SKILL_CLUSTERS, SkillCluster, SkillItem } from '../../data/skills';
import { PuzzlePiece } from '../UI/PuzzlePiece';
import { SkillIcon } from '../UI/SkillIcons';
import {
  RotateCcw,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  Info,
  Terminal,
} from 'lucide-react';

export const Skills: React.FC = () => {
  const { playSound } = useTheme();
  const sectionRef = useRef<HTMLElement>(null);

  const [isAssembled, setIsAssembled] = useState(false);
  const [activeCluster, setActiveCluster] = useState<SkillCluster | 'all'>('all');
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillItem>(puzzleSkillsData[0]);
  const [hasTriggeredOnce, setHasTriggeredOnce] = useState(false);
  const [isLockedPulse, setIsLockedPulse] = useState(false);

  // Trigger assembly on scroll into viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggeredOnce) {
          setIsAssembled(true);
          setHasTriggeredOnce(true);
          playSound('success');

          // Trigger locked pulse after spring animations complete
          setTimeout(() => {
            setIsLockedPulse(true);
            setTimeout(() => setIsLockedPulse(false), 1200);
          }, 1400);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasTriggeredOnce, playSound]);

  // Re-run assembly animation
  const handleReassemble = () => {
    playSound('pop');
    setIsAssembled(false);
    setTimeout(() => {
      setIsAssembled(true);
      playSound('success');
      setTimeout(() => {
        setIsLockedPulse(true);
        setTimeout(() => setIsLockedPulse(false), 1000);
      }, 1400);
    }, 200);
  };

  // Find currently hovered or selected item
  const activeHoveredItem = puzzleSkillsData.find(s => s.id === hoveredSkillId);
  const displayedSkill = activeHoveredItem || selectedSkill;

  // Determine connected neighbor skills for the active item
  const connectedIds = displayedSkill ? new Set(displayedSkill.connections) : new Set();

  return (
    <section
      ref={sectionRef}
      id="skills"
      aria-label="Skills & Capabilities"
      className="relative py-28 sm:py-36 bg-[#000000] text-white border-t border-[#1F1F1F] overflow-hidden text-left font-sans"
    >
      {/* Background Ambience & Lighting Gradients */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#1F1F1F]/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#B91C1C]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 sm:mb-16 gap-6 text-left">
          <div className="space-y-3 text-left">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A1A1AA] text-left">
              <span className="w-4 h-0.5 bg-[#B91C1C]" />
              <span>03 // INTERCONNECTED PUZZLE ARSENAL</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white uppercase leading-[0.95] text-left">
              INTERLOCKING <br />
              <span className="font-light text-transparent bg-clip-text bg-gradient-to-r from-white via-[#A1A1AA] to-white/70">
                SKILL PUZZLE.
              </span>
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-[#A1A1AA] max-w-2xl font-normal leading-relaxed pt-1 text-left">
              Every technology is a precision piece of the engineer. As you navigate into this section, individual capabilities smoothly lock together to form a cohesive, full-stack software development engine.
            </p>
          </div>

          {/* Action Controls & Assembly Status */}
          <div className="flex flex-wrap items-center gap-3 text-left shrink-0">
            {/* Assembly State Tag */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#0C0C0C] border border-[#1F1F1F] text-xs font-mono text-[#A1A1AA]">
              <span
                className={`w-2 h-2 rounded-full transition-colors ${
                  isAssembled ? 'bg-emerald-400 animate-pulse' : 'bg-[#B91C1C]'
                }`}
              />
              <span className="text-[11px]">
                {isAssembled ? 'SYSTEM: 14 PIECES LOCKED' : 'SYSTEM: DISPERSED'}
              </span>
            </div>

            {/* Reassemble Button */}
            <button
              id="btn-reassemble-puzzle"
              onClick={handleReassemble}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#18181B] hover:bg-white hover:text-black text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 border border-[#27272A] hover:border-white shadow-sm cursor-pointer active:scale-95"
              title="Re-trigger the physical puzzle merging animation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reassemble</span>
            </button>
          </div>
        </div>

        {/* Cluster Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8 pb-2 border-b border-[#1F1F1F]">
          {SKILL_CLUSTERS.map(cluster => {
            const isActive = activeCluster === cluster.id;
            return (
              <button
                key={cluster.id}
                id={`filter-cluster-${cluster.id}`}
                onClick={() => {
                  playSound('click');
                  setActiveCluster(cluster.id);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'bg-[#0C0C0C] text-[#A1A1AA] hover:text-white border border-[#1F1F1F] hover:border-[#3F3F46]'
                }`}
              >
                <span>{cluster.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-black text-white' : 'bg-[#18181B] text-[#71717A]'
                  }`}
                >
                  {cluster.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Connected Interlocking Puzzle Board */}
        <div
          id="puzzle-board-container"
          className={`relative p-4 sm:p-6 lg:p-8 rounded-3xl bg-[#070707] border border-[#1F1F1F] transition-all duration-700 ${
            isLockedPulse ? 'ring-2 ring-white/40 shadow-[0_0_50px_rgba(255,255,255,0.1)]' : 'shadow-[0_20px_60px_rgba(0,0,0,0.9)]'
          }`}
        >
          {/* Subtle Puzzle Grid Guide Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#1F1F1F_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none rounded-3xl" />

          {/* Puzzle Pieces Responsive Grid: 1 col (mobile), 2 cols (sm), 3 cols (md), 4-5 cols (lg/xl) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 relative z-10">
            {puzzleSkillsData.map((skill, index) => {
              const isHovered = hoveredSkillId === skill.id;
              const isSelected = selectedSkill?.id === skill.id;
              const isNeighborHovered = connectedIds.has(skill.id);
              const isFilteredOut = activeCluster !== 'all' && skill.cluster !== activeCluster;

              return (
                <PuzzlePiece
                  key={skill.id}
                  skill={skill}
                  index={index}
                  isAssembled={isAssembled}
                  isHovered={isHovered}
                  isSelected={isSelected}
                  isNeighborHovered={isNeighborHovered}
                  isFilteredOut={isFilteredOut}
                  onHover={id => {
                    if (id) playSound('hover');
                    setHoveredSkillId(id);
                  }}
                  onClick={clicked => {
                    playSound('click');
                    setSelectedSkill(clicked);
                  }}
                />
              );
            })}
          </div>

          {/* Locked Badge Bottom Indicator */}
          <div className="mt-8 pt-4 border-t border-[#1F1F1F] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#71717A]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#B91C1C]" />
              <span className="text-[#A1A1AA]">
                HOVER ANY PIECE TO INSPECT LINKAGES & ARCHITECTURAL CONNECTIONS
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>Selected</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#B91C1C]" />
                <span>Interlocked Neighbor</span>
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Puzzle Inspector Detail Panel */}
        {displayedSkill && (
          <motion.div
            id="puzzle-detail-inspector"
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-8 p-6 sm:p-8 rounded-3xl bg-[#0C0C0C]/95 border border-[#27272A] backdrop-blur-xl shadow-2xl relative overflow-hidden"
          >
            {/* Top Accent Line with skill color */}
            <div
              className="absolute top-0 left-0 right-0 h-1 transition-all duration-500"
              style={{
                background: `linear-gradient(to right, ${displayedSkill.color}, #B91C1C, transparent)`,
              }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Tech Identity & Specs */}
              <div className="lg:col-span-4 space-y-4 text-left border-b lg:border-b-0 lg:border-r border-[#1F1F1F] pb-6 lg:pb-0 lg:pr-6">
                <div className="flex items-center gap-3">
                  <div
                    className="p-3 rounded-2xl bg-[#000000] border border-[#27272A] flex items-center justify-center shadow-lg"
                    style={{ borderColor: displayedSkill.accentBorder }}
                  >
                    <SkillIcon id={displayedSkill.id} className="w-8 h-8" />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#B91C1C]">
                      {displayedSkill.clusterLabel}
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-white uppercase tracking-tight">
                      {displayedSkill.name}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div className="p-2.5 rounded-xl bg-[#000000] border border-[#1F1F1F]">
                    <span className="text-[10px] uppercase text-[#71717A] block">Proficiency</span>
                    <span className="text-white font-semibold">{displayedSkill.level}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#000000] border border-[#1F1F1F]">
                    <span className="text-[10px] uppercase text-[#71717A] block">Production Tenure</span>
                    <span className="text-white font-semibold">{displayedSkill.experience}</span>
                  </div>
                </div>
              </div>

              {/* Middle Column: What I Use It For & Strengths */}
              <div className="lg:col-span-5 space-y-4 text-left">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                    <Terminal className="w-3.5 h-3.5 text-white" />
                    <span>Production Application & Use Case</span>
                  </div>
                  <p className="text-xs sm:text-sm text-white font-sans font-normal leading-relaxed">
                    {displayedSkill.useCase}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] block">
                    Core Technical Strengths
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {displayedSkill.strengths.map((str, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#000000] border border-[#1F1F1F] text-xs text-[#E4E4E7]"
                      >
                        <CheckCircle2 className="w-3 h-3 text-[#B91C1C]" />
                        <span>{str}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Interlocked Dependencies */}
              <div className="lg:col-span-3 space-y-3 text-left border-t lg:border-t-0 lg:border-l border-[#1F1F1F] pt-6 lg:pt-0 lg:pl-6">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                  <LinkIcon className="w-3.5 h-3.5 text-[#B91C1C]" />
                  <span>Interlocked With</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {displayedSkill.connections.map(connId => {
                    const connSkill = puzzleSkillsData.find(s => s.id === connId);
                    if (!connSkill) return null;

                    return (
                      <button
                        key={connId}
                        onClick={() => {
                          playSound('click');
                          setSelectedSkill(connSkill);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#000000] hover:bg-[#18181B] border border-[#1F1F1F] hover:border-white text-xs text-white transition-all cursor-pointer"
                        title={`Focus on ${connSkill.name}`}
                      >
                        <SkillIcon id={connSkill.id} className="w-3.5 h-3.5" />
                        <span>{connSkill.shortName}</span>
                      </button>
                    );
                  })}
                </div>

                <p className="text-[10px] text-[#71717A] leading-normal pt-1">
                  Click any connected piece to traverse the development dependency graph.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Philosophy & Architecture Highlights Banner */}
        <div className="mt-12 p-8 rounded-3xl bg-[#0C0C0C]/85 border border-[#1F1F1F] backdrop-blur-xl grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-white" />
              <p className="text-xs font-bold uppercase tracking-widest text-[#71717A]">
                PERFORMANCE STANDARD
              </p>
            </div>
            <h4 className="text-lg font-serif font-bold text-white uppercase">
              60 FPS & Sub-100ms TTFB
            </h4>
            <p className="text-xs text-[#A1A1AA] font-sans leading-relaxed">
              Optimized tree-shaking, code splitting, edge middleware caching, and multi-region low-latency databases.
            </p>
          </div>

          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#B91C1C]" />
              <p className="text-xs font-bold uppercase tracking-widest text-[#71717A]">
                TYPE INTEGRITY
              </p>
            </div>
            <h4 className="text-lg font-serif font-bold text-white uppercase">
              End-to-End Type Safety
            </h4>
            <p className="text-xs text-[#A1A1AA] font-sans leading-relaxed">
              Zod runtime validation schemas paired with strict TypeScript compiler pipelines for zero runtime exceptions.
            </p>
          </div>

          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-white" />
              <p className="text-xs font-bold uppercase tracking-widest text-[#71717A]">
                PHILOSOPHY
              </p>
            </div>
            <h4 className="text-lg font-serif font-bold text-white uppercase">
              The Complete Engineer
            </h4>
            <p className="text-xs text-[#A1A1AA] font-sans leading-relaxed">
              "Every technology is a piece of the developer, and together they create the complete software engineer."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
