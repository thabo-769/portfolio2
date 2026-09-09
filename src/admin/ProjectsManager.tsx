import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ExternalLink,
  FolderKanban,
  Github,
  Plus,
  Search,
  Trash2,
  Edit2,
  Sparkles,
} from 'lucide-react';
import { usePortfolioCms } from '../context/PortfolioCmsContext';
import { useToast } from './ToastContext';
import type { Project } from '../types';
import { ProjectForm } from './ProjectForm';

export const ProjectsManager: React.FC = () => {
  const { projects, deleteProject } = usePortfolioCms();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>(['All']);
    projects.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.technologies.some(t => t.toLowerCase().includes(term));
      return matchesCategory && matchesSearch;
    });
  }, [projects, search, filterCategory]);

  const handleOpenAdd = () => {
    setEditingProject(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setFormOpen(true);
  };

  const handleDelete = async (project: Project) => {
    if (!window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      return;
    }
    setDeletingId(project.id);
    try {
      await deleteProject(project.id);
      toast(`Project "${project.name}" deleted.`, 'success');
    } catch (err) {
      toast('Failed to delete project.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
            <FolderKanban className="h-3.5 w-3.5" />
            Projects
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Projects Manager</h1>
          <p className="max-w-xl text-sm leading-relaxed text-zinc-400">
            Manage your live portfolio projects. Add custom projects or delete any project from public display.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-black transition-all hover:bg-zinc-200 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Add New Project
        </button>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects by name, description, or technology..."
            className="w-full rounded-2xl border border-white/10 bg-[#0C0C0C] py-3 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-white/30"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                filterCategory === cat
                  ? 'bg-white text-black font-semibold'
                  : 'border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-black/20 text-center">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-zinc-400">
            <FolderKanban className="h-8 w-8" />
          </div>
          <p className="mt-4 text-sm font-semibold text-white">No projects found</p>
          <p className="mt-1 text-xs text-zinc-500">
            {search ? 'Try clearing your search query' : 'Click "Add New Project" to add a custom project!'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project, index) => {
            const isCustom = project.id.startsWith('custom-');

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.2 }}
                className="group relative flex flex-col justify-between rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-5 transition-all hover:border-white/20"
              >
                <div>
                  {/* Badges Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-300">
                      {project.category || 'Project'}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        isCustom
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {isCustom ? <Sparkles className="h-3 w-3" /> : <Github className="h-3 w-3" />}
                      {isCustom ? 'Custom' : 'GitHub'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold tracking-tight text-white group-hover:text-zinc-100">
                    {project.name}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-400 line-clamp-3">
                    {project.shortDescription || project.description}
                  </p>

                  {/* Technologies */}
                  {project.technologies.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {project.technologies.slice(0, 4).map(tech => (
                        <span
                          key={tech}
                          className="rounded-md border border-white/5 bg-black/40 px-2 py-0.5 text-[10px] text-zinc-400"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 4 && (
                        <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-500">
                          +{project.technologies.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Links & Actions */}
                <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-400 hover:text-white transition-colors"
                        title="Live Demo"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-400 hover:text-white transition-colors"
                        title="GitHub Repository"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(project)}
                      className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-300 transition-colors hover:bg-white hover:text-black"
                      title="Edit project"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(project)}
                      disabled={deletingId === project.id}
                      className="rounded-full border border-red-500/20 bg-red-500/10 p-2 text-red-300 transition-colors hover:bg-red-500 hover:text-white disabled:opacity-50"
                      title="Delete project"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Project Form Modal */}
      {formOpen && (
        <ProjectForm
          editing={editingProject}
          onClose={() => {
            setFormOpen(false);
            setEditingProject(null);
          }}
        />
      )}
    </div>
  );
};

export default ProjectsManager;
