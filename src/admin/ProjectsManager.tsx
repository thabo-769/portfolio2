import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  X,
  Plus,
  Pencil,
  Trash2,
  Star,
  ExternalLink,
  Github,
  FolderKanban,
  Loader2,
  Clock,
  PackageOpen,
} from 'lucide-react';
import { Project } from '../types';

type FilterKey = 'all' | 'published' | 'draft' | 'featured';
type SortKey = 'newest' | 'oldest' | 'az';

interface ProjectsManagerProps {
  projects: Project[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (project: Project) => void;
  onTrash: (project: Project) => void;
}

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({
  projects,
  loading,
  onAdd,
  onEdit,
  onTrash,
}) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [sort, setSort] = useState<SortKey>('newest');

  const viewed = useMemo(() => {
    let list = projects;
    if (filter === 'published') list = list.filter(p => p.status === 'Published');
    else if (filter === 'draft') list = list.filter(p => p.status === 'Draft');
    else if (filter === 'featured') list = list.filter(p => p.featured);

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(p => {
        const hay = [
          p.name,
          p.description,
          p.shortDescription,
          p.category,
          p.client,
          p.projectType,
          ...p.technologies,
        ].join(' ').toLowerCase();
        return hay.includes(q);
      });
    }

    const copy = [...list];
    if (sort === 'oldest') copy.sort((a, b) => a.createdAt - b.createdAt);
    else if (sort === 'az') copy.sort((a, b) => a.name.localeCompare(b.name));
    else copy.sort((a, b) => b.createdAt - a.createdAt);
    return copy;
  }, [projects, query, filter, sort]);

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'published', label: 'Published' },
    { key: 'draft', label: 'Draft' },
    { key: 'featured', label: 'Featured' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-[#16A34A]">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111827]">Projects</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {projects.length} project{projects.length === 1 ? '' : 's'} · synced with Firebase
          </p>
        </div>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-semibold shadow-lg shadow-[#16A34A]/30 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      {/* Search + filters + sort */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, category, or technology…"
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[#D1D5DB] focus:border-[#16A34A] focus:ring-2 focus:ring-[#22C55E]/30 focus:outline-none text-sm bg-white text-[#111827] transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#16A34A] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-[#D1D5DB] bg-white p-1">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filter === f.key
                  ? 'bg-[#16A34A] text-white'
                  : 'text-[#6B7280] hover:bg-[#F0FDF4] hover:text-[#16A34A]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortKey)}
          className="px-3 py-2 rounded-xl border border-[#D1D5DB] bg-white text-sm text-[#374151] focus:border-[#16A34A] focus:outline-none cursor-pointer"
          aria-label="Sort projects"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="az">Alphabetical</option>
        </select>
      </div>

      {viewed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-[#DCFCE7]">
          <div className="p-4 rounded-2xl bg-[#F0FDF4] text-[#16A34A] mb-4">
            <PackageOpen className="w-8 h-8" />
          </div>
          <p className="font-semibold text-[#111827]">No projects found</p>
          <p className="text-sm text-[#6B7280] mt-1 max-w-sm">
            {query ? 'Try a different search.' : 'Add your first project to see it here and on your portfolio.'}
          </p>
          {!query && (
            <button
              onClick={onAdd}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-semibold transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {viewed.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i % 6) * 0.04, duration: 0.3 }}
              className="bg-white rounded-2xl border border-[#DCFCE7] shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-36 bg-[#F0FDF4]">
                {project.image && !project.image.startsWith('gs://') ? (
                  <img src={project.image} alt={project.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#16A34A]/40">
                    <FolderKanban className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute top-2.5 right-2.5 flex gap-1.5">
                  {project.featured && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#16A34A] text-white text-[10px] font-bold uppercase">
                      <Star className="w-3 h-3 fill-current" /> Featured
                    </span>
                  )}
                  <span
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                      project.status === 'Published'
                        ? 'bg-[#DCFCE7] text-[#15803D]'
                        : 'bg-[#F3F4F6] text-[#6B7280]'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-[#111827] leading-tight">{project.name}</h3>
                <p className="text-xs text-[#6B7280] mt-0.5">{project.category}</p>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {project.technologies.slice(0, 3).map(tech => (
                    <span key={tech} className="px-2 py-0.5 rounded-md bg-[#F0FDF4] text-[#15803D] text-[10px] font-semibold">
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="px-2 py-0.5 rounded-md bg-[#F3F4F6] text-[#6B7280] text-[10px] font-semibold">
                      +{project.technologies.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-[#F0FDF4]">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub"
                        className="p-2 rounded-lg text-[#6B7280] hover:text-[#16A34A] hover:bg-[#F0FDF4]"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Live website"
                        className="p-2 rounded-lg text-[#6B7280] hover:text-[#16A34A] hover:bg-[#F0FDF4]"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => onEdit(project)}
                      aria-label="Edit project"
                      className="p-2 rounded-lg text-[#6B7280] hover:text-[#15803D] hover:bg-[#F0FDF4] cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onTrash(project)}
                      aria-label="Move to trash"
                      className="p-2 rounded-lg text-[#6B7280] hover:text-[#374151] hover:bg-[#F3F4F6] cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsManager;