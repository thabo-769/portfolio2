import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { usePortfolioCms } from '../context/PortfolioCmsContext';
import { useToast } from './ToastContext';
import type { Project, ProjectCategory } from '../types';

interface ProjectFormProps {
  editing: Project | null;
  onClose: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ editing, onClose }) => {
  const { saveProject } = usePortfolioCms();
  const { toast } = useToast();

  const [name, setName] = useState(editing?.name || '');
  const [description, setDescription] = useState(editing?.description || editing?.shortDescription || '');
  const [category, setCategory] = useState<ProjectCategory>((editing?.category as ProjectCategory) || 'Personal');
  const [technologiesText, setTechnologiesText] = useState(editing?.technologies ? editing.technologies.join(', ') : '');
  const [githubUrl, setGithubUrl] = useState(editing?.githubUrl || '');
  const [liveUrl, setLiveUrl] = useState(editing?.liveUrl || '');
  const [featured, setFeatured] = useState<boolean>(editing?.featured ?? true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast('Please provide a project name.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const technologies = technologiesText
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      await saveProject({
        id: editing?.id,
        name: name.trim(),
        shortDescription: description.trim(),
        description: description.trim(),
        category,
        technologies,
        githubUrl: githubUrl.trim(),
        liveUrl: liveUrl.trim(),
        featured,
      });

      toast(editing ? 'Project updated!' : 'New project added successfully!', 'success');
      onClose();
    } catch (err) {
      toast('Error saving project.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[2rem] border border-white/10 bg-[#0A0A0B] p-6 text-white shadow-2xl sm:p-8"
      >
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{editing ? 'Edit Project' : 'Add New Project'}</h2>
              <p className="text-xs text-zinc-400">Fill in the details to feature this project on your portfolio.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400 hover:bg-white hover:text-black transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Project Name *</span>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. AI Portfolio Dashboard"
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/30"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Description</span>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief summary of the project architecture and features..."
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/30"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Category</span>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ProjectCategory)}
                className="w-full rounded-2xl border border-white/10 bg-[#121214] px-4 py-3 text-sm text-white outline-none focus:border-white/30"
              >
                <option value="Personal">Personal</option>
                <option value="Business">Business</option>
                <option value="Mobile">Mobile</option>
                <option value="Gift">Gift</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Technologies</span>
              <input
                type="text"
                value={technologiesText}
                onChange={e => setTechnologiesText(e.target.value)}
                placeholder="React, TypeScript, Node.js"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/30"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">GitHub Repository URL</span>
              <input
                type="url"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                placeholder="https://github.com/thabo-769/repo"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/30"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Live Demo URL</span>
              <input
                type="url"
                value={liveUrl}
                onChange={e => setLiveUrl(e.target.value)}
                placeholder="https://my-demo.vercel.app"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/30"
              />
            </label>
          </div>

          <label className="flex items-center gap-3 pt-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={featured}
              onChange={e => setFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-black accent-white"
            />
            <span className="text-xs font-medium text-zinc-300">Feature this project prominently</span>
          </label>

          <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition-all hover:bg-zinc-200 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editing ? 'Update Project' : 'Save Project'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProjectForm;
