import React from 'react';
import { ArrowUp, Github, Linkedin, Mail, Terminal, Box } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const Footer: React.FC = () => {
  const { playSound } = useTheme();

  const scrollToTop = () => {
    playSound('pop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'referrals', label: 'Referrals' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <footer
      id="main-footer"
      className="relative bg-[#000000] text-[#A1A1AA] border-t border-[#1F1F1F] pt-16 pb-12 overflow-hidden text-left"
      role="contentinfo"
    >
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-10 w-96 h-24 bg-[#1F1F1F]/20 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#1F1F1F] text-left">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0C0C0C] border border-[#1F1F1F] flex items-center justify-center shadow-lg">
                <Box className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-serif font-semibold text-xl text-white tracking-tight uppercase">
                  THABO TSHABANGU
                </h3>
                <p className="text-xs uppercase tracking-[0.2em] text-[#A1A1AA] font-semibold">
                  Software Developer
                </p>
              </div>
            </div>

            <p className="text-sm text-[#A1A1AA] font-sans max-w-sm leading-relaxed font-normal text-left">
              Engineering high-performance web, mobile, and 3D WebGL architectures with architectural discipline and mathematical precision.
            </p>

            <div className="flex items-center gap-2 text-xs text-[#71717A] font-sans text-left">
              <Terminal className="w-3.5 h-3.5 text-white" />
              <span>Based in Zimbabwe • Available for Worldwide Remote Roles</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3 text-left">
            <h4 className="text-xs uppercase tracking-[0.2em] text-white font-semibold font-sans">
              NAVIGATION
            </h4>
            <ul className="space-y-2 text-sm text-left font-sans">
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
                    className="hover:text-white transition-colors flex items-center gap-1.5 focus:outline-none cursor-pointer"
                  >
                    <span className="text-[#71717A] text-xs">›</span>
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Coordinates */}
          <div className="md:col-span-4 space-y-4 text-left">
            <h4 className="text-xs uppercase tracking-[0.2em] text-white font-semibold font-sans">
              CONNECT & COLLABORATE
            </h4>
            <p className="text-xs text-[#A1A1AA] font-sans leading-relaxed font-normal text-left">
              Open for full-time senior software roles, high-stakes freelance development, and technical consulting.
            </p>

            <div className="flex items-center gap-2.5 text-left">
              <a
                id="footer-github-link"
                href="https://github.com/thabotshabangu"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Profile"
                className="p-2.5 rounded-xl bg-[#0C0C0C] hover:bg-[#18181B] text-[#A1A1AA] hover:text-white border border-[#1F1F1F] hover:border-[#3F3F46] transition-all hover:scale-105"
              >
                <Github className="w-4 h-4" />
              </a>

              <a
                id="footer-linkedin-link"
                href="https://linkedin.com/in/thabo-tshabangu"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                className="p-2.5 rounded-xl bg-[#0C0C0C] hover:bg-[#18181B] text-[#A1A1AA] hover:text-white border border-[#1F1F1F] hover:border-[#3F3F46] transition-all hover:scale-105"
              >
                <Linkedin className="w-4 h-4" />
              </a>

              <a
                id="footer-email-link"
                href="mailto:thabolanez4@gmail.com"
                aria-label="Send Direct Email"
                className="p-2.5 rounded-xl bg-[#0C0C0C] hover:bg-[#18181B] text-[#A1A1AA] hover:text-white border border-[#1F1F1F] hover:border-[#3F3F46] transition-all hover:scale-105"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#71717A] font-sans text-left">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Thabo Tshabangu. All rights reserved.</span>
            <span>•</span>
            <span>Pure Black & Platinum Edition</span>
          </div>

          <button
            id="btn-footer-back-to-top"
            onClick={scrollToTop}
            className="flex items-center gap-2 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer group"
          >
            <span>Back to Top</span>
            <div className="p-1 rounded-md bg-[#0C0C0C] border border-[#1F1F1F] group-hover:bg-white group-hover:text-[#000000] transition-colors">
              <ArrowUp className="w-3 h-3" />
            </div>
          </button>
        </div>
      </div>
    </footer>
  );
};
