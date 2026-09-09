import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Upload, Image as ImageIcon } from 'lucide-react';
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
  const [image, setImage] = useState(editing?.image || '');
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
        image: image.trim(),
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

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast('Image file size should be less than 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      const result = ev.target?.result as string;
      if (result) {
        setImage(result);
        toast('Image attached successfully!', 'success');
      }
    };
    reader.readAsDataURL(file);
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
              <p className="text-xs text-zinc-400">Fill in the details and attach an image to feature this project.</p>
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
          {/* Attach Image Section */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Project Image</span>
            {image ? (
              <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-white/10 bg-black/50 group">
                <img src={image} alt="Project Attachment Preview" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-red-700 transition-colors flex items-center gap-1"
                  >
                    <X className="h-3.5 w-3.5" /> Remove Image
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-black/40 p-5 text-center transition-all hover:border-white/40 hover:bg-white/5">
                  <Upload className="h-6 w-6 text-zinc-400 mb-2" />
                  <span className="text-xs font-semibold text-white">Click to attach image file</span>
                  <span className="mt-1 text-[10px] text-zinc-500">PNG, JPG, WebP, GIF up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileAttach}
                  />
                </label>

                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <span className="h-px flex-1 bg-white/10" />
                  <span>or paste image URL</span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>

                <div className="relative">
                  <ImageIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="url"
                    value={image}
                    onChange={e => setImage(e.target.value)}
                    placeholder="https://example.com/project-image.png"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/30"
                  />
                </div>
              </div>
            )}
          </div>

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
