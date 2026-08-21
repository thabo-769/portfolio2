import React, { useState, useRef } from 'react';
import { projectsData } from '../../data/projects';
import { Project } from '../../types';
import { ProjectDetailModal } from '../UI/ProjectDetailModal';
import { AddProjectModal } from '../UI/AddProjectModal';
import { ExternalLink, Github, ArrowUpRight, ChevronLeft, ChevronRight, Plus, Trash2, RotateCcw, AlertTriangle, X, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const LOCAL_STORAGE_KEY = 'thabo_portfolio_all_projects_v2';

export const Projects: React.FC = () => {
  const { playSound } = useTheme();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [lastDeletedProject, setLastDeletedProject] = useState<Project | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Load custom/active projects from localStorage or default to projectsData
  const [allProjects, setAllProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed: Project[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not load projects from localStorage', e);
    }
    return projectsData;
  });

  const saveProjectsToStorage = (projects: Project[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save projects to localStorage', e);
    }
  };

  const handleOpenDetail = (project: Project) => {
    playSound('pop');
    setSelectedProject(project);
  };

  const handleSaveNewProject = (newProject: Project) => {
    setAllProjects(prev => {
      const updated = [...prev, newProject];
      saveProjectsToStorage(updated);
      return updated;
    });

    setToastMessage(`Added "${newProject.title}" to projects.`);
    setTimeout(() => setToastMessage(null), 4000);

    // Scroll to end where new project is added
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          left: scrollContainerRef.current.scrollWidth,
          behavior: 'smooth',
        });
      }
    }, 250);
  };

  const handlePromptDelete = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    playSound('pop');
    setProjectToDelete(project);
  };

  const handleConfirmRemove = () => {
    if (!projectToDelete) return;
    playSound('pop');
    const target = projectToDelete;
    
    setAllProjects(prev => {
      const updated = prev.filter(p => p.id !== target.id);
      saveProjectsToStorage(updated);
      return updated;
    });

    setLastDeletedProject(target);
    setToastMessage(`Removed "${target.title}".`);
    setProjectToDelete(null);

    if (selectedProject?.id === target.id) {
      setSelectedProject(null);
    }

    setTimeout(() => {
      setToastMessage(null);
    }, 6000);
  };

  const handleUndoDelete = () => {
    if (!lastDeletedProject) return;
    playSound('pop');
    setAllProjects(prev => {
      const updated = [...prev, lastDeletedProject];
      saveProjectsToStorage(updated);
      return updated;
    });
    setToastMessage(`Restored "${lastDeletedProject.title}".`);
    setLastDeletedProject(null);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRestoreDefaults = () => {
    playSound('pop');
    setAllProjects(projectsData);
    saveProjectsToStorage(projectsData);
    setToastMessage('Restored all default projects.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'AI & Fullstack', 'E-commerce', 'Cloud & DevOps', 'Real Estate', 'Clean Energy', 'Digital Experience'];

  const filteredProjects = activeCategory === 'All'
    ? allProjects
    : allProjects.filter(p => p.category === activeCategory);

  const scroll = (direction: 'left' | 'right') => {
    playSound('click');
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = 340;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleScrollEvent = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    if (scrollWidth <= clientWidth) {
      setActiveIndex(0);
      return;
    }
    const scrollPercent = scrollLeft / (scrollWidth - clientWidth);
    const index = Math.min(
      Math.floor(scrollPercent * filteredProjects.length),
      filteredProjects.length - 1
    );
    setActiveIndex(Math.max(0, index));
  };

  const isModifiedFromDefaults = allProjects.length !== projectsData.length ||
    !projectsData.every(dp => allProjects.some(p => p.id === dp.id));

  return (
    <section
      id="projects"
      aria-label="Projects showcase"
      className="relative py-28 sm:py-36 bg-[#000000] text-white border-t border-[#1F1F1F] overflow-hidden text-left"
    >
      {/* Background Subtle Ambience */}
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-[#1F1F1F]/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6 text-left">
          <div className="space-y-3 text-left">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A1A1AA] text-left">
              <span className="w-4 h-0.5 bg-[#71717A]" />
              <span>04 // PROJECTS & PRODUCTS</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white uppercase leading-[0.95] text-left">
              FEATURED WORK & <br />
              <span className="font-light text-transparent bg-clip-text bg-gradient-to-r from-white via-[#A1A1AA] to-white/70">
                CURATED GALLERY.
              </span>
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-[#A1A1AA] max-w-xl font-normal leading-relaxed pt-1 text-left">
              Scroll horizontally to explore production platforms, interactive 3D WebGL interfaces, and resilient full-stack systems.
            </p>
          </div>

          {/* Gallery Navigation Controls, Add Project Button & Counter */}
          <div className="flex flex-wrap items-center gap-3 text-left shrink-0">
            {/* Add Project Button */}
            <button
              id="btn-open-add-project"
              onClick={() => {
                playSound('pop');
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-[#A1A1AA] text-black text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 cursor-pointer"
              title="Add a new project to your live showcase"
            >
              <Plus className="w-3.5 h-3.5 text-black" />
              <span>Add Project</span>
            </button>

            {/* Restore Defaults Button (visible if projects were removed or altered) */}
            {isModifiedFromDefaults && (
              <button
                id="btn-restore-default-projects"
                onClick={handleRestoreDefaults}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#0C0C0C] hover:bg-[#18181B] text-[#A1A1AA] hover:text-white border border-[#1F1F1F] hover:border-[#3F3F46] text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                title="Restore all default portfolio projects"
              >
                <RotateCcw className="w-3 h-3 text-[#A1A1AA]" />
                <span>Reset Defaults</span>
              </button>
            )}

            <div className="text-xs font-mono text-[#A1A1AA] tracking-widest uppercase bg-[#0C0C0C] px-3.5 py-2 rounded-full border border-[#1F1F1F]">
              <span className="text-white font-bold">{String(activeIndex + 1).padStart(2, '0')}</span> / {String(filteredProjects.length).padStart(2, '0')} • SCROLL →
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-scroll-projects-left"
                onClick={() => scroll('left')}
                className="p-2.5 rounded-full bg-[#0C0C0C] hover:bg-[#18181B] text-white border border-[#1F1F1F] hover:border-[#3F3F46] transition-all cursor-pointer shadow-sm"
                title="Scroll Left"
                aria-label="Scroll projects left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                id="btn-scroll-projects-right"
                onClick={() => scroll('right')}
                className="p-2.5 rounded-full bg-[#0C0C0C] hover:bg-[#18181B] text-white border border-[#1F1F1F] hover:border-[#3F3F46] transition-all cursor-pointer shadow-sm"
                title="Scroll Right"
                aria-label="Scroll projects right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-6 pb-2 border-b border-[#1F1F1F]">
          {categories.map(cat => {
            const isActive = activeCategory === cat;
            const count = cat === 'All' ? allProjects.length : allProjects.filter(p => p.category === cat).length;
            return (
              <button
                key={cat}
                id={`filter-project-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => {
                  playSound('click');
                  setActiveCategory(cat);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'bg-[#0C0C0C] text-[#A1A1AA] hover:text-white border border-[#1F1F1F] hover:border-[#3F3F46]'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isActive ? 'bg-black text-white' : 'bg-[#18181B] text-[#71717A]'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Empty state if all projects in category or overall are deleted */}
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#0C0C0C] border border-[#1F1F1F] space-y-4 my-8">
            <p className="text-[#A1A1AA] text-sm">No projects found in this category.</p>
            <div className="flex justify-center gap-3">
              {activeCategory !== 'All' && (
                <button
                  onClick={() => setActiveCategory('All')}
                  className="px-4 py-2 rounded-xl bg-[#18181B] text-white text-xs font-semibold uppercase tracking-wider border border-[#27272A] hover:border-white transition-all cursor-pointer"
                >
                  View All Categories
                </button>
              )}
              <button
                onClick={handleRestoreDefaults}
                className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-[#A1A1AA] transition-all cursor-pointer"
              >
                Restore Default Projects
              </button>
            </div>
          </div>
        ) : (
          /* 2-Row Compact Project Cards Gallery */
          <div
            ref={scrollContainerRef}
            onScroll={handleScrollEvent}
            className="grid grid-rows-2 grid-flow-col auto-cols-[280px] sm:auto-cols-[320px] md:auto-cols-[340px] gap-4 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory scroll-smooth text-left"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                id={`project-card-${project.id}`}
                className="w-[280px] sm:w-[320px] md:auto-cols-[340px] h-full shrink-0 snap-start flex flex-col justify-between rounded-xl bg-[#0C0C0C]/90 backdrop-blur-xl border border-[#1F1F1F] hover:border-[#3F3F46] shadow-[0_6px_25px_rgb(0,0,0,0.8)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_35px_rgb(0,0,0,0.9)] group text-left overflow-hidden relative"
              >
                {/* Card Image Banner - Compact */}
                <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-[#000000]">
                  <img
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C] via-transparent to-transparent" />
                  
                  {/* Index & Category Tag & Remove Option */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-[#000000]/85 backdrop-blur-md text-[#A1A1AA] border border-[#1F1F1F]">
                      {project.number}
                    </span>
                    
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#000000]/85 backdrop-blur-md text-white border border-[#1F1F1F]">
                        {project.category}
                      </span>

                      {/* Remove Project Button */}
                      <button
                        id={`btn-remove-project-${project.id}`}
                        onClick={(e) => handlePromptDelete(e, project)}
                        className="p-1 rounded-md bg-[#000000]/80 hover:bg-red-950/90 text-[#71717A] hover:text-red-400 border border-[#1F1F1F] hover:border-red-800 transition-all cursor-pointer shadow-sm"
                        title={`Remove "${project.title}"`}
                        aria-label={`Remove project ${project.title}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Body - Compact */}
                <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between text-left space-y-2.5">
                  <div className="space-y-1 text-left">
                    <h3 className="font-serif font-bold text-base sm:text-lg text-white tracking-tight uppercase group-hover:text-white transition-colors line-clamp-1">
                      {project.title}
                    </h3>

                    <p className="text-[11px] sm:text-xs text-[#A1A1AA] font-sans font-normal leading-relaxed line-clamp-2">
                      {project.shortDescription}
                    </p>
                  </div>

                  {/* Tech Chips */}
                  <div className="flex flex-wrap gap-1 pt-0.5 text-left">
                    {project.technologies.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-[#000000] text-[#A1A1AA] border border-[#1F1F1F]"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-[#000000] text-[#71717A] border border-[#1F1F1F]">
                        +{project.technologies.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons Row: Inspect, GitHub Link, Live Demo Link */}
                  <div className="pt-2.5 border-t border-[#1F1F1F] flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => handleOpenDetail(project)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                    >
                      <span>Inspect</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      {/* GitHub Link Button */}
                      <a
                        id={`project-github-btn-${project.id}`}
                        href={project.githubUrl || `https://github.com/thabolanez4/${project.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View ${project.title} on GitHub`}
                        title="GitHub Repository"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#18181B] hover:bg-[#27272A] text-white border border-[#27272A] hover:border-white text-[10px] font-semibold uppercase tracking-wider transition-all"
                      >
                        <Github className="w-3 h-3" />
                        <span>Code</span>
                      </a>

                      {/* Live Link Button */}
                      <a
                        id={`project-live-btn-${project.id}`}
                        href={project.liveUrl || 'https://github.com/thabolanez4'}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${project.title} live demo`}
                        title="Live Demo / Website"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white hover:bg-[#A1A1AA] text-[#000000] text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm hover:scale-105"
                      >
                        <span>Live</span>
                        <ExternalLink className="w-2.5 h-2.5 text-[#000000]" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal for Project Deletion */}
      {projectToDelete && (
        <div
          id="delete-project-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setProjectToDelete(null)}
        >
          <div
            id="delete-project-modal-card"
            className="w-full max-w-md bg-[#0C0C0C] border border-[#27272A] rounded-2xl p-6 shadow-2xl text-left space-y-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800 text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold uppercase tracking-tight text-white">
                    Remove Project
                  </h3>
                  <p className="text-xs text-[#71717A]">
                    Portfolio Showcase Management
                  </p>
                </div>
              </div>

              <button
                onClick={() => setProjectToDelete(null)}
                className="p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-[#18181B] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
              Are you sure you want to remove <strong className="text-white font-semibold">"{projectToDelete.title}"</strong> from your projects section?
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                id="btn-confirm-delete-project"
                onClick={handleConfirmRemove}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Project</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast with Undo Action */}
      {toastMessage && (
        <div
          id="project-action-toast"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0C0C0C] border border-[#27272A] shadow-2xl text-white text-xs animate-in slide-in-from-bottom-3 duration-200"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
          {lastDeletedProject && (
            <button
              onClick={handleUndoDelete}
              className="ml-2 px-2 py-0.5 rounded bg-white text-black font-bold uppercase text-[10px] hover:bg-[#A1A1AA] transition-colors cursor-pointer"
            >
              Undo
            </button>
          )}
        </div>
      )}

      {/* Case Study Modal Expansion */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onDeleteProject={(id) => {
          const target = allProjects.find(p => p.id === id);
          if (target) {
            setProjectToDelete(target);
          }
        }}
      />

      {/* Add Project Interactive Modal */}
      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaveProject={handleSaveNewProject}
        existingCount={allProjects.length}
      />
    </section>
  );
};
