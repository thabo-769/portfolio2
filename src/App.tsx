import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';
import { Hero } from './components/Sections/Hero';
import { About } from './components/Sections/About';
import { Skills } from './components/Sections/Skills';
import { Projects } from './components/Sections/Projects';
import { Referrals } from './components/Sections/Referrals';
import { Contact } from './components/Sections/Contact';
import { ResumeModal } from './components/UI/ResumeModal';

function AppContent() {
  const [isResumeOpen, setIsResumeOpen] = useState<boolean>(false);
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen ${
        theme === 'light'
          ? 'bg-[#F0F4F6] text-[#0D1F23] selection:bg-[#2D4A53] selection:text-white'
          : 'bg-[#000000] text-white selection:bg-[#1F1F1F] selection:text-white'
      } flex flex-col font-sans antialiased overflow-x-hidden transition-colors duration-300`}
    >
      {/* Navigation with Top Scroll Progress Indicator */}
      <Navbar onOpenResume={() => setIsResumeOpen(true)} />

      {/* Main Content Sections */}
      <main id="main-content" className="flex-1">
        <Hero onOpenResume={() => setIsResumeOpen(true)} />
        <About onOpenResume={() => setIsResumeOpen(true)} />
        <Skills />
        <Projects />
        <Referrals />
        <Contact />
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Modals */}
      <ResumeModal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
      />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
