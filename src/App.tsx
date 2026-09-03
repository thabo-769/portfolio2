import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';
import { Hero } from './components/Sections/Hero';
import { About } from './components/Sections/About';
import { Skills } from './components/Sections/Skills';
import { Projects } from './components/Sections/Projects';
import { Referrals } from './components/Sections/Referrals';
import { Contact } from './components/Sections/Contact';
import { ResumeModal } from './components/UI/ResumeModal';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './admin/AdminDashboard';
import { ProtectedRoute } from './admin/ProtectedRoute';
import { ToastProvider } from './admin/ToastContext';

function Portfolio() {
  const [isResumeOpen, setIsResumeOpen] = useState<boolean>(false);
  const { theme } = useTheme();

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
        <Skills />
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
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Portfolio />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
