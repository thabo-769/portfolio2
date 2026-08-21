import React from 'react';
import { Code2, Smartphone, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import thaboPortrait from '../../assets/images/thabo_portrait_1787138003397.jpg';

interface AboutProps {
  onOpenResume?: () => void;
}

export const About: React.FC<AboutProps> = () => {
  const { playSound } = useTheme();

  return (
    <section
      id="about"
      aria-label="About section"
      className="relative py-28 sm:py-36 bg-[#000000] text-white border-t border-[#1F1F1F] overflow-hidden text-left"
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#1F1F1F]/20 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center text-left">
          
          {/* Left Column: All Text & Information */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Section Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0C0C0C] border border-[#1F1F1F] text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A1A1AA] text-left">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>02 // WHAT I'M ALL ABOUT</span>
            </div>

            {/* Section Heading */}
            <div className="space-y-2 text-left">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white uppercase text-left leading-[1.05]">
                SIMPLY ABOUT ME
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-[#A1A1AA] font-normal leading-relaxed text-left">
                Hi, I'm <span className="text-white font-semibold">Thabo Tshabangu</span> — a software developer with 3+ years of experience engineering fast web applications, interactive 3D WebGL scenes, and cross-platform mobile products.
              </p>
            </div>

            {/* Core Craft Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1 text-left">
              <div className="p-4 rounded-2xl bg-[#0C0C0C]/85 border border-[#1F1F1F] hover:border-[#3F3F46] transition-all space-y-1.5 text-left">
                <div className="flex items-center gap-2 text-left">
                  <div className="p-1.5 rounded-lg bg-[#000000] border border-[#1F1F1F] text-white">
                    <Code2 className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Full-Stack Web
                  </h4>
                </div>
                <p className="text-[11px] text-[#A1A1AA] leading-relaxed text-left">
                  Modern React, TypeScript, and Node.js built for speed and resilience.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0C0C0C]/85 border border-[#1F1F1F] hover:border-[#3F3F46] transition-all space-y-1.5 text-left">
                <div className="flex items-center gap-2 text-left">
                  <div className="p-1.5 rounded-lg bg-[#000000] border border-[#1F1F1F] text-white">
                    <Smartphone className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    3D & Mobile
                  </h4>
                </div>
                <p className="text-[11px] text-[#A1A1AA] leading-relaxed text-left">
                  Interactive Three.js graphics and native-grade React Native apps.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0C0C0C]/85 border border-[#1F1F1F] hover:border-[#3F3F46] transition-all space-y-1.5 text-left">
                <div className="flex items-center gap-2 text-left">
                  <div className="p-1.5 rounded-lg bg-[#000000] border border-[#1F1F1F] text-white">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Clean Execution
                  </h4>
                </div>
                <p className="text-[11px] text-[#A1A1AA] leading-relaxed text-left">
                  Writing maintainable, type-safe code that delivers results effortlessly.
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Picture of Thabo */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end text-left">
            <div 
              onMouseEnter={() => playSound('hover')}
              className="group relative w-full max-w-sm rounded-3xl p-3 bg-[#0C0C0C]/90 border border-[#1F1F1F] hover:border-[#3F3F46] shadow-[0_0_50px_rgba(0,0,0,0.9)] transition-all duration-500 hover:scale-[1.02] text-left"
            >
              {/* Subtle top highlight */}
              <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

              {/* Portrait Frame */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#18181B] text-left">
                <img
                  src={thaboPortrait}
                  alt="Thabo Tshabangu - Software Developer"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
