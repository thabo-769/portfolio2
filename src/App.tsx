import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';
import { Hero } from './components/Sections/Hero';
import { About } from './components/Sections/About';
import { Projects } from './components/Sections/Projects';
import { Referrals } from './components/Sections/Referrals';
import { Contact } from './components/Sections/Contact';
import { PrimaryTechStrip } from './components/UI/PrimaryTechStrip';
import { ResumeModal } from './components/UI/ResumeModal';
import { AdminDashboard } from './admin/AdminDashboard';
import { ToastProvider } from './admin/ToastContext';
import { getFirebaseAnalytics } from './firebase/config';
import { PortfolioCmsProvider, usePortfolioCms } from './context/PortfolioCmsContext';

function Portfolio() {
  const [isResumeOpen, setIsResumeOpen] = useState<boolean>(false);
  const { theme } = useTheme();
  const { trackEvent } = usePortfolioCms();
  const didTrackView = useRef(false);

  useEffect(() => {
    if (didTrackView.current) return;
    didTrackView.current = true;
    void trackEvent({ type: 'portfolio_view', label: 'Public portfolio loaded' });
  }, [trackEvent]);

  return (
    <div
      className={`min-h-screen ${
        theme === 'light'
          ? 'bg-[#F4F4F5] text-[#0D1F23] selection:bg-[#16A34A] selection:text-white'
          : 'bg-[#000000] text-white selection:bg-[#16A34A] selection:text-white'
      } flex flex-col font-sans antialiased overflow-x-hidden transition-colors duration-300`}
    >
      <Navbar onOpenResume={() => setIsResumeOpen(true)} />

      <main id="main-content" className="flex-1">
        <Hero onOpenResume={() => setIsResumeOpen(true)} />
        <About onOpenResume={() => setIsResumeOpen(true)} />
        <PrimaryTechStrip />
        <Projects />
        <Referrals />
        <Contact />
      </main>

      <Footer />

      <ResumeModal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
      />
    </div>
  );
}

export function App() {
  useEffect(() => {
    void getFirebaseAnalytics();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <PortfolioCmsProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Portfolio />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </PortfolioCmsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
