import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, FolderKanban, Github, Loader2, PackageOpen } from 'lucide-react';
import { Project3DPreview } from '../3D/Project3DPreview';
import { useProjects } from '../../hooks/useProjects';
import { usePortfolioCms } from '../../context/PortfolioCmsContext';

export const Projects: React.FC = () => {
  const { published, loading, error } = useProjects();
  const { trackEvent } = usePortfolioCms();

  const trackProjectAction = (type: 'github_click' | 'live_click', projectId: string) => {
    void trackEvent({ type, projectId });
  };

  return (
    <section id="projects" className="relative overflow-hidden border-t border-white/10 bg-[#050505] py-20 sm:py-28">
      <div className="pointer-events-none absolute -right-24 top-16 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-400">
            <FolderKanban className="h-3.5 w-3.5" />
            Selected work
          </div>
          <h2 className="mt-4 text-4xl font-semibold uppercase tracking-tight text-white sm:text-5xl">Projects</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            A live collection of products, experiments, and digital experiences built with care.
          </p>
        </div>

        {loading ? (
          <div className="mt-12 flex min-h-56 items-center justify-center rounded-[2rem] border border-white/10 bg-white/5 text-zinc-300">
            <Loader2 className="h-6 w-6 animate-spin" aria-label="Loading projects" />
          </div>
        ) : error ? (
          <div className="mt-12 rounded-[2rem] border border-white/10 bg-white/5 p-8 text-sm leading-relaxed text-zinc-400">
            Projects are temporarily unavailable. Please check back shortly.
          </div>
        ) : published.length === 0 ? (
          <div className="mt-12 flex min-h-56 flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/10 bg-white/5 px-6 text-center">
            <PackageOpen className="h-8 w-8 text-zinc-500" />
            <p className="mt-4 text-sm font-medium text-white">Projects are coming soon.</p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
              New work will appear here as soon as it is published from the dashboard.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {published.map((project, index) => (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
              >
                <Project3DPreview className="group h-full rounded-2xl border border-white/10 bg-[#0C0C0C]">
                  <div className="flex h-full flex-col">
                    <div className="relative aspect-[16/9] overflow-hidden bg-[#111113]">
                      {project.image ? (
                        <img
                          src={project.image}
                          alt={`${project.name} project preview`}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-zinc-600">
                          <FolderKanban className="h-10 w-10" />
                        </div>
                      )}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      {project.category && (
                        <span className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-black/60 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md">
                          {project.category}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <h3 className="text-xl font-semibold tracking-tight text-white">{project.name}</h3>
                      <p className="mt-2 flex-1 text-xs leading-relaxed text-zinc-400 sm:text-sm">
                        {project.description || project.shortDescription}
                      </p>

                      {project.technologies.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {project.technologies.slice(0, 5).map(technology => (
                            <span key={technology} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-zinc-300">
                              {technology}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-5 flex flex-wrap gap-2">
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackProjectAction('live_click', project.id)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-semibold text-black transition-colors hover:bg-zinc-200"
                          >
                            View live
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackProjectAction('github_click', project.id)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10"
                          >
                            GitHub
                            <Github className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </Project3DPreview>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;
