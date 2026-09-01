import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Plus,
  Search,
  Archive,
  Trash2,
  RotateCcw,
  AlertTriangle,
  MoreVertical,
  X,
  ExternalLink,
  Github,
  Star,
  Eye,
  Pencil,
  Sparkles,
  Box,
  CheckCircle2,
  CalendarRange,
  TrendingUp,
  Clock,
  ArrowDownAZ,
  ArrowUpAZ,
  RefreshCcw,
} from 'lucide-react';
import { Project } from '../../types';
import { ProjectFormModal } from '../UI/ProjectFormModal';
import { ProjectDetailModal } from '../UI/ProjectDetailModal';
import { useTheme } from '../../context/ThemeContext';

const ACTIVE_KEY = 'thabo_projects_active_v4';
const TRASH_KEY = 'thabo_projects_trash_v4';
const OLD_ACTIVE_KEY = 'thabo_portfolio_active_projects_v3';
const OLD_TRASH_KEY = 'thabo_portfolio_trash_projects_v3';

const FILTERS = ['All', 'Personal', 'Business', 'Mobile', 'Gift', 'Other'];

const SORTS = [
  { key: 'newest', label: 'Newest', Icon: CalendarRange },
  { key: 'oldest', label: 'Oldest', Icon: Clock },
  { key: 'az', label: 'Name A–Z', Icon: ArrowDownAZ },
  { key: 'za', label: 'Name Z–A', Icon: ArrowUpAZ },
  { key: 'featured', label: 'Featured', Icon: Star },
  { key: 'recent', label: 'Recently Updated', Icon: RefreshCcw },
];

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function isNewlyAdded(project: Project): boolean {
  if (!project.createdAt) return false;
  return Date.now() - project.createdAt < 14 * 86400000;
}

function normalizeCategory(rawCategory: unknown): Project['category'] {
  const category = String(rawCategory ?? 'Other');
  if (category === 'Mobile App' || category === 'Mobile') return 'Mobile';
  if (['E-commerce', 'Real Estate', 'Clean Energy', 'Business'].includes(category)) return 'Business';
  if (category === 'Personal' || category === 'Gift') return category;
  if (category === 'Personal' || category === 'Business' || category === 'Mobile' || category === 'Gift' || category === 'Other') {
    return category;
  }
  return 'Other';
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function toNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

// Normalize both the legacy v3 project shape and the current saved shape so
// records survive reloads without losing their fields.
function normalizeProjectRecord(raw: unknown): Project | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const data = raw as Record<string, unknown>;
  const now = Date.now();
  const hasCurrentShape =
    'name' in data ||
    'images' in data ||
    'createdAt' in data ||
    'updatedAt' in data ||
    'deletedAt' in data ||
    'isDeleted' in data;

  if (hasCurrentShape) {
    return {
      id: String(data.id ?? `project-${now}`),
      name: String(data.name ?? data.title ?? 'Untitled Project'),
      shortDescription: String(data.shortDescription ?? ''),
      description: String(data.description ?? data.longDescription ?? ''),
      category: normalizeCategory(data.category),
      technologies: asStringArray(data.technologies),
      image: String(data.image ?? ''),
      images: asStringArray(data.images),
      githubUrl: String(data.githubUrl ?? ''),
      liveUrl: String(data.liveUrl ?? ''),
      status: String(data.status ?? 'Completed'),
      featured: Boolean(data.featured),
      completionDate: String(data.completionDate ?? new Date().toISOString()),
      client: String(data.client ?? ''),
      projectType: String(data.projectType ?? ''),
      features: asStringArray(data.features),
      challenges: String(data.challenges ?? data.challenge ?? ''),
      solutions: String(data.solutions ?? data.solution ?? ''),
      results: String(data.results ?? ''),
      createdAt: toNumber(data.createdAt, now),
      updatedAt: toNumber(data.updatedAt, now),
      deletedAt:
        data.deletedAt === null || data.deletedAt === undefined || data.deletedAt === ''
          ? null
          : toNumber(data.deletedAt, now),
      isDeleted: Boolean(data.isDeleted),
    };
  }

  const oldCategory = String(data.category ?? 'Other');
  let category = 'Other';
  if (oldCategory === 'Mobile App' || oldCategory === 'Mobile') category = 'Mobile';
  else if (['E-commerce', 'Real Estate', 'Clean Energy', 'Business'].includes(oldCategory)) category = 'Business';
  else if (oldCategory === 'Personal' || oldCategory === 'Gift') category = oldCategory;

  const year = Number(data.year || 0);
  const yearDate = year
    ? new Date(year, 0, 1).toISOString()
    : new Date().toISOString();

  const oldFeatures = Array.isArray(data.features) ? data.features.map(String) : [];
  const metrics = Array.isArray(data.metrics)
    ? data.metrics.map((m: Record<string, unknown>) => `${String(m.value)} ${String(m.label)}`).join(' · ')
    : '';

  return {
    id: String(data.id ?? `project-${now}`),
    name: String(data.title ?? 'Untitled Project'),
    shortDescription: String(data.shortDescription ?? ''),
    description: String(data.longDescription ?? data.description ?? ''),
    category,
    technologies: Array.isArray(data.technologies) ? data.technologies.map(String) : [],
    image: String(data.image ?? ''),
    images: asStringArray(data.images),
    githubUrl: String(data.githubUrl ?? ''),
    liveUrl: String(data.liveUrl ?? ''),
    status: String(data.status ?? 'Completed'),
    featured: Boolean(data.featured),
    completionDate: String(data.completionDate ?? yearDate),
    client: String(data.client ?? ''),
    projectType: String(data.projectType ?? ''),
    features: oldFeatures,
    challenges: String(data.challenge ?? data.challenges ?? ''),
    solutions: String(data.solution ?? data.solutions ?? ''),
    results: metrics || String(data.results ?? ''),
    createdAt: year ? new Date(year, 0, 1).getTime() : now,
    updatedAt: now,
    deletedAt: data.deletedAt ? Number(data.deletedAt) : null,
    isDeleted: Boolean(data.isDeleted),
  };
}

