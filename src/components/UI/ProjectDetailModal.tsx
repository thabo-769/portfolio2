import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Github, CheckCircle2, ShieldCheck, Trash2, AlertTriangle } from 'lucide-react';
import { Project } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  onDeleteProject?: (projectId: string) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose, onDeleteProject }) => {
  const { playSound } = useTheme();
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setConfirmDelete(false);
  }, [project]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const handleDelete = () => {
    if (onDeleteProject) {
      playSound('pop');
      onDeleteProject(project.id);
      onClose();
    }
  };

  return (
    <div
      id="project-detail-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 text-left"
      onClick={e => {
        if (e.target === e.currentTarget) {
          playSound('pop');
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-project-title"
    >
      <div
        id="project-detail-modal-card"
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#000000] border border-[#1F1F1F] rounded-3xl shadow-2xl overflow-y-auto text-white text-left"
      >
        {/* Close Button */}
        <button
          id="btn-close-project-modal"
          onClick={() => {
            playSound('pop');
            onClose();
          }}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-[#0C0C0C] hover:bg-white hover:text-[#000000] text-white transition-colors border border-[#1F1F1F] cursor-pointer shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Banner Image */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-[#000000] text-left">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/60 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4 text-left">
            <div className="text-left">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs uppercase tracking-wider font-semibold bg-white text-[#000000] mb-2 shadow-md">
                {project.number} — {project.category}
              </span>
              <h2 id="modal-project-title" className="text-3xl sm:text-4xl lg:text-5xl font-semibold font-serif uppercase tracking-tight text-white">
                {project.title}
              </h2>
              <p className="text-sm sm:text-base text-[#A1A1AA] mt-1 max-w-xl font-sans font-normal">
                {project.tagline}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                id="modal-github-link"
                href={project.githubUrl || `https://github.com/thabolanez4/${project.id}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${project.title} on GitHub`}
                className="px-4 py-2 rounded-lg bg-[#0C0C0C] hover:bg-[#18181B] text-white text-xs sm:text-sm font-semibold tracking-wide transition-colors flex items-center gap-2 border border-[#1F1F1F] hover:border-white"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>

              <a
                id="modal-live-link"
                href={project.liveUrl || 'https://github.com/thabolanez4'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Launch ${project.title} live demo`}
                className="px-4 py-2 rounded-lg bg-white hover:bg-[#A1A1AA] text-[#000000] text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow-md hover:scale-105"
              >
                <span>Live Demo</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8 text-left font-sans">
          
          {/* Metadata Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#0C0C0C]/85 border border-[#1F1F1F] text-left">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#71717A]">Duration</p>
              <p className="text-sm font-semibold text-white mt-0.5">{project.duration}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#71717A]">Role</p>
              <p className="text-sm font-semibold text-white mt-0.5">{project.role}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#71717A]">Year</p>
              <p className="text-sm font-semibold text-white mt-0.5">{project.year}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#71717A]">Key Metric</p>
              <p className="text-sm font-semibold text-white mt-0.5">{project.metrics?.[0]?.value || 'Production'}</p>
            </div>
          </div>

          {/* Full Narrative Overview */}
          <div className="space-y-3 text-left">
            <h3 className="text-xl font-serif font-bold text-white uppercase tracking-tight">
              Executive Architectural Summary
            </h3>
            <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed font-sans font-normal">
              {project.longDescription}
            </p>
          </div>

          {/* Challenge vs Solution Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-[#0C0C0C]/85 border border-[#1F1F1F] space-y-2 text-left">
              <h4 className="text-xs uppercase font-bold tracking-wider text-[#A1A1AA] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#71717A]" />
                <span>The Architectural Challenge</span>
              </h4>
              <p className="text-sm text-[#A1A1AA] leading-relaxed font-sans font-normal">
                {project.challenge}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0C0C0C]/85 border border-[#1F1F1F] space-y-2 text-left">
              <h4 className="text-xs uppercase font-bold tracking-wider text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>The Engineered Solution</span>
              </h4>
              <p className="text-sm text-[#A1A1AA] leading-relaxed font-sans font-normal">
                {project.solution}
              </p>
            </div>
          </div>

          {/* Core Feature Highlights */}
          <div className="space-y-4 text-left">
            <h3 className="text-xl font-serif font-bold text-white uppercase tracking-tight">
              Core Technical Features & Capabilities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {project.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#0C0C0C]/50 border border-[#1F1F1F] text-left">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-[#A1A1AA] font-sans leading-snug">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technology Stack Grid */}
          <div className="space-y-3 text-left">
            <h3 className="text-xl font-serif font-bold text-white uppercase tracking-tight">
              Technologies & Infrastructure
            </h3>
            <div className="flex flex-wrap gap-2 text-left">
              {project.technologies.map(tech => (
                <span
                  key={tech}
                  className="px-3 py-1.5 rounded-lg bg-[#0C0C0C] text-white text-xs font-semibold tracking-wide border border-[#1F1F1F]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#1F1F1F] flex flex-wrap items-center justify-between gap-4 bg-[#000000] text-left">
          <div className="flex items-center gap-3">
            {onDeleteProject && (
              <>
                {confirmDelete ? (
                  <div className="flex items-center gap-2 p-1.5 px-3 rounded-xl bg-red-950/40 border border-red-800 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-red-300">Remove project?</span>
                    <button
                      onClick={handleDelete}
                      className="px-2.5 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Yes, Remove
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="px-2 py-1 rounded-md bg-[#1F1F1F] hover:bg-[#27272A] text-[#A1A1AA] text-[11px] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      playSound('click');
                      setConfirmDelete(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#121214] hover:bg-red-950/60 hover:text-red-300 hover:border-red-800 border border-[#27272A] text-[#71717A] text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Remove this project from portfolio"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </>
            )}

            <div className="hidden sm:flex items-center gap-2 text-xs text-[#71717A] font-sans">
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>Production Architecture</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={project.githubUrl || `https://github.com/thabolanez4/${project.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#0C0C0C] hover:bg-[#18181B] text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 border border-[#1F1F1F] hover:border-white"
            >
              <Github className="w-4 h-4" />
              <span>Source Code</span>
            </a>

            <a
              href={project.liveUrl || 'https://github.com/thabolanez4'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-xl bg-white hover:bg-[#A1A1AA] text-[#000000] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md hover:scale-105"
            >
              <span>Launch Live Demo</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
