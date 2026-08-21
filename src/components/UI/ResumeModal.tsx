import React, { useEffect } from 'react';
import { X, Download, Printer, MapPin, Mail, Globe, Briefcase, GraduationCap, Code } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose }) => {
  const { playSound } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    playSound('pop');
    window.print();
  };

  const handleDownload = () => {
    playSound('success');
    const resumeText = `THABO TSHABANGU
Software Developer | Full-Stack & 3D Interactive Specialist
Email: thabolanez4@gmail.com | Location: Zimbabwe
Website: https://thabo.dev | GitHub: https://github.com/thabotshabangu

========================================
PROFESSIONAL SUMMARY
========================================
Software Developer based in Zimbabwe with 3+ years of professional experience building practical, innovative, and scalable software solutions. Specializing in full-stack web and mobile engineering, responsive 3D WebGL architectures, and clean, type-safe code.

========================================
CORE TECHNICAL SKILLS
========================================
• Programming Languages: JavaScript (ES6+), TypeScript, Python, Dart, HTML5/CSS3
• Frontend: React 19, Next.js, Three.js, Tailwind CSS, Framer Motion, GSAP, WebGL
• Backend & APIs: Node.js, Express.js, Python, Django, REST APIs, GraphQL, WebSockets
• Mobile: React Native, Flutter, Expo EAS
• Databases & Cloud: PostgreSQL, Supabase, MongoDB, Firebase/Firestore, Docker, CI/CD, Git

========================================
FEATURED PROJECTS & ACHIEVEMENTS
========================================
• Blade AI: Autonomous AI-powered development platform (React, TypeScript, Supabase, Gemini AI). Serves 5,000+ active users.
• Foodora: Modern food e-commerce & GPS telemetry ordering application (React, Next.js, Stripe, Supabase). Handled 12,500+ monthly orders.
• Real Estate Platform: Interactive property marketplace featuring 3D virtual tour renderings.
• Mweya Green Energy: Renewable energy portal with interactive solar yield calculations.
• White Lions Legacies: WebGL 3D cultural preservation platform with 80,000+ global visitors.

========================================
WORK EXPERIENCE
========================================
Lead Full-Stack Software Developer | Digital Innovations Lab
2023 - Present
• Engineered micro-frontend and multi-tenant architectures serving thousands of daily active users.
• Cut client-side bundle load times by 40% using modern Vite, code-splitting, and WebP asset pipelines.

Full-Stack Software Engineer & 3D Specialist | Consultant
2021 - 2023
• Built 15+ production systems spanning e-commerce, real estate 3D visualizers, and corporate portals.
• Implemented Stripe checkout flows with 99.8% transaction success rates.

========================================
EDUCATION & CERTIFICATIONS
========================================
• B.Sc. in Computer Science / Information Systems
• Advanced Full-Stack Software Architecture Certification
• Three.js & WebGL Interactive Graphics Specialization
`;

    const blob = new Blob([resumeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Thabo_Tshabangu_Software_Developer_Resume.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="resume-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 text-left"
      onClick={e => {
        if (e.target === e.currentTarget) {
          playSound('pop');
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-title"
    >
      <div
        id="resume-modal-card"
        className="relative w-full max-w-3xl max-h-[90vh] bg-[#000000] border border-[#1F1F1F] rounded-3xl shadow-2xl overflow-y-auto text-white text-left"
      >
        {/* Header Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-4 sm:p-5 bg-[#0C0C0C] border-b border-[#1F1F1F] backdrop-blur-md text-left">
          <div className="flex items-center gap-2 text-left">
            <Briefcase className="w-4 h-4 text-white" />
            <h2 id="resume-title" className="text-sm sm:text-base font-bold uppercase tracking-tight text-white text-left">
              Curriculum Vitae — Thabo Tshabangu
            </h2>
          </div>

          <div className="flex items-center gap-2 text-left">
            <button
              id="btn-print-resume"
              onClick={handlePrint}
              title="Print Resume"
              className="p-2 rounded-lg bg-[#000000] hover:bg-[#18181B] text-[#A1A1AA] hover:text-white transition-colors border border-[#1F1F1F] cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              id="btn-download-resume"
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-[#A1A1AA] text-[#000000] text-xs font-bold tracking-wider uppercase transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#000000]" />
              <span>Download CV</span>
            </button>
            <button
              id="btn-close-resume-modal"
              onClick={() => {
                playSound('pop');
                onClose();
              }}
              className="p-2 rounded-lg bg-[#000000] hover:bg-white hover:text-[#000000] text-white transition-colors border border-[#1F1F1F] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Formatted Resume Body */}
        <div className="p-6 sm:p-8 space-y-8 bg-[#000000] text-left">
          {/* Header Identity */}
          <div className="border-b border-[#1F1F1F] pb-6 flex flex-col sm:flex-row justify-between sm:items-end gap-4 text-left">
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-white uppercase tracking-tight text-left">
                THABO TSHABANGU
              </h1>
              <p className="text-[#A1A1AA] text-[11px] uppercase tracking-[0.2em] font-semibold mt-1 text-left">
                SOFTWARE DEVELOPER • 3+ YEARS PROFESSIONAL EXPERIENCE
              </p>
            </div>
            <div className="text-xs text-[#71717A] space-y-1 text-left font-normal">
              <div className="flex items-center gap-1.5 text-left">
                <MapPin className="w-3.5 h-3.5 text-white" />
                <span>Zimbabwe (UTC+2)</span>
              </div>
              <div className="flex items-center gap-1.5 text-left">
                <Mail className="w-3.5 h-3.5 text-white" />
                <span>thabolanez4@gmail.com</span>
              </div>
              <div className="flex items-center gap-1.5 text-left">
                <Globe className="w-3.5 h-3.5 text-white" />
                <span>thabo.dev</span>
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="text-left space-y-1.5">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-white font-semibold text-left">
              PROFESSIONAL SUMMARY
            </h3>
            <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed font-normal text-left">
              Full-Stack Software Developer based in Zimbabwe with 3+ years of proven expertise designing and launching scalable web applications, mobile platforms, and high-performance 3D interactive graphics. Dedicated to writing clean, maintainable, and type-safe code that delivers exceptional user experiences.
            </p>
          </div>

          {/* Core Technical Competencies */}
          <div className="text-left space-y-2">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-white font-semibold flex items-center gap-2 text-left">
              <Code className="w-3.5 h-3.5" />
              <span>TECHNICAL STACK & COMPETENCIES</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-left">
              <div className="p-3.5 rounded-xl bg-[#0C0C0C] border border-[#1F1F1F] text-left">
                <strong className="text-white block mb-1 font-semibold text-left">Languages & Frameworks:</strong>
                <span className="text-[#A1A1AA] text-left">TypeScript, JavaScript (ES6+), React 19, Next.js, Python, Django, Dart, Flutter, React Native, Node.js, Express.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0C0C0C] border border-[#1F1F1F] text-left">
                <strong className="text-white block mb-1 font-semibold text-left">3D & Architecture:</strong>
                <span className="text-[#A1A1AA] text-left">Three.js, WebGL, Tailwind CSS, Framer Motion, GSAP, RESTful APIs, WebSockets, Supabase RLS.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0C0C0C] border border-[#1F1F1F] text-left">
                <strong className="text-white block mb-1 font-semibold text-left">Databases:</strong>
                <span className="text-[#A1A1AA] text-left">PostgreSQL, Supabase, MongoDB, Firebase/Firestore, Redis caching.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0C0C0C] border border-[#1F1F1F] text-left">
                <strong className="text-white block mb-1 font-semibold text-left">DevOps & Tooling:</strong>
                <span className="text-[#A1A1AA] text-left">Git, GitHub Actions CI/CD, Docker, Vercel, Vite, Linux Shell.</span>
              </div>
            </div>
          </div>

          {/* Work Experience */}
          <div className="text-left space-y-4">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-white font-semibold flex items-center gap-2 text-left">
              <Briefcase className="w-3.5 h-3.5" />
              <span>WORK EXPERIENCE</span>
            </h3>
            <div className="space-y-4 text-left">
              <div className="border-l-2 border-[#1F1F1F] pl-4 space-y-1 text-left">
                <div className="flex flex-wrap justify-between items-baseline text-left">
                  <h4 className="font-bold text-white text-sm text-left">Lead Full-Stack Developer</h4>
                  <span className="text-[10px] font-semibold text-[#71717A]">2023 — PRESENT</span>
                </div>
                <p className="text-xs text-[#A1A1AA] font-medium text-left">Digital Innovation Lab • Full-Stack</p>
                <ul className="text-xs text-[#71717A] list-disc list-inside space-y-1 text-left">
                  <li>Engineered multi-platform web applications with sub-second page loads and 98+ Lighthouse scores.</li>
                  <li>Architected real-time WebSocket communication layers and optimized database indexing.</li>
                  <li>Integrated AI workflows using Gemini API and autonomous code analysis assistants.</li>
                </ul>
              </div>

              <div className="border-l-2 border-[#1F1F1F] pl-4 space-y-1 text-left">
                <div className="flex flex-wrap justify-between items-baseline text-left">
                  <h4 className="font-bold text-white text-sm text-left">Full-Stack Software Engineer & 3D Specialist</h4>
                  <span className="text-[10px] font-semibold text-[#71717A]">2021 — 2023</span>
                </div>
                <p className="text-xs text-[#A1A1AA] font-medium text-left">Freelance / Engineering Consultant</p>
                <ul className="text-xs text-[#71717A] list-disc list-inside space-y-1 text-left">
                  <li>Built 15+ production systems spanning e-commerce, real estate 3D visualizers, and corporate sites.</li>
                  <li>Implemented Stripe & mobile money checkout flows with 99.8% transaction success rates.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="text-left space-y-1.5">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-white font-semibold flex items-center gap-2 text-left">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>EDUCATION & CERTIFICATIONS</span>
            </h3>
            <div className="text-xs text-[#A1A1AA] space-y-1 text-left">
              <p className="font-bold text-white text-left">B.Sc. in Computer Science / Information Systems</p>
              <p className="text-[#71717A] text-left">Professional certifications in Advanced React Architecture, Three.js WebGL Graphics, and Distributed Systems.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
