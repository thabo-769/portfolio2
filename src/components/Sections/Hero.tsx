import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, FileText } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Hero3DCanvas } from '../3D/Hero3DCanvas';
import { WeatherCanvas } from '../UI/WeatherCanvas';
import { useTheme } from '../../context/ThemeContext';
import { usePortfolioCms } from '../../context/PortfolioCmsContext';

interface HeroProps {
  onOpenResume: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenResume }) => {
  const { playSound } = useTheme();
  const { content, settings } = usePortfolioCms();
  const navigate = useNavigate();
  const displayHeadline = content.home.headline.includes('\n')
    ? content.home.headline
    : content.home.headline.replace(/\s+/, '\n');
  const headlineCharacters = Array.from(displayHeadline);
  const surnameStart = displayHeadline.indexOf('\n') + 1;
  const [revealedCount, setRevealedCount] = useState(headlineCharacters.length);
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    setRevealedCount(headlineCharacters.length);
    setIsHiding(false);
  }, [headlineCharacters.length]);

  useEffect(() => {
    const isHidden = revealedCount === 0;
    const isFullyVisible = revealedCount === headlineCharacters.length;
    const delay = isHidden ? 800 : isFullyVisible && !isHiding ? 4000 : 130;

    const timer = window.setTimeout(() => {
      setRevealedCount(current => {
        if (isHiding) {
          if (current > 0) return current - 1;
          setIsHiding(false);
          return current;
        }
        if (current < headlineCharacters.length) return current + 1;
        setIsHiding(true);
        return current;
      });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [headlineCharacters.length, isHiding, revealedCount]);
  const heroRef = useRef<HTMLElement>(null);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { damping: 28, stiffness: 100, mass: 0.6 });
  const smoothMouseY = useSpring(mouseY, { damping: 28, stiffness: 100, mass: 0.6 });
  const headingX = useTransform(smoothMouseX, [-1, 1], [-10, 10]);
  const headingY = useTransform(smoothMouseY, [-1, 1], [-6, 6]);
  const canvasTranslateX = useTransform(smoothMouseX, [-1, 1], [15, -15]);
  const canvasTranslateY = useTransform(smoothMouseY, [-1, 1], [10, -10]);
  const canvasRotateY = useTransform(smoothMouseX, [-1, 1], [-4, 4]);
  const canvasRotateX = useTransform(smoothMouseY, [-1, 1], [3, -3]);

  const handleNameTap = () => {
    playSound('pop');
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      navigate('/admin');
      return;
    }
    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 2000);
  };

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
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - navOffset, behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={heroRef}
      id="home"
      aria-label="Hero section"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-[#000000] px-0 pt-28 pb-16 text-left text-white sm:pt-36"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden"
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

      <WeatherCanvas />
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-[#000000]/70 via-transparent to-[#000000]" />

      <div className="relative z-20 mx-auto my-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div style={{ x: headingX, y: headingY }} className="max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0C0C0C]/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            <span>{settings.availabilityStatus}</span>
          </div>

          <div className="space-y-4">
            <h1
              aria-label={content.home.headline}
              onClick={handleNameTap}
              className="max-w-5xl cursor-pointer text-4xl font-bold uppercase tracking-tight text-white leading-[0.88] sm:text-5xl md:text-6xl lg:text-7xl"
            >
              {headlineCharacters.map((character, index) =>
                character === '\n' ? (
                  <br key={`break-${index}`} />
                ) : (
                  <span
                    key={`${character}-${index}`}
                    aria-hidden="true"
                    className={`name-letter ${index >= surnameStart ? 'surname-glow' : ''}`}
                    style={{ opacity: index < revealedCount ? 1 : 0 }}
                  >
                    {character}
                  </span>
                )
              )}
            </h1>

            <p className="text-lg font-medium uppercase tracking-tight text-zinc-400 sm:text-xl md:text-2xl">
              {content.home.subtitle}
            </p>
          </div>

          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            {content.home.introduction}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => scrollTo('projects')}
              className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_24px_rgba(255,255,255,0.2)] transition-all duration-300 hover:scale-105 hover:bg-zinc-100 active:scale-95"
            >
              <span>{content.home.ctaText || 'Explore Projects'}</span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>

            <button
              onClick={() => {
                playSound('click');
                onOpenResume();
              }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0C0C0C]/90 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-[#18181B]"
            >
              <FileText className="h-4 w-4 text-zinc-400" />
              Resume / CV
            </button>

            <button
              onClick={() => scrollTo('contact')}
              className="ml-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-400 transition-colors hover:text-white"
            >
              <span>Let's Talk</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