function loadWithMigration(): { active: Project[]; trash: Project[] } {
  const read = (key: string): Project[] => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(normalizeProjectRecord).filter((project): project is Project => Boolean(project)) : [];
    } catch {
      return [];
    }
  };

  let active = read(ACTIVE_KEY);
  let trash = read(TRASH_KEY);

  // Preserve previously added projects if the new storage is empty but legacy data exists.

  if (!active.length && !trash.length) {
    const oldActive = read(OLD_ACTIVE_KEY);
    const oldTrash = read(OLD_TRASH_KEY);
    if (oldActive.length || oldTrash.length) {
      active = oldActive.filter(p => !p.isDeleted);
      trash = oldTrash;
    }
  }

  return { active, trash };
}

function persist(key: string, projects: Project[]) {
  try {
    localStorage.setItem(key, JSON.stringify(projects));
  } catch (error) {
    console.error(`Failed to persist projects (${key}):`, error);
  }
}

export const Projects: React.FC = () => {
  const { playSound } = useTheme();

  const [activeProjects, setActiveProjects] = useState<Project[]>(() => loadWithMigration().active);
  const [trashProjects, setTrashProjects] = useState<Project[]>(() => loadWithMigration().trash);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<Project | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [showTrash, setShowTrash] = useState(false);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortKey, setSortKey] = useState('newest');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [moreMenuId, setMoreMenuId] = useState<string | null>(null);
  const [manageMenuOpen, setManageMenuOpen] = useState(false);

  const sortMenuRef = useRef<HTMLDivElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    persist(ACTIVE_KEY, activeProjects);
  }, [activeProjects]);

  useEffect(() => {
    persist(TRASH_KEY, trashProjects);
  }, [trashProjects]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoreMenuId(null);
        setSortMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!sortMenuOpen && !moreMenuId) return;
    const handleClick = (e: MouseEvent) => {
      if (!sortMenuRef.current?.contains(e.target as Node)) {
        setSortMenuOpen(false);
      }
      if (moreMenuId) {
        const menuEl = document.getElementById('more-' + moreMenuId);
        if (menuEl && !menuEl.contains(e.target as Node)) {
          setMoreMenuId(null);
        }
      }
    };
    const timer = setTimeout(() => window.addEventListener('click', handleClick), 30);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleClick);
    };
  }, [sortMenuOpen, moreMenuId]);

  const filteredAndSorted = () => {
    let list = activeProjects;

    if (activeFilter !== 'All') {
      list = list.filter(p => p.category === activeFilter);
    }

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(p => {
        const haystack = [
          p.name,
          p.shortDescription,
          p.description,
          p.category,
          p.client,
          p.projectType,
          ...p.technologies,
        ].join(' ').toLowerCase();
        return haystack.includes(q);
      });
    }

    const copy = [...list];
    if (sortKey === 'oldest') copy.sort((a, b) => a.createdAt - b.createdAt);
    else if (sortKey === 'az') copy.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortKey === 'za') copy.sort((a, b) => b.name.localeCompare(a.name));
    else if (sortKey === 'featured') copy.sort((a, b) => Number(b.featured) - Number(a.featured) || b.createdAt - a.createdAt);
    else if (sortKey === 'recent') copy.sort((a, b) => b.updatedAt - a.updatedAt);
    else copy.sort((a, b) => b.createdAt - a.createdAt);

    return copy;
  };

  const viewProjects = filteredAndSorted();
  const openAdd = () => {
    playSound('pop');
    setEditingProject(null);
    setFormOpen(true);
  };

  const openEdit = (project: Project) => {
    playSound('pop');
    setEditingProject(project);
    setMoreMenuId(null);
    setFormOpen(true);
  };

  const saveProject = (project: Project) => {
    const wasUpdate = activeProjects.some(p => p.id === project.id);
    setActiveProjects(prev => {
      const existing = prev.find(p => p.id === project.id);
      if (existing) {
        return prev.map(p => (p.id === project.id ? project : p));
      }
      return [project, ...prev];
    });
    setToast(`"${project.name}" ${wasUpdate ? 'updated' : 'added'}.`);
  };

  const requestDelete = (project: Project) => {
    setSelectedProject(null);
    setDeleteTarget(project);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const now = Date.now();
    const deleted = { ...deleteTarget, isDeleted: true, deletedAt: now, updatedAt: now };
    setActiveProjects(prev => prev.filter(p => p.id !== deleteTarget.id));
    setTrashProjects(prev => [deleted, ...prev]);
    setDeleteTarget(null);
    setToast(`"${deleteTarget.name}" moved to Trash.`);
  };

  const restoreProject = (project: Project) => {
    const restored = { ...project, isDeleted: false, deletedAt: null, updatedAt: Date.now() };
    setTrashProjects(prev => prev.filter(p => p.id !== project.id));
    setActiveProjects(prev => [restored, ...prev]);
    setToast(`"${project.name}" restored.`);
  };

  const confirmPermanentDelete = () => {
    if (!permanentDeleteTarget) return;
    setTrashProjects(prev => prev.filter(p => p.id !== permanentDeleteTarget.id));
    setPermanentDeleteTarget(null);
    setToast(`"${permanentDeleteTarget.name}" permanently deleted.`);
  };
