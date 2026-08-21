import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, FileText } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Hero3DCanvas } from '../3D/Hero3DCanvas';
import { WeatherCanvas } from '../UI/WeatherCanvas';
import { useTheme } from '../../context/ThemeContext';

interface HeroProps {
  onOpenResume: () => void;
}

const FULL_FIRST = 'THABO';
const FULL_LAST = 'TSHABANGU';
const FULL_NAME = `${FULL_FIRST} ${FULL_LAST}`;

export const Hero: React.FC<HeroProps> = ({ onOpenResume }) => {
  const { playSound } = useTheme();
  const heroRef = useRef<HTMLElement>(null);

  // Letter-by-letter appearing and disappearing typewriter state loop
  const [charIndex, setCharIndex] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!isDeleting && charIndex < FULL_NAME.length) {
      // Appearing letter by letter
      timeout = setTimeout(() => {
        setCharIndex(prev => prev + 1);
      }, 115);
    } else if (!isDeleting && charIndex === FULL_NAME.length) {
      // Reached full name -> stay visible for 2.4s before disappearing
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 2400);
    } else if (isDeleting && charIndex > 0) {
      // Disappearing letter by letter
      timeout = setTimeout(() => {
        setCharIndex(prev => prev - 1);
      }, 45);
    } else if (isDeleting && charIndex === 0) {
      // Fully disappeared -> short pause then start appearing again
      timeout = setTimeout(() => {
        setIsDeleting(false);
      }, 600);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting]);

  // Framer Motion Spring & Mouse Parallax System
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 28, stiffness: 100, mass: 0.6 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Typography Parallax Shift
  const headingX = useTransform(smoothMouseX, [-1, 1], [-10, 10]);
  const headingY = useTransform(smoothMouseY, [-1, 1], [-6, 6]);

  // 3D Canvas Layer Tilt & Subtle Displacement
  const canvasTranslateX = useTransform(smoothMouseX, [-1, 1], [15, -15]);
  const canvasTranslateY = useTransform(smoothMouseY, [-1, 1], [10, -10]);
  const canvasRotateY = useTransform(smoothMouseX, [-1, 1], [-4, 4]);
  const canvasRotateX = useTransform(smoothMouseY, [-1, 1], [3, -3]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const scrollTo = (id: string) => {
    playSound('click');
    const el = document.getElementById(id);
    if (el) {
      const navOffset = 80;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - navOffset,
        behavior: 'smooth'
      });
    }
  };

  // Derive visible characters for First and Last name lines
  const displayedFirst = charIndex <= 5 ? FULL_FIRST.slice(0, charIndex) : FULL_FIRST;
  const isTypingFirstLine = charIndex <= 5;
  const displayedLast = charIndex > 6 ? FULL_LAST.slice(0, charIndex - 6) : '';
  const remainingLast = charIndex > 6 ? FULL_LAST.slice(charIndex - 6) : FULL_LAST;

  return (
    <section
      ref={heroRef}
      id="home"
      aria-label="Hero section"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen flex flex-col justify-between pt-28 sm:pt-36 pb-16 overflow-hidden bg-[#000000] text-white text-left select-none"
    >
      {/* 3D Interactive Floating Small Cubes Ensemble with Framer Motion Parallax */}
      <motion.div
        className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
        style={{
          x: canvasTranslateX,
          y: canvasTranslateY,
          rotateX: canvasRotateX,
          rotateY: canvasRotateY,
          perspective: 1200,
        }}
      >
        <Hero3DCanvas />
      </motion.div>

      {/* Atmospheric Ambient Snowfall Simulation */}
      <WeatherCanvas />

      {/* Atmospheric Pure Black Vignette Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#000000]/70 via-transparent to-[#000000] pointer-events-none z-10" />

      {/* Main Content Container with Motion Parallax Drift */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full text-left my-auto">
        <motion.div
          style={{ x: headingX, y: headingY }}
          className="max-w-3xl space-y-5 text-left"
        >
          {/* Typewriter Headline in Poppins (slightly refined font size) */}
          <div className="space-y-1 text-left min-h-[110px] sm:min-h-[140px] md:min-h-[180px] lg:min-h-[210px] flex flex-col justify-center">
            <h1 
              aria-label="Thabo Tshabangu"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white uppercase leading-[0.95] text-left"
            >
              {/* Line 1: First Name */}
              <span className="inline-block relative">
                {displayedFirst}
                {isTypingFirstLine && (
                  <span 
                    aria-hidden="true" 
                    className="inline-block w-[3px] sm:w-[5px] md:w-[6px] h-[0.75em] bg-white ml-1.5 align-baseline animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]" 
                  />
                )}
                {displayedFirst.length === 0 && (
                  <span className="opacity-0 select-none pointer-events-none">T</span>
                )}
              </span>
              
              <br />

              {/* Line 2: Last Name */}
              <span className="inline-block font-light text-transparent bg-clip-text bg-gradient-to-r from-white via-[#A1A1AA] to-white/70 relative">
                {displayedLast}
                {!isTypingFirstLine && (
                  <span 
                    aria-hidden="true" 
                    className="inline-block w-[3px] sm:w-[5px] md:w-[6px] h-[0.75em] bg-white ml-1.5 align-baseline animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)] text-white" 
                  />
                )}
                <span className="opacity-0 select-none pointer-events-none">
                  {remainingLast}
                </span>
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-[#A1A1AA] font-medium tracking-tight uppercase pt-1 text-left">
              SOFTWARE DEVELOPER
            </p>
          </div>

          {/* Narrative Summary */}
          <p className="text-xs sm:text-sm md:text-base text-[#A1A1AA] font-normal leading-relaxed max-w-xl text-left">
            Engineering resilient full-stack systems, spatial 3D WebGL interfaces, and high-performance mobile applications with strategic architectural rigor.
          </p>

          {/* Action Buttons Bar */}
          <div className="pt-3 flex flex-wrap items-center gap-3 text-left">
            <button
              id="btn-hero-projects"
              onClick={() => scrollTo('projects')}
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-[#A1A1AA] text-[#000000] text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_0_24px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Explore Projects</span>
              <ArrowUpRight className="w-4 h-4 text-[#000000] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            <button
              id="btn-hero-resume"
              onClick={() => {
                playSound('click');
                onOpenResume();
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#0C0C0C]/90 hover:bg-[#18181B] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider border border-[#1F1F1F] hover:border-[#3F3F46] transition-all duration-300 backdrop-blur-md cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#A1A1AA]" />
              <span>Resume / CV</span>
            </button>

            <button
              id="btn-hero-contact"
              onClick={() => scrollTo('contact')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold uppercase tracking-widest text-[#A1A1AA] hover:text-white transition-colors cursor-pointer ml-1"
            >
              <span>Let's Talk</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </motion.div>
      </div>
    </section>
  );
};
