import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  Save,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { usePortfolioCms } from '../context/PortfolioCmsContext';
import { useToast } from './ToastContext';
import type { Skill } from '../types';

const CATEGORY_OPTIONS = ['Programming', 'Frontend', 'Backend', 'Mobile', 'Databases', 'Tools & DevOps', 'Cloud', 'Design', 'Other'] as const;
const PROFILES = ['Core', 'Advanced', 'Expert'] as const;

interface SkillFormState {
  name: string;
  category: Skill['category'];
  proficiency: Skill['proficiency'];
  years: number;
  projectsCount: number;
  description: string;
  iconName: string;
  technologies: string;
  featured: boolean;
  displayOrder: number;
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `skill-${Date.now()}`;
}

function buildInitial(skill: Skill | null): SkillFormState {
  if (!skill) {
    return {
      name: '',
      category: 'Frontend',
      proficiency: 'Advanced',
      years: 0,
      projectsCount: 0,
      description: '',
      iconName: '',
      technologies: '',
      featured: false,
      displayOrder: Date.now(),
    };
  }

  return {
    name: skill.name,
    category: skill.category,
    proficiency: skill.proficiency,
    years: skill.years,
    projectsCount: skill.projectsCount,
    description: skill.description,
    iconName: skill.iconName,
    technologies: (skill.technologies ?? []).join(', '),
    featured: Boolean(skill.featured),
    displayOrder: skill.displayOrder ?? Date.now(),
  };
}