const renderEmptyActive = () => (
    <motion.div
      key="empty"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="rounded-3xl bg-[#0C0C0C] border border-[#1F1F1F] p-10 text-center"
    >
      <div className="p-4 rounded-2xl bg-white/5 border border-[#27272A]">
        {query || activeFilter !== 'All' ? (
          <Eye className="w-8 h-8 text-[#A1A1AA]" />
        ) : (
          <Sparkles className="w-8 h-8 text-white" />
        )}
      </div>
      <h3 className="mt-4 text-xl font-semibold uppercase tracking-tight text-white">
        {query || activeFilter !== 'All' ? 'No projects found' : 'No projects yet'}
      </h3>
      <p className="mt-1 text-sm text-[#A1A1AA]">
        {query || activeFilter !== 'All'
          ? 'Try adjusting your search or filters.'
          : 'Projects you add will appear here.'}
      </p>
      {query || activeFilter !== 'All' ? (
        <button
          onClick={() => {
            setQuery('');
            setActiveFilter('All');
          }}
          className="mt-4 px-4 py-2 rounded-full bg-[#18181B] hover:bg-[#27272A] text-white text-xs font-semibold uppercase tracking-wider cursor-pointer"
        >
          Reset Search & Filters
        </button>
      ) : (
        <button
          onClick={openAdd}
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#A1A1AA] text-black text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>Add Your First Project</span>
        </button>
      )}
    </motion.div>
  );

  const renderTrash = () => (
    trashProjects.length === 0 ? (
      <motion.div
        key="trash-empty"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-[#0C0C0C] border border-[#1F1F1F] p-10 text-center"
      >
        <div className="p-4 rounded-2xl bg-white/5 border border-[#27272A]">
          <CheckCircle2 className="w-8 h-8 text-[#A1A1AA]" />
        </div>
        <h3 className="mt-4 text-xl font-semibold uppercase tracking-tight text-white">Trash is empty</h3>
        <p className="mt-1 text-sm text-[#A1A1AA]">Deleted projects will be kept here for recovery.</p>
        <button
          onClick={() => {
            playSound('click');
            setShowTrash(false);
          }}
          className="mt-4 px-4 py-2 rounded-full bg-[#18181B] hover:bg-[#27272A] text-white text-xs font-semibold uppercase tracking-wider cursor-pointer"
        >
          Back to Projects
        </button>
      </motion.div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {trashProjects.map((project, index) => (
          <motion.div
            key={project.id}
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, delay: (index % 3) * 0.06 }}
          >
            <div className="rounded-3xl bg-[#0C0C0C] border border-red-900/40 overflow-hidden">
              <div className="relative h-40 overflow-hidden bg-[#121214]">
                <img src={project.image} alt={project.name} className="w-full h-full object-cover object-center opacity-60" loading="lazy" />
                <div className="absolute inset-0 bg-black/40" />
                <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider bg-red-950/60 border border-red-800 text-red-300">
                  <Trash2 className="w-3 h-3" /> Deleted
                </span>
                {project.deletedAt && (
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] bg-[#0C0C0C] border border-[#1F1F1F] text-[#A1A1AA]">
                    <Clock className="w-3 h-3" /> {formatDate(new Date(project.deletedAt).toISOString())}
                  </span>
                )}
              </div>
              <div className="p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">{project.category}</p>
                <h3 className="mt-1 text-lg font-semibold text-white">{project.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-[#A1A1AA]">{project.shortDescription}</p>
                <div className="mt-3 flex items-center gap-2.5">
                  <button
                    onClick={() => restoreProject(project)}
                    className="px-3 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Restore
                  </button>
                  <button
                    onClick={() => setPermanentDeleteTarget(project)}
                    className="px-3 py-2 rounded-xl bg-red-950/50 hover:bg-red-700 hover:text-white border border-red-800 text-red-400 text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Forever
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )
  );
const renderCard = (project: Project) => {
    const featured = project.featured;
    return (
      <div className={`group rounded-3xl bg-[#0C0C0C] border border-[#1F1F1F] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_0_30px_rgba(255,255,255,0.12)] ${featured ? 'ring-1 ring-white/20' : ''}`}>
        {renderCardImage(project)}
        {renderCardBody(project)}
      </div>
    );
  };

  const renderCardImage = (project: Project) => (
    <div className="relative h-44 overflow-hidden bg-[#121214]">
      <img
        src={project.image}
        alt={project.name}
        className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-107"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/80 via-transparent to-transparent" />
      <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider bg-white text-[#000000] font-semibold shadow-md">
        {project.category}
      </div>
      {project.featured && (
        <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider bg-[#18181B] border border-[#27272A] text-[#A1A1AA]">
          <Star className="w-3 h-3" /> Featured
        </div>
      )}
      <button
        onClick={() => {
          playSound('click');
          setMoreMenuId(moreMenuId === project.id ? null : project.id);
        }}
        aria-label={`More options for ${project.name}`}
        className="absolute bottom-3 right-3 p-2 rounded-full bg-[#0C0C0C]/90 hover:bg-[#18181B] text-[#A1A1AA] hover:text-white border border-[#27272A] cursor-pointer"
      >
        <MoreVertical className="w-4.5 h-4.5" />
      </button>
      {isNewlyAdded(project) && ( 
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] bg-[#18181B] border border-[#27272A] text-[#A1A1AA]">
          <Sparkles className="w-3 h-3" /> New
        </span>
      )}
    </div>
  );
const renderCardBody = (project: Project) => (
    <div className="p-5">
      <h3 className="text-lg font-semibold text-white">{project.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-[#A1A1AA] leading-relaxed">{project.shortDescription}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {project.technologies.slice(0, 4).map(tech => (
          <span key={tech} className="px-2 py-1 rounded-lg bg-[#18181B] border border-[#27272A] text-[10px] text-[#C9C9CF]">
            {tech}
          </span>
        ))}
        {project.technologies.length > 4 && (
          <span className="px-2 py-1 rounded-lg bg-[#18181B] text-[10px] text-[#71717A]">
            +{project.technologies.length - 4}
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-[#71717A]">
        {project.status && (
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {project.status}
          </span>
        )}
        {project.completionDate && (
          <span className="inline-flex items-center gap-1">
            <CalendarRange className="w-3 h-3" /> {formatDate(project.completionDate)}
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <a
          href={project.githubUrl || `https://github.com/thabolanez4/${project.id}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`GitHub repository for ${project.name}`}
          className="px-3 py-2 rounded-xl bg-[#0C0C0C] hover:bg-[#18181B] text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 border border-[#1F1F1F] hover:border-white"
        >
          <Github className="w-3.5 h-3.5" /> GitHub
        </a>
        <a
          href={project.liveUrl || 'https://github.com/thabolanez4'}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Live demo for ${project.name}`}
          className="px-3 py-2 rounded-xl bg-white hover:bg-[#A1A1AA] text-[#000000] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md hover:scale-105"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Demo
        </a>
        <button
          onClick={() => {
            playSound('click');
            setSelectedIndex(viewProjects.findIndex(p => p.id === project.id));
            setSelectedProject(project);
          }}
          className="px-3 py-2 rounded-xl bg-[#121214] hover:bg-[#18181B] hover:text-white border border-[#27272A] text-[#71717A] text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" /> Details
        </button>
      </div>
      {moreMenuId === project.id && (
        <div id={`more-${project.id}`} className="mt-3 rounded-xl bg-[#0C0C0C] border border-[#27272A] p-1.5">
          <button
            onClick={() => openEdit(project)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs text-[#A1A1AA] hover:bg-[#18181B] hover:text-white cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit Project
          </button>
          <button
            onClick={() => {
              setMoreMenuId(null);
              setSelectedIndex(viewProjects.findIndex(p => p.id === project.id));
              setSelectedProject(project);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs text-[#A1A1AA] hover:bg-[#18181B] hover:text-white cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" /> View Details
          </button>
          <button
            onClick={() => {
              setMoreMenuId(null);
              requestDelete(project);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs text-red-400 hover:bg-red-950/40 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
const renderDeleteConfirm = () => (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
      onClick={() => setDeleteTarget(null)}
    >
      <div onClick={e => e.stopPropagation()} className="w-full max-w-md bg-[#0C0C0C] border border-[#27272A] rounded-2xl p-6 shadow-2xl text-white space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800 text-red-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold uppercase tracking-tight">Move to Trash?</h3>
              <p className="text-xs text-[#71717A]">This project can still be restored.</p>
            </div>
          </div>
          <button
            onClick={() => setDeleteTarget(null)}
            aria-label="Close"
            className="p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-[#18181B] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-[#A1A1AA] leading-relaxed">
          Move <strong className="text-white">"{deleteTarget?.name}"</strong> to Trash? Its images, links, and details are preserved.
        </p>
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            onClick={() => setDeleteTarget(null)}
            className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white text-xs font-semibold uppercase tracking-wider cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Move to Trash
          </button>
        </div>
      </div>
    </div>
  );

  const renderPermanentDeleteConfirm = () => (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
      onClick={() => setPermanentDeleteTarget(null)}
    >
      <div onClick={e => e.stopPropagation()} className="w-full max-w-md bg-[#0C0C0C] border border-red-900/60 rounded-2xl p-6 shadow-2xl text-white space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800 text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold uppercase tracking-tight">Permanent Delete</h3>
              <p className="text-xs text-[#71717A]">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={() => setPermanentDeleteTarget(null)}
            aria-label="Close"
            className="p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-[#18181B] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-[#A1A1AA] leading-relaxed">
          Permanently delete <strong className="text-white">"{permanentDeleteTarget?.name}"</strong>? This removes its data and images forever.

        </p>
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            onClick={() => setPermanentDeleteTarget(null)}
            className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white text-xs font-semibold uppercase tracking-wider cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={confirmPermanentDelete}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Delete Forever
          </button>
        </div>
      </div>
    </div>
  );

  const renderToast = () => (
    <div
      ref={toastRef}
      role="status"
      className="fixed bottom-6 right-6 z-[90] inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#0C0C0C] border border-[#27272A] shadow-2xl text-white text-sm"
    >
      <CheckCircle2 className="w-4 h-4 text-[#A1A1AA]" />
      <span>{toast}</span>
    </div>
  );
return (
    <section id="projects" className="scroll-mt-24 w-full py-24 text-left">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-14">
        <div className="flex items-center gap-4">
          <span className="p-3 rounded-2xl bg-white/10 border border-[#27272A]">
            <Box className="w-7 h-7 text-white" />
          </span>
          <div>
            <h2 className="text-4xl sm:text-5xl font-semibold uppercase tracking-tight text-white">
              Projects
            </h2>
            <p className="mt-1 text-sm sm:text-base text-[#A1A1AA] max-w-2xl">
              Selected projects I have built — a living portfolio I manage directly.

            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-sm text-[#A1A1AA]">
            {showTrash ? (
              <>
                <Trash2 className="w-4 h-4 text-red-400" />
                <span className="font-semibold text-red-300">{trashProjects.length}</span>
                <span>in Trash</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span className="font-semibold text-white">{activeProjects.length}</span>
                <span>{activeProjects.length === 1 ? 'project' : 'projects'}</span>
                {trashProjects.length > 0 && (
                  <span className="text-xs text-[#71717A]">· {trashProjects.length} in Trash</span>
                )}
              </>
            )}
          </div>
<div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search projects…"
                aria-label="Search projects"
                className="pl-9 pr-3 py-2 rounded-xl bg-[#000000] border border-[#1F1F1F] focus:border-white focus:outline-none text-white text-xs w-44 sm:w-52"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {FILTERS.map(filter => (
                <button
                  key={filter}
                  onClick={() => {
                    playSound('click');
                    setActiveFilter(filter);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    activeFilter === filter
                      ? 'bg-white text-[#000000] shadow-md'
                      : 'bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white border border-[#27272A]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
<div className="relative" ref={sortMenuRef}>
              <button
                onClick={() => {
                  playSound('click');
                  setSortMenuOpen(!sortMenuOpen);
                }}
                aria-label="Sort projects"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-xs text-[#A1A1AA] hover:text-white border border-[#27272A] cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{SORTS.find(s => s.key === sortKey)?.label}</span>
                {sortMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-1.5 w-52 bg-[#0C0C0C] border border-[#1F1F1F] rounded-xl shadow-2xl p-1.5">
                    {SORTS.map(sort => {
                      const Icon = sort.Icon;
                      return (
                        <button
                          key={sort.key}
                          onClick={() => {
                            playSound('click');
                            setSortKey(sort.key);
                            setSortMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                            sortKey === sort.key
                              ? 'bg-white/15 text-white'
                              : 'hover:bg-[#18181B] text-[#A1A1AA]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{sort.label}</span>
                          {sortKey === sort.key && <CheckCircle2 className="w-3.5 h-3.5 ml-auto" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </button>
            </div>

            <button
              onClick={() => {
                playSound('click');
                setShowTrash(!showTrash);
                setMoreMenuId(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
            >
              <Archive className={`w-3.5 h-3.5 ${showTrash ? 'text-red-400' : 'text-[#A1A1AA]'}`} />
              <span className={showTrash ? 'text-red-300' : 'text-[#A1A1AA]'}>
                {showTrash ? 'Active Projects' : 'Trash'}
              </span>
            </button>

            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#A1A1AA] text-black text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>Add Project</span>
            </button>
          </div>
        </div>
      </div>
<div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-14 mt-10">
        {showTrash ? (
          renderTrash()
        ) : (
          viewProjects.length === 0 ? (
            renderEmptyActive()
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              <AnimatePresence>
                {viewProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3, delay:(index % 3) * 0.06 }}
                  >
                    {renderCard(project)}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )
        )}
      </div>
{deleteTarget && renderDeleteConfirm()}
      {permanentDeleteTarget && renderPermanentDeleteConfirm()}
      {toast && renderToast()}

      <ProjectFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSaveProject={saveProject}
        editingProject={editingProject}
        existingProjects={activeProjects}
      />

      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onEditProject={openEdit}
        onRequestDelete={requestDelete}
        onPrev={() => {
          const next = selectedIndex > 0 ? selectedIndex - 1 : viewProjects.length - 1;
          setSelectedIndex(next);
          setSelectedProject(viewProjects[next]);
        }}
        onNext={() => {
          const next = selectedIndex < viewProjects.length - 1 ? selectedIndex + 1 : 0;
          setSelectedIndex(next);
          setSelectedProject(viewProjects[next]);
        }}
        hasPrev={viewProjects.length > 1}
        hasNext={viewProjects.length > 1}
      />
    </section>
  );
};
