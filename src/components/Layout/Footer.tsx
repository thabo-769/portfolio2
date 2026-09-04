import React from 'react';
import { ArrowUp, Github, Linkedin, Mail, Terminal, Box } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { usePortfolioCms } from '../../context/PortfolioCmsContext';

export const Footer: React.FC = () => {
  const { playSound } = useTheme();
  const { content, settings } = usePortfolioCms();

  const scrollToTop = () => {
    playSound('pop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Projects' },
    { id: 'referrals', label: 'Referrals' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <footer
      id="main-footer"
      className="relative overflow-hidden border-t border-white/10 bg-[#000000] pb-12 pt-16 text-left text-zinc-400"
      role="contentinfo"
    >
      <div className="pointer-events-none absolute left-10 top-0 h-24 w-96 bg-white/5 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 text-left sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-12 text-left md:grid-cols-12">
          <div className="space-y-4 text-left md:col-span-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#0C0C0C] shadow-lg">
                <Box className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold tracking-tight text-white uppercase">{content.portfolioName}</h3>
                <p className="text-xs uppercase tracking-[0.2em] text-[#A1A1AA] font-semibold">
                  {content.home.subtitle}
                </p>
              </div>
            </div>

            <p className="max-w-sm text-sm leading-relaxed text-[#A1A1AA]">
              {content.about.introduction}
            </p>

            <div className="flex items-center gap-2 text-left text-xs text-[#71717A]">
              <Terminal className="h-3.5 w-3.5 text-white" />
              <span>{settings.availabilityStatus}</span>
            </div>
          </div>

          <div className="space-y-3 text-left md:col-span-3">
            <h4 className="text-xs uppercase tracking-[0.2em] text-white font-semibold">Navigation</h4>
            <ul className="space-y-2 text-sm">
              {navLinks.map(link => (
                <li key={link.id}>
                  <button
                    onClick={() => {
                      playSound('click');
                      const el = document.getElementById(link.id);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="flex items-center gap-1.5 transition-colors hover:text-white focus:outline-none cursor-pointer"
                  >
                    <span className="text-xs text-[#71717A]">›</span>
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4 text-left md:col-span-4">
            <h4 className="text-xs uppercase tracking-[0.2em] text-white font-semibold">Connect</h4>
            <p className="text-xs leading-relaxed text-[#A1A1AA]">
              {content.contact.availabilityStatus}
            </p>

            <div className="flex items-center gap-2.5 text-left">
              {(settings.socialLinks.length > 0 ? settings.socialLinks : content.contact.socials).map(link => {
                const icon =
                  link.label.toLowerCase().includes('github') ? (
                    <Github className="h-4 w-4" />
                  ) : link.label.toLowerCase().includes('linkedin') ? (
                    <Linkedin className="h-4 w-4" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  );
                return (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-white/10 bg-[#0C0C0C] p-2.5 text-[#A1A1AA] transition-all hover:scale-105 hover:border-white/20 hover:bg-[#18181B] hover:text-white"
                  >
                    {icon}
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-left text-xs text-[#71717A] sm:flex-row">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} {content.portfolioName}. All rights reserved.</span>
            <span>•</span>
            <span>Pure black and platinum edition</span>
          </div>

          <button
            onClick={scrollToTop}
            className="group flex items-center gap-2 transition-colors hover:text-white cursor-pointer"
          >
            <span>Back to top</span>
            <div className="rounded-md border border-white/10 bg-[#0C0C0C] p-1 transition-colors group-hover:bg-white group-hover:text-black">
              <ArrowUp className="h-3 w-3" />
            </div>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
