import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  onOpenResume: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenResume }) => {
  const { playSound } = useTheme();
  const [activeSection, setActiveSection] = useState<string>('home');
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'referrals', label: 'Referrals' },
    { id: 'contact', label: 'Contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      // 1. Calculate scroll progress percentage (0 to 100)
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      setScrollProgress(scrolled);

      // 2. Scrolled state
      setIsScrolled(winScroll > 20);

      // 3. Active Section Tracking
      const sections = navItems.map(item => document.getElementById(item.id));
      const scrollPos = winScroll + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPos) {
          setActiveSection(navItems[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    playSound('click');
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - navOffset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      {/* Top subtle reading line indicator without any bottom border */}
      <div 
        id="global-scroll-progress-bar"
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 h-[1.5px] z-[100] bg-transparent pointer-events-none"
      >
        <div 
          className="h-full bg-white transition-all duration-75 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Main Navbar Header: Completely Borderless, Clean and Pure Typographic */}
      <header
        id="main-navbar-header"
        className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#000000]/90 backdrop-blur-md'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Desktop Navigation Links (Left-aligned, Pure Text) */}
            <nav
              className="hidden md:flex items-center space-x-6 lg:space-x-8 text-left"
              aria-label="Main Navigation"
            >
              {navItems.map(item => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-link-${item.id}`}
                    onClick={() => scrollToSection(item.id)}
                    onMouseEnter={() => playSound('hover')}
                    className={`text-xs sm:text-sm uppercase tracking-widest transition-colors cursor-pointer bg-transparent border-0 p-0 ${
                      isActive
                        ? 'text-white font-bold'
                        : 'text-[#71717A] hover:text-white font-medium'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Mobile Header Menu (Pure Text) */}
            <div className="flex md:hidden items-center justify-end w-full">
              <button
                id="btn-mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
                className="bg-transparent border-0 p-0 text-xs font-bold uppercase tracking-widest text-white hover:text-[#A1A1AA] transition-colors cursor-pointer"
              >
                {mobileMenuOpen ? 'Close' : 'Menu'}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer (Borderless, Pure Text Links) */}
        {mobileMenuOpen && (
          <div
            id="mobile-nav-drawer"
            className="md:hidden bg-[#000000]/95 backdrop-blur-xl px-6 pt-2 pb-6 space-y-4 shadow-2xl text-left"
          >
            <div className="flex flex-col space-y-3 text-left">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="bg-transparent border-0 p-0 text-left text-xs uppercase tracking-widest text-[#A1A1AA] hover:text-white font-medium transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="pt-3 text-left">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenResume();
                }}
                className="bg-transparent border-0 p-0 text-xs font-bold uppercase tracking-widest text-white hover:text-[#A1A1AA]"
              >
                View Full Resume
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
