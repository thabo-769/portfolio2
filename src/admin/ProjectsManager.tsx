import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpDown,
  Eye,
  ExternalLink,
  FolderKanban,
  Github,
  GripVertical,
  Loader2,
  PackageOpen,
  Pencil,
  Plus,
  Search,
  Star,
  ToggleLeft,
  ToggleRight,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { usePortfolioCms } from '../context/PortfolioCmsContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ToastContext';
import { Project } from '../types';
import { ProjectDetailModal } from '../components/UI/ProjectDetailModal';

type FilterKey = 'all' | 'personal' | 'business' | 'mobile' | 'gift' | 'published' | 'draft' | 'featured';

function formatAddedDate(value: number): string {
  if (!value) return 'Unknown';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

interface ProjectsManagerProps {
  onAdd: () => void;
  onEdit: (project: Project) => void;
}

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({ onAdd, onEdit }) => {
  const {
    projects,
    loading,
    notConfigured,
    migrateLocalProjectsToFirebase,
    trashProject,
    toggleProjectFeatured,
    toggleProjectStatus,
    reorderProjects,
    logActivity,
  } = usePortfolioCms();
  const { user, isAuthorized } = useAuth();
  const { toast } = useToast();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [selected, setSelected] = useState<Project | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [migrating, setMigrating] = useState(false);

  const handleMigrateLocalProjects = async () => {
    setMigrating(true);
    try {
      const count = await migrateLocalProjectsToFirebase();
      toast(`${count} local project${count === 1 ? '' : 's'} copied to Firebase.`, 'success');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to copy local projects to Firebase.', 'error');
    } finally {
      setMigrating(false);
    }
  };

  const activeProjects = useMemo(
    () => projects.filter(project => !project.isDeleted).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
    [projects]
  );

  const filteredProjects = useMemo(() => {
    let list = activeProjects;

    if (filter === 'personal' || filter === 'business' || filter === 'mobile' || filter === 'gift') {
      list = list.filter(project => project.category === filter.charAt(0).toUpperCase() + filter.slice(1));
    } else if (filter === 'published') {
      list = list.filter(project => project.status === 'Published');
    } else if (filter === 'draft') {
      list = list.filter(project => project.status === 'Draft');
    } else if (filter === 'featured') {
      list = list.filter(project => project.featured);
    }

    const term = query.trim().toLowerCase();
    if (term) {
      list = list.filter(project => {
        const haystack = [
          project.name,
          project.shortDescription,
          project.description,
          project.category,
          project.client,
          project.projectType,
          project.githubUrl,
          project.liveUrl,
          ...(project.technologies ?? []),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(term);
      });
    }

    return list;
  }, [activeProjects, filter, query]);

  const filters: Array<{ key: FilterKey; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'personal', label: 'Personal' },
    { key: 'business', label: 'Business' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'gift', label: 'Gift' },
    { key: 'published', label: 'Published' },
    { key: 'draft', label: 'Draft' },
    { key: 'featured', label: 'Featured' },
  ];

  const canReorder = filter === 'all' && !query.trim();

  const handleDrop = async (targetId: string) => {
    if (!dragId || dragId === targetId || !canReorder) return;
    const next = [...filteredProjects];
    const fromIndex = next.findIndex(project => project.id === dragId);
    const toIndex = next.findIndex(project => project.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;

    const reordered = [...activeProjects];
    const dragged = reordered.findIndex(project => project.id === dragId);
    const target = reordered.findIndex(project => project.id === targetId);
    if (dragged < 0 || target < 0) return;

    const [moved] = reordered.splice(dragged, 1);
    reordered.splice(target, 0, moved);
    setBusyId(moved.id);
    try {
      await reorderProjects(reordered.map(project => project.id));
      await logActivity({
        action: 'Project reordered',
        item: moved.name,
        itemType: 'project',
        user: 'Administrator',
        details: `Moved from position ${dragged + 1} to ${target + 1}`,
      });
      toast('Project order updated.', 'success');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to update project order.', 'error');
    } finally {
      setBusyId(null);
      setDragId(null);
    }
  };

  const handleToggleFeatured = async (project: Project) => {
    setBusyId(project.id);
    try {
      await toggleProjectFeatured(project.id, !project.featured);
      await logActivity({
        action: project.featured ? 'Project unfeatured' : 'Project featured',
        item: project.name,
        itemType: 'project',
        user: 'Administrator',
      });
      toast(project.featured ? 'Project unfeatured.' : 'Project featured.', 'info');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to update featured state.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleStatus = async (project: Project) => {
    const nextStatus = project.status === 'Published' ? 'Draft' : 'Published';
    setBusyId(project.id);
    try {
      await toggleProjectStatus(project.id, nextStatus);
      await logActivity({
        action: nextStatus === 'Published' ? 'Project published' : 'Project unpublished',
        item: project.name,
        itemType: 'project',
        user: 'Administrator',
      });
      toast(nextStatus === 'Published' ? 'Project published.' : 'Project saved as draft.', 'success');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to update project status.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleTrash = async (project: Project) => {
    setBusyId(project.id);
    try {
      await trashProject(project.id);
      await logActivity({
        action: 'Project moved to trash',
        item: project.name,
        itemType: 'project',
        user: 'Administrator',
      });
      toast('Project moved to trash.', 'success');
      if (selected?.id === project.id) setSelected(null);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to move project to trash.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const selectedIndex = selected ? filteredProjects.findIndex(project => project.id === selected.id) : -1;

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-[1.75rem] border border-white/10 bg-white/5 py-20 text-zinc-300">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
            <FolderKanban className="h-3.5 w-3.5" />
            Projects
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Project management</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
            Add, edit, publish, feature, reorder, and trash projects. The order here is the order that the public portfolio uses.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!notConfigured && user && isAuthorized && (
            <button
              type="button"
              onClick={handleMigrateLocalProjects}
              disabled={migrating}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/10 disabled:cursor-wait disabled:opacity-60"
            >
              {migrating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              Copy local projects
            </button>
          )}
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-zinc-100"
          >
            <Plus className="h-4 w-4" />
            Add project
          </button>
        </div>

      </div>

      <div className="flex flex-col gap-3 rounded-[1.75rem] border border-white/10 bg-white/5 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search projects"
            className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-11 pr-10 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-white/25"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-500 hover:bg-white/5 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map(item => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`rounded-full border px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-all ${
                filter === item.key
                  ? 'border-white bg-white text-black'
                  : 'border-white/10 bg-black/20 text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <ArrowUpDown className="h-3.5 w-3.5" />
        {canReorder ? 'Drag rows to reorder projects.' : 'Clear search and return to All to reorder projects.'}
      </div>

      {filteredProjects.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-black/20 text-center">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-zinc-300">
            <PackageOpen className="h-8 w-8" />
          </div>
          <p className="mt-4 text-sm font-medium text-white">No projects found</p>
          <p className="mt-2 max-w-sm text-sm text-zinc-500">
            {query ? 'Try a different search term.' : 'Create your first project to populate the dashboard and public portfolio.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-black/30 text-left text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                <tr>
                  <th className="px-4 py-4">Order</th>
                  <th className="px-4 py-4">Project</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Links</th>
                  <th className="px-4 py-4">Added</th>
                  <th className="px-4 py-4">Featured</th>
                  <th className="px-4 py-4">Tech</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredProjects.map((project, index) => (
                  <motion.tr
                    key={project.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                    draggable={canReorder}
                    onDragStart={() => setDragId(project.id)}
                    onDragEnd={() => setDragId(null)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => void handleDrop(project.id)}
                    className={`group bg-black/10 transition-colors hover:bg-white/5 ${
                      dragId === project.id ? 'ring-1 ring-white/40' : ''
                    }`}
                  >
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="cursor-grab rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400"
                          aria-label="Drag to reorder"
                          title="Drag to reorder"
                        >
                          <GripVertical className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-medium text-white">{project.displayOrder ?? index + 1}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-start gap-3">
                        <div className="h-14 w-20 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                          {project.image ? (
                            <img src={project.image} alt={project.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-zinc-600">
                              <FolderKanban className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <button
                            onClick={() => setSelected(project)}
                            className="text-left text-sm font-semibold text-white transition-colors hover:text-zinc-300"
                          >
                            {project.name}
                          </button>
                          <p className="mt-1 line-clamp-2 max-w-xl text-sm text-zinc-400">
                            {project.shortDescription || project.description}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-zinc-500">
                            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                              {project.category}
                            </span>
                            {project.client && (
                              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                                {project.client}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <button
                        onClick={() => void handleToggleStatus(project)}
                        disabled={busyId === project.id}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition-all ${
                          project.status === 'Published'
                            ? 'border-white/10 bg-white text-black'
                            : 'border-white/10 bg-black/20 text-zinc-300 hover:bg-white/5'
                        }`}
                      >
                        {project.status}
                      </button>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/20 px-2.5 py-1.5 text-[11px] text-zinc-300 hover:bg-white/10 hover:text-white"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Live
                          </a>
                        )}
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/20 px-2.5 py-1.5 text-[11px] text-zinc-300 hover:bg-white/10 hover:text-white"
                          >
                            <Github className="h-3.5 w-3.5" />
                            GitHub
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top text-sm text-zinc-400">
                      {formatAddedDate(project.createdAt)}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <button
                        onClick={() => void handleToggleFeatured(project)}
                        disabled={busyId === project.id}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300 transition-all hover:bg-white/5 hover:text-white"
                      >
                        <Star className={`h-3.5 w-3.5 ${project.featured ? 'fill-white text-white' : ''}`} />
                        {project.featured ? 'Featured' : 'Normal'}
                      </button>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex max-w-xs flex-wrap gap-2">
                        {project.technologies.slice(0, 4).map(tech => (
                          <span
                            key={tech}
                            className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-zinc-300"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 4 && (
                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-zinc-500">
                            +{project.technologies.length - 4}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setSelected(project)}
                          className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-300 transition-all hover:bg-white hover:text-black"
                          aria-label="Preview project"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEdit(project)}
                          className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-300 transition-all hover:bg-white hover:text-black"
                          aria-label="Edit project"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => void handleTrash(project)}
                          disabled={busyId === project.id}
                          className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-300 transition-all hover:bg-white hover:text-black"
                          aria-label="Move project to trash"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ProjectDetailModal
        project={selected}
        onClose={() => setSelected(null)}
        onEditProject={project => {
          setSelected(null);
          onEdit(project);
        }}
        onRequestDelete={project => void handleTrash(project)}
        onPrev={() => {
          if (selectedIndex > 0) setSelected(filteredProjects[selectedIndex - 1]);
        }}
        onNext={() => {
          if (selectedIndex >= 0 && selectedIndex < filteredProjects.length - 1) {
            setSelected(filteredProjects[selectedIndex + 1]);
          }
        }}
        hasPrev={selectedIndex > 0}
        hasNext={selectedIndex >= 0 && selectedIndex < filteredProjects.length - 1}
      />
    </div>
  );
};

export default ProjectsManager;
