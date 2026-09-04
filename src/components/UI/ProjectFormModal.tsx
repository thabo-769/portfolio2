import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Plus,
  Upload,
} from 'lucide-react';
import { Project } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProject: (project: Project) => void;
  editingProject?: Project | null;
  existingProjects: Project[];
}

const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="100%" height="100%" fill="#121214"/><text x="50%" y="50%" fill="#71717A" font-family="Poppins" font-size="40" text-anchor="middle">No image yet</text></svg>`,
  );

function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

async function readImageFile(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Unable to read image'));
    reader.readAsDataURL(file);
  });

  if (file.type === 'image/svg+xml') return dataUrl;

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error('Unable to load image'));
    element.src = dataUrl;
  });
  const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext('2d');
  if (!context) return dataUrl;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.8);
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSaveProject,
  editingProject,
  existingProjects,
}) => {
  const { playSound } = useTheme();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Pre-populate form when editing an existing project; reset when adding.
  useEffect(() => {
    if (!isOpen) return;
    if (editingProject) {
      setName(editingProject.name);
      setDescription(editingProject.description);
      setImage(editingProject.image);
      setGithubUrl(editingProject.githubUrl);
      setLiveUrl(editingProject.liveUrl);
    } else {
      setName('');
      setDescription('');
      setImage('');
      setGithubUrl('');
      setLiveUrl('');
    }
    setErrors({});
    setSaving(false);
  }, [isOpen, editingProject]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        playSound('pop');
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    nameInputRef.current?.focus();
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {};

    if (!name.trim()) nextErrors.name = 'Project Name is required.';
    if (!description.trim()) nextErrors.description = 'Full Description is required.';
    if (!image.trim() || image === PLACEHOLDER_IMAGE) nextErrors.image = 'Project image is required.';
    if (!githubUrl.trim()) nextErrors.githubUrl = 'GitHub link is required.';
    else if (!isValidUrl(githubUrl)) nextErrors.githubUrl = 'Enter a valid https:// URL.';
    if (!liveUrl.trim()) nextErrors.liveUrl = 'Live link is required.';
    else if (!isValidUrl(liveUrl)) nextErrors.liveUrl = 'Enter a valid https:// URL.';

    const trimmedName = name.trim();
    const duplicate = existingProjects.some(
      project =>
        project.id !== editingProject?.id &&
        !project.isDeleted &&
        project.name.trim().toLowerCase() === trimmedName.toLowerCase(),
    );
    if (duplicate) nextErrors.name = 'A project with this name already exists.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).some(key => Boolean(nextErrors[key]))) return;

    const now = Date.now();
    const project: Project = {
      id: editingProject?.id ?? `project-${now}`,
      name: trimmedName,
      shortDescription: description.trim(),
      description: description.trim(),
      category: editingProject?.category ?? 'Personal',
      technologies: editingProject?.technologies ?? [],
      image: image.trim(),
      images: editingProject?.images ?? [],
      githubUrl: githubUrl.trim(),
      liveUrl: liveUrl.trim(),
      status: editingProject?.status ?? 'Completed',
      featured: editingProject?.featured ?? false,
      displayOrder: editingProject?.displayOrder ?? now,
      completionDate: editingProject?.completionDate ?? new Date(now).toISOString(),
      client: editingProject?.client ?? '',
      projectType: editingProject?.projectType ?? '',
      features: editingProject?.features ?? [],
      challenges: editingProject?.challenges ?? '',
      solutions: editingProject?.solutions ?? '',
      results: editingProject?.results ?? '',
      createdAt: editingProject?.createdAt ?? now,
      updatedAt: now,
      deletedAt: editingProject?.deletedAt ?? null,
      isDeleted: false,
    };

    setSaving(true);
    onSaveProject(project);
    playSound('success');
    setSaving(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/85 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={e => {
            if (e.target === e.currentTarget) {
              playSound('pop');
              onClose();
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
        >
          <motion.div
            className="relative w-full max-w-3xl max-h-[92vh] bg-[#000000] border border-[#1F1F1F] rounded-3xl shadow-2xl overflow-y-auto text-white"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.25 }}
          >
            <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-4 bg-[#0C0C0C] border-b border-[#1F1F1F]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/10 border border-[#27272A]">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 id="project-modal-title" className="text-base font-bold uppercase tracking-tight text-white">
                    {editingProject ? 'Edit Project' : 'Add Project'}
                  </h2>
                  <p className="text-xs text-[#A1A1AA]">
                    {editingProject ? 'Update the project details below.' : 'Share a project you have built.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  playSound('pop');
                  onClose();
                }}
                aria-label="Close modal"
                className="p-2 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#18181B] cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form
              className="flex flex-col gap-6 p-6"
              onSubmit={e => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <section className="space-y-1.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                    Project Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Atlas Analytics"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#000000] border border-[#1F1F1F] focus:border-white focus:outline-none text-white text-sm transition-colors"
                  />
                  {errors.name && <p className="text-[11px] text-red-400">{errors.name}</p>}
                </div>

              </section>

              <section className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe what you built and what it does."
                  rows={5}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#000000] border border-[#1F1F1F] focus:border-white focus:outline-none text-white text-sm transition-colors resize-none"
                />
                {errors.description && <p className="text-[11px] text-red-400">{errors.description}</p>}
              </section>

              <section className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                  Project Image <span className="text-red-400">*</span>
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="url"
                    value={image}
                    onChange={e => setImage(e.target.value)}
                    placeholder="https://example.com/project-image.jpg"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#000000] border border-[#1F1F1F] focus:border-white focus:outline-none text-white text-sm transition-colors"
                  />
                  <label className="inline-flex shrink-0 items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            setImage(await readImageFile(file));
                            setErrors(current => ({ ...current, image: '' }));
                          } catch {
                            setErrors(current => ({ ...current, image: 'Unable to read this image.' }));
                          }
                        }
                        e.currentTarget.value = '';
                      }}
                    />
                  </label>
                </div>
                {image && image !== PLACEHOLDER_IMAGE && (
                  <img src={image} alt="Project preview" className="h-28 w-full rounded-xl border border-[#1F1F1F] object-cover" />
                )}
                {errors.image && <p className="text-[11px] text-red-400">{errors.image}</p>}
              </section>

              <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                    GitHub Link <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={githubUrl}
                    onChange={e => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/you/project"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#000000] border border-[#1F1F1F] focus:border-white focus:outline-none text-white text-sm font-mono transition-colors"
                  />
                  {errors.githubUrl && <p className="text-[11px] text-red-400">{errors.githubUrl}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                    Live Link <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={liveUrl}
                    onChange={e => setLiveUrl(e.target.value)}
                    placeholder="https://your-live-demo.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#000000] border border-[#1F1F1F] focus:border-white focus:outline-none text-white text-sm font-mono transition-colors"
                  />
                  {errors.liveUrl && <p className="text-[11px] text-red-400">{errors.liveUrl}</p>}
                </div>
              </section>
              <div className="pt-4 border-t border-[#1F1F1F] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    playSound('pop');
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white hover:bg-[#A1A1AA] text-black text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:scale-105 active:scale-95 cursor-pointer"
                >
                  {saving ? (
                    <span>Saving…</span>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-black" />
                      <span>{editingProject ? 'Save Changes' : 'Publish Project'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