export const SkillsSection: React.FC = () => {
  const { skills, loading, saveSkill, deleteSkill, reorderSkills, logActivity } = usePortfolioCms();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState<SkillFormState>(() => buildInitial(null));
  const [saving, setSaving] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const visibleSkills = useMemo(() => {
    const term = query.trim().toLowerCase();
    return skills
      .filter(skill => {
        if (!term) return true;
        const haystack = [skill.name, skill.category, skill.description, skill.iconName, ...(skill.technologies ?? [])]
          .join(' ')
          .toLowerCase();
        return haystack.includes(term);
      })
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }, [skills, query]);

  const openCreate = () => {
    setEditing(null);
    setForm(buildInitial(null));
    setModalOpen(true);
  };

  const openEdit = (skill: Skill) => {
    setEditing(skill);
    setForm(buildInitial(skill));
    setModalOpen(true);
  };

  const closeModal = () => {
    setEditing(null);
    setForm(buildInitial(null));
    setModalOpen(false);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const nextSkill: Skill = {
        id: editing?.id ?? generateId(),
        name: form.name.trim(),
        category: form.category,
        proficiency: form.proficiency,
        years: Number(form.years) || 0,
        projectsCount: Number(form.projectsCount) || 0,
        description: form.description.trim(),
        iconName: form.iconName.trim() || 'sparkles',
        icon: form.iconName.trim() || 'sparkles',
        technologies: form.technologies
          .split(',')
          .map(item => item.trim())
          .filter(Boolean),
        featured: form.featured,
        displayOrder: Number.isFinite(form.displayOrder) ? form.displayOrder : Date.now(),
        createdAt: editing?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
      };

      await saveSkill(nextSkill);
      await logActivity({
        action: editing ? 'Skill updated' : 'Skill created',
        item: nextSkill.name,
        itemType: 'skill',
        user: 'Administrator',
      });
      toast(editing ? 'Skill updated.' : 'Skill created.', 'success');
      closeModal();
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to save skill.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (skill: Skill) => {
    await deleteSkill(skill.id);
    await logActivity({
      action: 'Skill deleted',
      item: skill.name,
      itemType: 'skill',
      user: 'Administrator',
    });
    toast('Skill deleted.', 'info');
  };

  const handleDrop = async (targetId: string) => {
    if (!dragId || dragId === targetId || query.trim()) return;
    const ordered = [...visibleSkills];
    const from = ordered.findIndex(skill => skill.id === dragId);
    const to = ordered.findIndex(skill => skill.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = ordered.splice(from, 1);
    ordered.splice(to, 0, moved);
    await reorderSkills(ordered.map(skill => skill.id));
    await logActivity({
      action: 'Skill reordered',
      item: moved.name,
      itemType: 'skill',
      user: 'Administrator',
    });
    toast('Skill order updated.', 'success');
    setDragId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-[1.75rem] border border-white/10 bg-white/5 py-24 text-zinc-300">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
            <Sparkles className="h-3.5 w-3.5" />
            Skills
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Skill library</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
            Manage the technologies and skill cards that power the public technology strip and future skill panels.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-zinc-100"
        >
          <Plus className="h-4 w-4" />
          Add skill
        </button>
      </div>

      <div className="relative rounded-[1.5rem] border border-white/10 bg-white/5">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search skills"
          className="w-full rounded-[1.5rem] border-0 bg-transparent py-4 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none"
        />
      </div>

      {visibleSkills.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-black/20 text-center">
          <p className="text-sm font-medium text-white">No skills found</p>
          <p className="mt-2 max-w-sm text-sm text-zinc-500">
            {query ? 'Try a different search term.' : 'Add a skill to start building the public technology strip.'}
          </p>
          {!query && (
            <button
              onClick={openCreate}
              className="mt-5 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black"
            >
              Add skill
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-black/30 text-left text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                <tr>
                  <th className="px-4 py-4">Order</th>
                  <th className="px-4 py-4">Skill</th>
                  <th className="px-4 py-4">Category</th>
                  <th className="px-4 py-4">Technologies</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {visibleSkills.map((skill, index) => (
                  <motion.tr
                    key={skill.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                    draggable={!query.trim()}
                    onDragStart={() => setDragId(skill.id)}
                    onDragEnd={() => setDragId(null)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => void handleDrop(skill.id)}
                    className="bg-black/10 hover:bg-white/5"
                  >
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-center gap-3">
                        <button type="button" className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400">
                          <GripVertical className="h-4 w-4" />
                        </button>
                        <span className="text-sm text-white">{skill.displayOrder ?? index + 1}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div>
                        <p className="text-sm font-semibold text-white">{skill.name}</p>
                        <p className="mt-1 max-w-lg text-sm text-zinc-400">{skill.description}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-zinc-500">
                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{skill.proficiency}</span>
                          {skill.featured && (
                            <span className="rounded-full border border-white/10 bg-white px-2.5 py-1 text-black">Featured</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300">
                        {skill.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        {(skill.technologies ?? []).map(tech => (
                          <span key={tech} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-zinc-300">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(skill)}
                          className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-300 transition-all hover:bg-white hover:text-black"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => void handleDelete(skill)}
                          className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-300 transition-all hover:bg-white hover:text-black"
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

      {modalOpen ? (
        <SkillModal
          editing={editing}
          form={form}
          setForm={setForm}
          saving={saving}
          onClose={closeModal}
          onSubmit={handleSave}
        />
      ) : null}
    </div>
  );
};

function SkillModal({
  editing,
  form,
  setForm,
  saving,
  onClose,
  onSubmit,
}: {
  editing: Skill | null;
  form: SkillFormState;
  setForm: React.Dispatch<React.SetStateAction<SkillFormState>>;
  saving: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-[#0A0A0B] p-6 text-white shadow-2xl"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Skill editor</p>
            <h2 className="mt-2 text-2xl font-semibold">{editing ? 'Edit skill' : 'Add skill'}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-300 hover:bg-white hover:text-black"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={event => void onSubmit(event)} className="grid gap-4 sm:grid-cols-2">
          <Field label="Skill name">
            <input
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
            />
          </Field>

          <Field label="Category">
            <select
              value={form.category}
              onChange={e => setForm(prev => ({ ...prev, category: e.target.value as Skill['category'] }))}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
            >
              {CATEGORY_OPTIONS.map(item => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Proficiency">
            <select
              value={form.proficiency}
              onChange={e => setForm(prev => ({ ...prev, proficiency: e.target.value as Skill['proficiency'] }))}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
            >
              {PROFILES.map(item => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Icon name">
            <input
              value={form.iconName}
              onChange={e => setForm(prev => ({ ...prev, iconName: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
              placeholder="react, typescript, node..."
            />
          </Field>

          <Field label="Technologies" className="sm:col-span-2">
            <input
              value={form.technologies}
              onChange={e => setForm(prev => ({ ...prev, technologies: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
              placeholder="React, TypeScript, Vite"
            />
          </Field>

          <Field label="Description" className="sm:col-span-2">
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="min-h-32 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
              placeholder="Describe what this skill represents."
            />
          </Field>

          <Field label="Years">
            <input
              type="number"
              value={form.years}
              onChange={e => setForm(prev => ({ ...prev, years: Number(e.target.value) }))}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
            />
          </Field>

          <Field label="Projects count">
            <input
              type="number"
              value={form.projectsCount}
              onChange={e => setForm(prev => ({ ...prev, projectsCount: Number(e.target.value) }))}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
            />
          </Field>

          <Field label="Display order">
            <input
              type="number"
              value={form.displayOrder}
              onChange={e => setForm(prev => ({ ...prev, displayOrder: Number(e.target.value) }))}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
            />
          </Field>

          <div className="flex items-end justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white">Featured skill</p>
              <p className="text-xs text-zinc-500">Mark this as a featured technology.</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, featured: !prev.featured }))}
              className={`rounded-full p-2 transition-all ${form.featured ? 'bg-white text-black' : 'border border-white/10 bg-white/5 text-zinc-300'}`}
            >
              {form.featured ? <Check className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            </button>
          </div>

          <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving...' : 'Save skill'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block space-y-2 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

export default SkillsSection;
