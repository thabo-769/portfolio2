import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  ExternalLink,
  Github,
  CheckCircle2,
  CalendarDays,
  Star,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Tag,
  CircleAlert,
  Wrench,
  Gauge,
} from 'lucide-react';
import { Project } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  onEditProject: (project: Project) => void;
  onRequestDelete: (project: Project) => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onEditProject,
  onRequestDelete,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}) => {
  const { playSound } = useTheme();

  useEffect(() => {
    if (!project) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [project]);

  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        playSound('pop');
        onClose();
      } else if (e.key === 'ArrowLeft' && hasPrev) {
        onPrev();
      } else if (e.key === 'ArrowRight' && hasNext) {
        onNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose, onPrev, onNext, hasPrev, hasNext]);

  if (!project) return null;

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/90 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={e => {
            if (e.target === e.currentTarget) {
              playSound('pop');
              onClose();
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-detail-title"
        >
          <motion.div
            className="relative w-full max-w-4xl max-h-[92vh] bg-[#000000] border border-[#1F1F1F] rounded-3xl shadow-2xl overflow-y-auto text-white"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.25 }}
          >
            <button
              onClick={() => {
                playSound('pop');
                onClose();
              }}
              aria-label="Close modal"
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-[#0C0C0C] hover:bg-white hover:text-[#000000] text-white transition-colors border border-[#1F1F1F] cursor-pointer shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-[#000000]">
              <img
                src={project.image}
                alt={project.name}
                className="w-full h-full object-cover object-center transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/55 to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs uppercase tracking-wider font-semibold bg-white text-[#000000] shadow-md">
                      {project.category}
                    </span>
                    {project.featured && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs uppercase tracking-wider font-semibold bg-[#18181B] border border-[#27272A] text-[#A1A1AA]">
                        <Star className="w-3 h-3" /> Featured
                      </span>
                    )}
                    {project.status && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs uppercase tracking-wider font-semibold bg-[#18181B] border border-[#27272A] text-[#A1A1AA]">
                        <Tag className="w-3 h-3" /> {project.status}
                      </span>
                    )}
                  </div>
                  <h2 id="project-detail-title" className="text-3xl sm:text-4xl font-semibold uppercase tracking-tight text-white">
                    {project.name}
                  </h2>
                  <p className="mt-1 text-sm text-[#C9C9CF] max-w-xl">{project.shortDescription}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-[#0C0C0C] border border-[#1F1F1F] text-[#A1A1AA]">
                  <CalendarDays className="w-3.5 h-3.5" /> {formatDate(project.completionDate)}
                </span>
              </div>
            </div>
<div className="p-6 sm:p-8 space-y-6">
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">Overview</h3>
                <p className="mt-2 text-sm sm:text-base text-[#E6E6EA] leading-relaxed">{project.description}</p>
              </section>

              {(project.client || project.projectType) && (
                <section className="flex flex-wrap gap-2 items-center">
                  {project.projectType && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#18181B] border border-[#27272A] text-xs text-[#A1A1AA]">
                      <Gauge className="w-3.5 h-3.5" /> {project.projectType}
                    </span>
                  )}
                  {project.client && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#18181B] border border-[#27272A] text-xs text-[#A1A1AA]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {project.client}
                    </span>
                  )}
                </section>
              )}

              {project.technologies.length > 0 && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">Tech Stack</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {project.technologies.map(tech => (
                      <span key={tech} className="px-3 py-1.5 rounded-full bg-[#18181B] border border-[#27272A] text-xs text-[#D8D8DC]">
                        {tech}
                      </span>
                    ))}
                  </div>
                </section>
              )}
<section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">Key Features</h3>
                <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.features.map(feature => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-[#D8D8DC] leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 flex-none text-white" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {(project.challenges || project.solutions) && (
                <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {project.challenges && (
                    <div>
                      <h3 className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                        <CircleAlert className="w-3.5 h-3.5" /> Challenges
                      </h3>
                      <p className="mt-2 text-sm text-[#D8D8DC] leading-relaxed">{project.challenges}</p>
                    </div>
                  )}
                  {project.solutions && (
                    <div>
                      <h3 className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                        <Wrench className="w-3.5 h-3.5" /> Solutions
                      </h3>
                      <p className="mt-2 text-sm text-[#D8D8DC] leading-relaxed">{project.solutions}</p>
                    </div>
                  )}
                </section>
              )}

              {project.results && (
                <section>
                  <h3 className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                    <Gauge className="w-3.5 h-3.5" /> Results
                  </h3>
                  <p className="mt-2 text-sm text-[#D8D8DC] leading-relaxed">{project.results}</p>
                </section>
              )}

              {project.images.length > 0 && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">Gallery</h3>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {project.images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`${project.name} screenshot ${index + 1}`}
                        className="w-40 h-28 rounded-xl object-cover border border-[#1F1F1F]"
                        loading="lazy"
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
<div className="p-5 sm:p-6 border-t border-[#1F1F1F] flex flex-wrap items-center justify-between gap-3 bg-[#000000]">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={onPrev}
                  disabled={!hasPrev}
                  aria-label="Previous project"
                  className="p-2.5 rounded-full bg-[#0C0C0C] hover:bg-[#18181B] text-[#A1A1AA] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border border-[#1F1F1F]"
                >
                  <ChevronLeft className="w-4.5 h-4.5" />
                </button>
                <button
                  onClick={onNext}
                  disabled={!hasNext}
                  aria-label="Next project"
                  className="p-2.5 rounded-full bg-[#0C0C0C] hover:bg-[#18181B] text-[#A1A1AA] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border border-[#1F1F1F]"
                >
                  <ChevronRight className="w-4.5 h-4.5" />
                </button>
                <span className="text-xs text-[#71717A]">Press ← → to navigate</span>
              </div>

              <div className="flex items-center gap-2.5">
                {onRequestDelete && (
                  <button
                    onClick={() => {
                      playSound('click');
                      onRequestDelete(project);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#121214] hover:bg-red-950/60 hover:text-red-300 hover:border-red-800 border border-[#27272A] text-[#71717A] text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Remove this project from portfolio"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
                {onEditProject && (
                  <button
                    onClick={() => {
                      playSound('click');
                      onEditProject(project);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#121214] hover:bg-[#18181B] hover:text-white border border-[#27272A] text-[#71717A] text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                )}
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};