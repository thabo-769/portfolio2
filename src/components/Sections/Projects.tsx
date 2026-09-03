import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, ExternalLink, Github, Star, Loader2, FolderKanban } from 'lucide-react';
import { Project } from '../../types';
import { useProjects } from '../../hooks/useProjects';

/** Public Projects section — a clean, read-only showcase from Firebase. */
export const Projects: React.FC = () => {
  const { published, loading, error, notConfigured } = useProjects();
  const [selected, setSelected] = useState<Project | null>(null);

  useEffect(() => {
    if (!selected) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [selected]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const showEmpty = !loading && (notConfigured || error !== null || published.length === 0);

  const renderEmpty = () => (
    <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-14 mt-10">
      <div className="flex flex-col items-center justify-center text-center py-24 rounded-3xl border border-[#1F1F1F] bg-[#0C0C0C]/60 backdrop-blur-sm">
        <div className="p-4 rounded-2xl bg-white/10 text-white border border-[#1F1F1F] mb-5">
          <FolderKanban className="w-10 h-10" />
        </div>
        <h3 className="text-xl sm:text-2xl font-semibold text-white uppercase tracking-tight">Projects coming soon</h3>
        <p className="mt-2 text-sm text-[#A1A1AA] max-w-md">I'm currently building and publishing my latest work right here. Check back shortly.</p>
      </div>
    </div>
  );

  return (
    <section id="projects" className="scroll-mt-24 w-full py-24 text-left">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-14">
        <div className="flex items-center gap-4">
          <span className="p-3 rounded-2xl bg-white/10 border border-[#1F1F1F] text-white">
            <Box className="w-7 h-7" />
          </span>
          <div>
            <h2 className="text-4xl sm:text-5xl font-semibold uppercase tracking-tight text-white">Projects</h2>
            <p className="mt-1 text-sm sm:text-base text-[#A1A1AA] max-w-2xl">Selected projects I have built.</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="mt-14 flex items-center justify-center py-16 text-white">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
      )}

      {showEmpty && renderEmpty()}

      {!loading && !notConfigured && error === null && published.length > 0 && (
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-14 mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {published.map((project, index) => (
              <motion.button
                key={project.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: (index % 3) * 0.08 }}
                onClick={() => setSelected(project)}
                className="group text-left bg-[#0C0C0C] rounded-2xl overflow-hidden border border-[#1F1F1F] hover:border-white/60 transition-all cursor-pointer hover:shadow-[0_12px_40px_-12px_rgba(255,255,255,0.25)]"
              >
                <div className="relative h-52 bg-[#111113] overflow-hidden">
                  {project.image && !project.image.startsWith('gs://') ? (
                    <img src={project.image} alt={project.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10"><Box className="w-14 h-14" /></div>
                  )}
                  {project.featured && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-wider shadow-lg">
                      <Star className="w-3 h-3 fill-current" /> Featured
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white uppercase tracking-tight group-hover:text-white transition-colors">{project.name}</h3>
                  <p className="mt-1 text-xs text-[#6B7280]">{project.category}</p>
                  <p className="mt-3 text-sm text-[#A1A1AA] leading-relaxed line-clamp-3">{project.shortDescription || project.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.technologies.slice(0, 4).map(tech => (
                      <span key={tech} className="px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-white text-[10px] font-semibold uppercase tracking-wider">{tech}</span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="px-2 py-0.5 rounded-md bg-[#18181B] text-[#71717A] text-[10px] font-semibold">+{project.technologies.length - 4}</span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="public-project-title"
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0C0C0C] border border-[#1F1F1F] rounded-3xl shadow-2xl text-white"
            >
              <div className="relative h-64 sm:h-80 bg-[#111113]">
                {selected.image && !selected.image.startsWith('gs://') ? (
                  <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/10"><Box className="w-20 h-20" /></div>
                )}
                <button
                  onClick={() => setSelected(null)}
                  aria-label="Close project"
                  className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-white text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 sm:p-8">
                {selected.featured && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/40 text-white text-[10px] font-bold uppercase tracking-wider">
                    <Star className="w-3 h-3 fill-current" /> Featured
                  </span>
                )}
                <h2 id="public-project-title" className="mt-3 text-2xl sm:text-3xl font-semibold uppercase tracking-tight text-white">{selected.name}</h2>
                <p className="mt-1 text-xs text-[#71717A]">{selected.category}</p>
                <p className="mt-4 text-[15px] text-[#A1A1AA] leading-relaxed">{selected.description || selected.shortDescription}</p>

                <div className="mt-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#71717A] mb-2">Technologies</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.technologies.map(tech => (
                      <span key={tech} className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/20 text-white text-xs font-semibold uppercase tracking-wider">{tech}</span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <a
                    href={selected.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      selected.githubUrl ? 'bg-white hover:bg-zinc-200 text-black shadow-lg shadow-black/20' : 'bg-[#18181B] text-[#71717A] pointer-events-none'
                    }`}
                  >
                    <Github className="w-4 h-4" /> GitHub
                  </a>
                  <a
                    href={selected.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      selected.liveUrl ? 'bg-white hover:bg-zinc-200 text-black shadow-md' : 'bg-[#18181B] text-[#71717A] pointer-events-none'
                    }`}
                  >
                    <ExternalLink className="w-4 h-4" /> Live Website
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Projects;