import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  FileImage,
  FolderKanban,
  Image as ImageIcon,
  Loader2,
  Save,
  Sparkles,
  Star,
  Upload,
  X,
} from 'lucide-react';
import { Project } from '../types';
import { usePortfolioCms } from '../context/PortfolioCmsContext';
import { useToast } from './ToastContext';

interface ProjectFormProps {
  editing: Project | null;
  onClose: () => void;
}

interface FormState {
  name: string;
  shortDescription: string;
  description: string;
  category: string;
  technologies: string;
  imageUrl: string;
  imagePath: string;
  galleryUrls: string;
  githubUrl: string;
  liveUrl: string;
  completionDate: string;
  status: 'Published' | 'Draft';
  featured: boolean;
  displayOrder: number;
  client: string;
  projectType: string;
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `project-${Date.now()}`;
}

const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function buildInitial(editing: Project | null): FormState {
  if (!editing) {
    return {
      name: '',
      shortDescription: '',
      description: '',
      category: 'Personal',
      technologies: '',
      imageUrl: '',
      imagePath: '',
      galleryUrls: '',
      githubUrl: '',
      liveUrl: '',
      completionDate: new Date().toISOString().slice(0, 10),
      status: 'Published',
      featured: false,
      displayOrder: Date.now(),
      client: '',
      projectType: '',
    };
  }

  return {
    name: editing.name,
    shortDescription: editing.shortDescription,
    description: editing.description,
    category: editing.category,
    technologies: editing.technologies.join(', '),
    imageUrl: editing.image,
    imagePath: editing.imagePath ?? '',
    galleryUrls: editing.images.join(', '),
    githubUrl: editing.githubUrl,
    liveUrl: editing.liveUrl,
    completionDate: editing.completionDate ? editing.completionDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    status: editing.status === 'Published' ? 'Published' : 'Draft',
    featured: editing.featured,
    displayOrder: editing.displayOrder ?? Date.now(),
    client: editing.client,
    projectType: editing.projectType,
  };
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ editing, onClose }) => {
  const { saveProject, uploadProjectImage, logActivity } = usePortfolioCms();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fieldRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});
  const [form, setForm] = useState<FormState>(() => buildInitial(editing));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const projectIdRef = useRef(editing?.id ?? generateId());

  const update = (patch: Partial<FormState>) => {
    setForm(prev => ({ ...prev, ...patch }));
    setErrors(current => {
      const next = { ...current };
      Object.keys(patch).forEach(key => delete next[key]);
      return next;
    });
  };

  const validate = (): Record<string, string> => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Project name is required.';
    if (!form.description.trim()) next.description = 'About project is required.';
    if (!form.imageUrl.trim()) next.imageUrl = 'Choose an image or upload one.';
    if (!form.githubUrl.trim()) next.githubUrl = 'GitHub link is required.';
    else if (!isValidHttpUrl(form.githubUrl.trim())) next.githubUrl = 'Use a valid http:// or https:// URL.';
    if (!form.liveUrl.trim()) next.liveUrl = 'Live link is required.';
    else if (!isValidHttpUrl(form.liveUrl.trim())) next.liveUrl = 'Use a valid http:// or https:// URL.';
    setErrors(next);
    const firstInvalidField = Object.keys(next)[0];
    if (firstInvalidField) {
      requestAnimationFrame(() => fieldRefs.current[firstInvalidField]?.focus());
    }
    return next;
  };

  const deriveProjectName = (): string => {
    return form.name.trim();
  };

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      const message = 'Please choose a JPG, PNG, or WebP image.';
      setErrors(current => ({ ...current, imageUrl: message }));
      toast(message, 'warning');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      const message = 'Project images must be 10 MB or smaller.';
      setErrors(current => ({ ...current, imageUrl: message }));
      toast(message, 'warning');
      return;
    }
    const previousImage = form.imageUrl;
    const previousImagePath = form.imagePath;
    const previewUrl = URL.createObjectURL(file);
    update({ imageUrl: previewUrl, imagePath: '' });
    toast('Image inserted. Uploading...', 'info');
    setUploading(true);
    setUploadProgress(0);
    try {
      const asset = await uploadProjectImage(file, projectIdRef.current, progress => setUploadProgress(progress));
      URL.revokeObjectURL(previewUrl);
      update({ imageUrl: asset.url, imagePath: asset.path });
      toast('Image uploaded and linked to the project.', 'success');
    } catch (error) {
      URL.revokeObjectURL(previewUrl);
      update({ imageUrl: previousImage, imagePath: previousImagePath });
      const message = error instanceof Error ? error.message : 'Unable to upload image. Check Firebase Storage settings.';
      setErrors(current => ({ ...current, imageUrl: message }));
      toast(message, 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.values(validationErrors)[0];
      toast(firstError ? `Please fix this: ${firstError}` : 'Please complete the required fields.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const id = editing?.id ?? projectIdRef.current;
      const projectName = deriveProjectName();
      const project: Project = {
        id,
        name: projectName,
        shortDescription: form.description.trim().slice(0, 160),
        description: form.description.trim(),
        category: form.category,
        technologies: form.technologies
          .split(',')
          .map(item => item.trim())
          .filter(Boolean),
        image: form.imageUrl.trim(),
        imagePath: form.imagePath.trim() || undefined,
        images: form.galleryUrls
          .split(',')
          .map(item => item.trim())
          .filter(Boolean),
        githubUrl: form.githubUrl.trim(),
        liveUrl: form.liveUrl.trim(),
        status: form.status,
        featured: form.featured,
        displayOrder: Number.isFinite(form.displayOrder) ? form.displayOrder : Date.now(),
        completionDate: new Date(form.completionDate).toISOString(),
        client: form.client.trim(),
        projectType: form.projectType.trim(),
        features: editing?.features ?? [],
        challenges: editing?.challenges ?? '',
        solutions: editing?.solutions ?? '',
        results: editing?.results ?? '',
        createdAt: editing?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
        deletedAt: editing?.deletedAt ?? null,
        isDeleted: editing?.isDeleted ?? false,
      };

      await saveProject(project, form.imageUrl.trim());
      await logActivity({
        action: editing ? 'Project updated' : 'Project created',
        item: project.name,
        itemType: 'project',
        user: 'Administrator',
      });

      toast(editing ? 'Project updated successfully.' : 'Project created successfully.', 'success');
      onClose();
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to save project. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22 }}
        className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#0A0A0B] text-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-form-title"
      >
        <div className="sticky top-0 z-10 border-b border-white/10 bg-[#0A0A0B]/95 px-6 py-5 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                <FolderKanban className="h-3.5 w-3.5" />
                Project editor
              </div>
              <h2 id="project-form-title" className="mt-3 text-2xl font-semibold tracking-tight">
                {editing ? 'Edit project' : 'Add project'}
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Save to the shared CMS and the portfolio will update automatically.
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 p-2.5 text-zinc-300 transition-all hover:bg-white hover:text-black"
              aria-label="Close editor"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                  <FolderKanban className="h-4 w-4 text-zinc-300" />
                  Project links
                </div>

                <div className="grid gap-4">
                  <Field label="GitHub link" error={errors.githubUrl}>
                    <input
                      ref={element => { fieldRefs.current.githubUrl = element; }}
                      value={form.githubUrl}
                      onChange={e => update({ githubUrl: e.target.value })}
                      aria-invalid={Boolean(errors.githubUrl)}
                      className={`w-full rounded-2xl border bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30 ${errors.githubUrl ? 'border-red-400/70' : 'border-white/10'}`}
                      placeholder="https://github.com/you/project"
                    />
                  </Field>

                  <Field label="Live link" error={errors.liveUrl}>
                    <input
                      ref={element => { fieldRefs.current.liveUrl = element; }}
                      value={form.liveUrl}
                      onChange={e => update({ liveUrl: e.target.value })}
                      aria-invalid={Boolean(errors.liveUrl)}
                      className={`w-full rounded-2xl border bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30 ${errors.liveUrl ? 'border-red-400/70' : 'border-white/10'}`}
                      placeholder="https://your-project.com"
                    />
                  </Field>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                  <Sparkles className="h-4 w-4 text-zinc-300" />
                  Core details
                </div>

                <div className="grid gap-4">
                  <Field label="Project name" error={errors.name}>
                    <input
                      ref={element => { fieldRefs.current.name = element; }}
                      value={form.name}
                      onChange={e => update({ name: e.target.value })}
                      aria-invalid={Boolean(errors.name)}
                      className={`w-full rounded-2xl border bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30 ${errors.name ? 'border-red-400/70' : 'border-white/10'}`}
                      placeholder="My portfolio project"
                    />
                  </Field>

                  <Field label="About project" error={errors.description}>
                    <textarea
                      ref={element => { fieldRefs.current.description = element; }}
                      value={form.description}
                      onChange={e => update({ description: e.target.value })}
                      aria-invalid={Boolean(errors.description)}
                      className={`min-h-36 w-full rounded-2xl border bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30 ${errors.description ? 'border-red-400/70' : 'border-white/10'}`}
                      placeholder="Tell visitors what the project does, the problem it solves, and your role."
                    />
                  </Field>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                  <FileImage className="h-4 w-4 text-zinc-300" />
                  Media
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                  <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={e => {
                        void handleUpload(e.target.files?.[0]);
                        e.currentTarget.value = '';
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-zinc-300 transition-all hover:bg-white/10"
                    >
                      {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                      <span>{uploading ? `Uploading image... ${uploadProgress}%` : 'Upload project image'}</span>
                      <span className="text-xs text-zinc-500">PNG, JPG, or WebP</span>
                    </button>

                    {errors.imageUrl && <p className="mt-2 text-xs text-red-300">{errors.imageUrl}</p>}
                  </div>

                    <div className="space-y-3">
                    <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/20">
                      {form.imageUrl ? (
                        <img src={form.imageUrl} alt={form.name || 'Project preview'} className="h-44 w-full object-cover" />
                      ) : (
                        <div className="flex h-44 items-center justify-center text-zinc-600">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => update({ imageUrl: '', imagePath: '' })}
                      className="w-full rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300 transition-all hover:bg-white/10"
                    >
                      Remove image
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="hidden rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                  <FolderKanban className="h-4 w-4 text-zinc-300" />
                  Metadata
                </div>

                <div className="grid gap-4">
                  <Field label="Category">
                    <select
                      value={form.category}
                      onChange={e => update({ category: e.target.value })}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                    >
                      <option value="Personal">Personal</option>
                      <option value="Business">Business</option>
                      <option value="Mobile">Mobile</option>
                      <option value="Gift">Gift</option>
                    </select>
                  </Field>

                  <Field label="Technologies">
                    <input
                      value={form.technologies}
                      onChange={e => update({ technologies: e.target.value })}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                      placeholder="React, Firebase, TypeScript"
                    />
                  </Field>

                  <Field label="Additional images">
                    <input
                      value={form.galleryUrls}
                      onChange={e => update({ galleryUrls: e.target.value })}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                      placeholder="Comma separated URLs"
                    />
                  </Field>

                  <Field label="GitHub link" error={errors.githubUrl}>
                    <input
                      value={form.githubUrl}
                      onChange={e => update({ githubUrl: e.target.value })}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                      placeholder="https://github.com/you/project"
                    />
                  </Field>

                  <Field label="Live link" error={errors.liveUrl}>
                    <input
                      value={form.liveUrl}
                      onChange={e => update({ liveUrl: e.target.value })}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                      placeholder="https://..."
                    />
                  </Field>

                  <Field label="Completion date">
                    <input
                      type="date"
                      value={form.completionDate}
                      onChange={e => update({ completionDate: e.target.value })}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                    />
                  </Field>

                  <Field label="Display order">
                    <input
                      type="number"
                      value={form.displayOrder}
                      onChange={e => update({ displayOrder: Number(e.target.value) })}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                    />
                  </Field>

                  <Field label="Client / company">
                    <input
                      value={form.client}
                      onChange={e => update({ client: e.target.value })}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                      placeholder="Optional"
                    />
                  </Field>

                  <Field label="Project type">
                    <input
                      value={form.projectType}
                      onChange={e => update({ projectType: e.target.value })}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                      placeholder="Full Stack, 3D Experience, ..."
                    />
                  </Field>
                </div>
              </div>

              <div className="hidden rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                  <Star className="h-4 w-4 text-zinc-300" />
                  Publishing
                </div>

                <div className="grid gap-4">
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-white">Featured project</p>
                      <p className="text-xs text-zinc-500">Highlight this project on the portfolio.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => update({ featured: !form.featured })}
                      className={`rounded-full p-2 transition-all ${
                        form.featured ? 'bg-white text-black' : 'border border-white/10 bg-white/5 text-zinc-300'
                      }`}
                    >
                      {form.featured ? <Check className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                    </button>
                  </div>

                  <Field label="Status">
                    <select
                      value={form.status}
                      onChange={e => update({ status: e.target.value as 'Published' | 'Draft' })}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                    </select>
                  </Field>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving...' : editing ? 'Save changes' : 'Create project'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">{label}</span>
      {children}
      {error && <p className="text-xs text-zinc-500">{error}</p>}
    </label>
  );
}

export default ProjectForm;
