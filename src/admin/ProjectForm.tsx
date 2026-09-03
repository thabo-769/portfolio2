import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Loader2, Star, Save } from 'lucide-react';
import { Project } from '../types';
import { useToast } from './ToastContext';
import { CreateProjectInput } from '../firebase/projectsService';

export interface ProjectSavePayload extends CreateProjectInput {
  imageFile: File | null;
}

interface ProjectFormProps {
  editing: Project | null;
  onClose: () => void;
  onSave: (payload: ProjectSavePayload, reportProgress: (pct: number) => void) => Promise<void>;
}

interface FormState {
  name: string;
  description: string;
  category: string;
  technologies: string;
  githubUrl: string;
  liveUrl: string;
  featured: boolean;
  status: 'Published' | 'Draft';
}

function buildInitial(editing: Project | null): FormState {
  if (!editing) {
    return {
      name: '',
      description: '',
      category: 'Personal',
      technologies: '',
      githubUrl: '',
      liveUrl: '',
      featured: false,
      status: 'Published',
    };
  }
  const statusValue =
    editing.status === 'Published' || editing.status === 'Draft' ? editing.status : 'Published';
  return {
    name: editing.name,
    description: editing.description,
    category: editing.category,
    technologies: editing.technologies.join(', '),
    githubUrl: editing.githubUrl,
    liveUrl: editing.liveUrl,
    featured: editing.featured,
    status: statusValue as 'Published' | 'Draft',
  };
}

const CATEGORIES = ['Personal', 'Business', 'Mobile', 'Gift', 'Other'];

