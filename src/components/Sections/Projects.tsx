import React, { useState, useRef, useEffect } from 'react';
import { Project } from '../../types';
import { ProjectDetailModal } from '../UI/ProjectDetailModal';
import { AddProjectModal } from '../UI/AddProjectModal';
import { ExternalLink, Github, ArrowUpRight, ChevronLeft, ChevronRight, Plus, Trash2, AlertTriangle, X, Trash, MoreVertical, CheckSquare } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const LOCAL_STORAGE_KEY = 'thabo_portfolio_all_projects_v2';

export const Projects: React.FC = () => {
  const { playSound } = useTheme();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const pendingCardClickRef = useRef<number | null>(null);

  // Close the "⋯" more menu on outside click or Escape
  useEffect(() => {
    if (!isMoreMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMoreMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMoreMenuOpen]);

  // Safe-initialize with only user-added projects; start empty if nothing saved
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
    return [];
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
    setProjectToDelete([project]);
  };


// Permanently delete the project(s) pending confirmation
  const handleConfirmDelete = () => {
    if (projectToDelete.length === 0) return;
    playSound('pop');
    const targets = projectToDelete;
    const targetIds = new Set(targets.map(t => t.id));

    setAllProjects(prev => {
      const updated = prev.filter(p => !targetIds.has(p.id));
      saveProjectsToStorage(updated);
      return updated;
    });

    setToastMessage(
      targets.length === 1
        ? `Deleted "${targets[0].title}".`
        : `Deleted ${targets.length} projects.`
    );
    setProjectToDelete([]);
    clearSelection();

    if (selectedProject && targetIds.has(selectedProject.id)) {
      setSelectedProject(null);
    }

    setTimeout(() => setToastMessage(null), 4500);
  };

  // ---- Selection mode (triggered by double-tap) ----
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      setSelectionMode(next.length > 0);
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setSelectionMode(false);
  };

  // Single tap opens the case study (brief delay allows double-tap detection);
  // double tap toggles a project's selection.
  const handleCardClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    const target = e.target as HTMLElement;
    if (target.closest('a, button, input')) return;

    if (selectionMode) {
      toggleSelect(project.id);
      return;
    }

    if (pendingCardClickRef.current) {
      window.clearTimeout(pendingCardClickRef.current);
      pendingCardClickRef.current = null;
      toggleSelect(project.id);
    } else {
      pendingCardClickRef.current = window.setTimeout(() => {
        pendingCardClickRef.current = null;
        handleOpenDetail(project);
      }, 260);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    playSound('pop');
    const targets = allProjects.filter(p => selectedIds.includes(p.id));
    setProjectToDelete(targets);
  };
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'AI & Fullstack', 'E-commerce', 'Cloud & DevOps', 'Real Estate', 'Clean Energy', 'Digital Experience'];

  // Only user-added projects are shown (the preloaded "fixed" defaults are removed)
  const activeProjects = allProjects;

  const filteredProjects = activeCategory === 'All'
    ? activeProjects
    : activeProjects.filter(p => p.category === activeCategory);

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

  // MAIN PROJECTS VIEW

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

          {/* Gallery Navigation Controls & Actions */}
          <div className="flex flex-wrap items-center gap-3 text-left shrink-0">
            {/* "⋯" More Menu - houses Add Project, Trash & Reset Defaults */}
            <div className="relative" ref={moreMenuRef}>
              <button
                id="btn-open-project-more-menu"
                onClick={() => {
                  playSound('pop');
                  setIsMoreMenuOpen(prev => !prev);
                }}
                aria-expanded={isMoreMenuOpen}
                aria-label="Project management options"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#0C0C0C] hover:bg-[#18181B] text-white border border-[#1F1F1F] hover:border-[#3F3F46] transition-all cursor-pointer"
                title="Project options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMoreMenuOpen && (
                <div
                  id="project-more-menu"
                  role="menu"
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0C0C0C] border border-[#27272A] shadow-2xl overflow-hidden z-30 animate-in fade-in zoom-in-95 duration-100"
                >
                  {/* Add Project */}
                  <button
                    id="btn-open-add-project"
                    role="menuitem"
                    onClick={() => {
                      playSound('pop');
                      setIsMoreMenuOpen(false);
                      setIsAddModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left bg-white hover:bg-[#A1A1AA] text-black text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    title="Add a new project to your live showcase"
                  >
                    <Plus className="w-4 h-4 text-black" />
                    <span>Add Project</span>
                  </button>

                  {/* Select Projects (enter/exit selection mode via double-tap) */}
                  <button
                    id="btn-select-projects"
                    role="menuitem"
                    onClick={() => {
                      playSound('pop');
                      setIsMoreMenuOpen(false);
                      if (selectionMode) {
                        clearSelection();
                      } else {
                        setSelectionMode(true);
                      }
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-[#A1A1AA] hover:text-white hover:bg-[#18181B] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border-t border-[#1F1F1F]"
                    title="Double-tap a project card to select or deselect it"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>{selectionMode ? 'Done Selecting' : 'Select Projects'}</span>
                  </button>

                  {/* Delete Selected (permanent) */}
                  {selectedIds.length > 0 && (
                    <button
                      id="btn-delete-selected-projects"
                      role="menuitem"
                      onClick={() => {
                        playSound('pop');
                        setIsMoreMenuOpen(false);
                        handleDeleteSelected();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 hover:text-red-300 hover:bg-red-950/60 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border-t border-[#1F1F1F]"
                      title={`Permanently delete ${selectedIds.length} selected project(s)`}
                    >
                      <Trash className="w-4 h-4" />
                      <span className="flex items-center gap-2">
                        Delete Selected
                        <span className="flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                          {selectedIds.length}
                        </span>
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>

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
            const count = cat === 'All' ? activeProjects.length : activeProjects.filter(p => p.category === cat).length;
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

{/* Selection banner (select multiple projects, then delete) */}
        {selectedIds.length > 0 && (
          <div
            id="project-selection-bar"
            className="flex flex-wrap items-center justify-between gap-3 mb-5 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-100"
          >
            <p className="text-xs font-semibold uppercase tracking-wider">
              Selection mode — tap a project card to select • {selectedIds.length} selected
            </p>
            <div className="flex items-center gap-2">
              <button
                id="btn-selection-delete"
                onClick={() => {
                  playSound('click');
                  handleDeleteSelected();
                }}
                disabled={selectedIds.length === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected</span>
              </button>
              <button
                id="btn-selection-done"
                onClick={() => {
                  playSound('pop');
                  clearSelection();
                }}
                className="px-3.5 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white text-xs font-semibold uppercase tracking-wider transition-all border border-[#27272A] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Empty state when there are no projects yet */}
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#0C0C0C] border border-[#1F1F1F] space-y-4 my-8">
            <p className="text-[#A1A1AA] text-sm">No projects yet. Add your first project to showcase your work.</p>
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
                onClick={() => {
                  playSound('pop');
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-[#A1A1AA] transition-all cursor-pointer"
              >
                Add Your First Project
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
            {filteredProjects.map((project) => {
              const isSelected = selectedIds.includes(project.id);
              return (
              <div
                key={project.id}
                id={`project-card-${project.id}`}
                onClick={(e) => handleCardClick(e, project)}
                className={`w-[280px] sm:w-[320px] md:auto-cols-[340px] h-full shrink-0 snap-start flex flex-col justify-between rounded-xl bg-[#0C0C0C]/90 backdrop-blur-xl border ${
                  isSelected
                    ? 'border-emerald-400 ring-2 ring-emerald-400/40'
                    : 'border-[#1F1F1F] hover:border-[#3F3F46]'
                } shadow-[0_6px_25px_rgb(0,0,0,0.8)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_35px_rgb(0,0,0,0.9)] cursor-pointer group text-left overflow-hidden relative`}
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
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal for Project Deletion (permanent) */}
      {projectToDelete.length > 0 && (
        <div
          id="delete-project-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setProjectToDelete([])}
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
                    {projectToDelete.length === 1 ? 'Delete Project' : 'Delete Projects'}
                  </h3>
                  <p className="text-xs text-[#71717A]">
                    Portfolio Showcase Management
                  </p>
                </div>
              </div>

              <button
                onClick={() => setProjectToDelete([])}
                className="p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-[#18181B] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
              {projectToDelete.length === 1 ? (
                <>Permanently delete <strong className="text-white font-semibold">"{projectToDelete[0].title}"</strong>? This cannot be undone.</>
              ) : (
                <>Permanently delete <strong className="text-white font-semibold">{projectToDelete.length} projects</strong>? This cannot be undone.</>
              )}
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setProjectToDelete([])}
                className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                id="btn-confirm-delete-project"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Forever</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast with Action */}
      {toastMessage && (
        <div
          id="project-action-toast"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0C0C0C] border border-[#27272A] shadow-2xl text-white text-xs animate-in slide-in-from-bottom-3 duration-200"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Case Study Modal Expansion */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onDeleteProject={(id) => {
          const target = allProjects.find(p => p.id === id);
          if (target) {
            setProjectToDelete([target]);
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
