import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
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
import { ToastProvider } from './admin/ToastContext';
import { getFirebaseAnalytics } from './firebase/config';
import { PortfolioCmsProvider, usePortfolioCms } from './context/PortfolioCmsContext';

const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));

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
        <PrimaryTechStrip />
        <About onOpenResume={() => setIsResumeOpen(true)} />
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

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unhandled app error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#000000] p-6 text-center text-white">
          <div className="max-w-md space-y-4 rounded-3xl border border-white/10 bg-[#0C0C0C] p-8 shadow-2xl">
            <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
            <p className="text-xs leading-relaxed text-zinc-400">
              An unexpected error occurred while rendering the page. Click below to reload.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-zinc-200"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  useEffect(() => {
    void getFirebaseAnalytics();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <PortfolioCmsProvider>
            <ToastProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Portfolio />} />
                  <Route
                    path="/admin"
                    element={
                      <Suspense
                        fallback={
                          <div className="flex min-h-screen items-center justify-center bg-[#000000] text-white">
                            <div className="flex flex-col items-center gap-3">
                              <div className="h-7 w-7 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              <span className="text-xs font-medium text-zinc-400">Loading workspace...</span>
                            </div>
                          </div>
                        }
                      >
                        <AdminDashboard />
                      </Suspense>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </ToastProvider>
          </PortfolioCmsProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