function isValidUrl(value: string): boolean {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ editing, onClose, onSave }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(() => buildInitial(editing));
  const [imagePreview, setImagePreview] = useState<string>(
    editing?.image && !editing.image.startsWith('gs://') ? editing.image : ''
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (patch: Partial<FormState>) => setForm(prev => ({ ...prev, ...patch }));

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Please choose a valid image file.', 'warning');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(String(reader.result ?? ''));
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Project title is required.';
    if (!form.description.trim()) next.description = 'A description is required.';
    if (form.githubUrl && !isValidUrl(form.githubUrl)) next.githubUrl = 'Enter a valid https:// URL.';
    if (form.liveUrl && !isValidUrl(form.liveUrl)) next.liveUrl = 'Enter a valid https:// URL.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast('Please fix the highlighted fields.', 'warning');
      return;
    }
    setSaving(true);
    setUploadProgress(0);
    try {
      const payload: ProjectSavePayload = {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        technologies: form.technologies
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
        githubUrl: form.githubUrl.trim(),
        liveUrl: form.liveUrl.trim(),
        featured: form.featured,
        status: form.status,
        imageFile,
      };
      await onSave(payload, pct => setUploadProgress(pct));
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Something went wrong. Please try again.', 'error');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.24 }}
        className="relative w-full max-w-3xl bg-white rounded-3xl border border-[#DCFCE7] shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-form-title"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#DCFCE7] bg-[#F0FDF4]">
          <div>
            <h2 id="project-form-title" className="text-lg font-bold text-[#111827]">
              {editing ? 'Edit Project' : 'Add New Project'}
            </h2>
            <p className="text-xs text-[#6B7280]">Changes sync to Firebase and the public portfolio automatically.</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close form"
            className="p-2 rounded-xl text-[#6B7280] hover:text-[#16A34A] hover:bg-[#DCFCE7] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#374151]">Project Title</label>
            <input
              type="text"
              value={form.name}
              onChange={e => update({ name: e.target.value })}
              placeholder="e.g. E-commerce Platform"
              className="w-full px-4 py-3 rounded-xl border border-[#D1D5DB] focus:border-[#16A34A] focus:ring-2 focus:ring-[#22C55E]/30 focus:outline-none text-sm text-[#111827] transition-all"
            />
            {errors.name && <p className="text-xs text-[#15803D]">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#374151]">Description</label>
            <textarea
              value={form.description}
              onChange={e => update({ description: e.target.value })}
              placeholder="Describe the project, your role, and the result."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-[#D1D5DB] focus:border-[#16A34A] focus:ring-2 focus:ring-[#22C55E]/30 focus:outline-none text-sm text-[#111827] transition-all resize-y"
            />
            {errors.description && <p className="text-xs text-[#15803D]">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#374151]">Category</label>
              <select
                value={form.category}
                onChange={e => update({ category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#D1D5DB] focus:border-[#16A34A] focus:outline-none text-sm text-[#111827] bg-white transition-all"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#374151]">
                Technologies <span className="font-normal normal-case text-[#6B7280]">(comma separated)</span>
              </label>
              <input
                type="text"
                value={form.technologies}
                onChange={e => update({ technologies: e.target.value })}
                placeholder="React, Firebase, Node.js"
                className="w-full px-4 py-3 rounded-xl border border-[#D1D5DB] focus:border-[#16A34A] focus:ring-2 focus:ring-[#22C55E]/30 focus:outline-none text-sm text-[#111827] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#374151]">GitHub URL</label>
              <input
                type="text"
                value={form.githubUrl}
                onChange={e => update({ githubUrl: e.target.value })}
                placeholder="https://github.com/you/project"
                className="w-full px-4 py-3 rounded-xl border border-[#D1D5DB] focus:border-[#16A34A] focus:ring-2 focus:ring-[#22C55E]/30 focus:outline-none text-sm text-[#111827] transition-all font-mono"
              />
              {errors.githubUrl && <p className="text-xs text-[#15803D]">{errors.githubUrl}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#374151]">Live Website URL</label>
              <input
                type="text"
                value={form.liveUrl}
                onChange={e => update({ liveUrl: e.target.value })}
                placeholder="https://your-live-demo.com"
                className="w-full px-4 py-3 rounded-xl border border-[#D1D5DB] focus:border-[#16A34A] focus:ring-2 focus:ring-[#22C55E]/30 focus:outline-none text-sm text-[#111827] transition-all font-mono"
              />
              {errors.liveUrl && <p className="text-xs text-[#15803D]">{errors.liveUrl}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#374151]">Project Image</label>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex flex-col items-center justify-center gap-2 min-h-[120px] rounded-xl border-2 border-dashed border-[#DCFCE7] bg-[#F0FDF4] hover:border-[#22C55E] hover:bg-[#DCFCE7]/40 text-[#15803D] transition-all cursor-pointer"
              >
                <Upload className="w-6 h-6" />
                <span className="text-sm font-medium">{imageFile ? imageFile.name : 'Click to choose an image'}</span>
                <span className="text-xs text-[#6B7280]">PNG, JPG or WebP</span>
              </button>
              {imagePreview && (
                <img src={imagePreview} alt="Project preview" className="h-32 w-full sm:w-48 rounded-xl border border-[#DCFCE7] object-cover bg-[#F0FDF4]" />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => handleFile(e.target.files?.[0])}
            />
          </div>

          {uploadProgress !== null && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[#6B7280]">
                <span>Uploading image…</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="h-2 rounded-full bg-[#DCFCE7] overflow-hidden">
                <div className="h-full bg-[#16A34A] transition-all duration-200" style={{ width: `${Math.max(0, Math.min(100, uploadProgress))}%` }} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <button
              type="button"
              onClick={() => update({ featured: !form.featured })}
              aria-pressed={form.featured}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer text-left ${
                form.featured
                  ? 'border-[#16A34A] bg-[#F0FDF4] text-[#15803D]'
                  : 'border-[#D1D5DB] bg-white text-[#6B7280] hover:border-[#22C55E]'
              }`}
            >
              <Star className={`w-5 h-5 ${form.featured ? 'fill-[#16A34A] text-[#16A34A]' : ''}`} />
              <div>
                <p className="text-sm font-semibold">Featured project</p>
                <p className="text-xs opacity-80">Highlight on the portfolio</p>
              </div>
            </button>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#374151]">Status</label>
              <select
                value={form.status}
                onChange={e => update({ status: e.target.value as 'Published' | 'Draft' })}
                className="w-full px-4 py-3 rounded-xl border border-[#D1D5DB] focus:border-[#16A34A] focus:outline-none text-sm text-[#111827] bg-white transition-all"
              >
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-[#DCFCE7] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl border border-[#D1D5DB] text-[#374151] hover:border-[#16A34A] hover:text-[#16A34A] text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#16A34A]/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {editing ? 'Save Changes' : 'Publish Project'}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProjectForm;