import React from 'react';
import { Code2, Smartphone, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { usePortfolioCms } from '../../context/PortfolioCmsContext';
import thaboPortrait from '../../assets/images/thabo_portrait.jpg';

interface AboutProps {
  onOpenResume?: () => void;
}

export const About: React.FC<AboutProps> = () => {
  const { playSound } = useTheme();
  const { content } = usePortfolioCms();

  return (
    <section
      id="about"
      aria-label="About section"
      className="relative overflow-hidden border-t border-white/10 bg-[#000000] py-28 text-left text-white sm:py-36"
    >
      <div className="pointer-events-none absolute right-1/4 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-white/5 blur-[180px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 text-left sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 text-left lg:grid-cols-12 lg:gap-14">
          <div className="space-y-6 text-left lg:col-span-7">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold uppercase leading-[1.05] tracking-tight text-white sm:text-4xl md:text-5xl">
                About
              </h2>
              <p className="max-w-3xl text-sm leading-relaxed text-[#A1A1AA] sm:text-base">
                {content.about.description}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3.5 pt-1 text-left sm:grid-cols-3">
              <HighlightCard
                icon={<Code2 className="h-3.5 w-3.5" />}
                title="Full-stack web"
                body={content.about.introduction}
              />
              <HighlightCard
                icon={<Smartphone className="h-3.5 w-3.5" />}
                title="3D and mobile"
                body="Interactive Three.js graphics and high-performance mobile products."
              />
              <HighlightCard
                icon={<Sparkles className="h-3.5 w-3.5" />}
                title="Clean execution"
                body={content.about.otherInfo}
              />
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0C0C0C]/85 p-5 text-sm leading-relaxed text-zinc-300">
              {content.about.biography}
            </div>
          </div>

          <div className="flex justify-center lg:col-span-5 lg:justify-end">
            <div
              onMouseEnter={() => playSound('hover')}
              className="group relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#0C0C0C]/90 p-3 shadow-[0_0_50px_rgba(0,0,0,0.9)] transition-all duration-500 hover:scale-[1.02]"
            >
              <div className="absolute left-10 right-10 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#18181B]">
                <img
                  src={thaboPortrait}
                  alt={content.portfolioName}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

function HighlightCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="space-y-1.5 rounded-2xl border border-white/10 bg-[#0C0C0C]/85 p-4 transition-all hover:border-white/20">
      <div className="flex items-center gap-2">
        <div className="rounded-lg border border-white/10 bg-black p-1.5 text-white">{icon}</div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-white">{title}</h4>
      </div>
      <p className="text-[11px] leading-relaxed text-[#A1A1AA]">{body}</p>
    </div>
  );
}

export default About;
