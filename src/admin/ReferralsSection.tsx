import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  Undo2,
  Users,
  X,
} from 'lucide-react';
import { usePortfolioCms } from '../context/PortfolioCmsContext';
import { useToast } from './ToastContext';
import type { Referral } from '../types';

type FilterKey = 'all' | 'active' | 'deleted' | 'featured';

interface ReferralFormState {
  clientName: string;
  company: string;
  position: string;
  testimonial: string;
  clientImage: string;
  rating: number;
  featured: boolean;
  displayOrder: number;
  verified: boolean;
  relationship: string;
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `ref-${Date.now()}`;
}

function buildInitial(referral: Referral | null): ReferralFormState {
  if (!referral) {
    return {
      clientName: '',
      company: '',
      position: '',
      testimonial: '',
      clientImage: '',
      rating: 5,
      featured: false,
      displayOrder: Date.now(),
      verified: false,
      relationship: '',
    };
  }

  return {
    clientName: referral.clientName ?? referral.name,
    company: referral.company ?? referral.organization,
    position: referral.position ?? referral.role,
    testimonial: referral.testimonial ?? referral.message,
    clientImage: referral.clientImage ?? referral.avatarUrl ?? '',
    rating: referral.rating,
    featured: Boolean(referral.featured),
    displayOrder: referral.displayOrder ?? Date.now(),
    verified: Boolean(referral.verified),
    relationship: referral.relationship,
  };
}

export const ReferralsSection: React.FC = () => {
  const { referrals, loading, saveReferral, deleteReferral, restoreReferral, reorderReferrals, logActivity } =
    usePortfolioCms();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [editing, setEditing] = useState<Referral | null>(null);
  const [form, setForm] = useState<ReferralFormState>(() => buildInitial(null));
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  const sortedReferrals = useMemo(
    () => [...referrals].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
    [referrals]
  );

  const visibleReferrals = useMemo(() => {
    let list = sortedReferrals;
    if (filter === 'active') list = list.filter(item => !item.isDeleted);
    if (filter === 'deleted') list = list.filter(item => item.isDeleted);
    if (filter === 'featured') list = list.filter(item => item.featured && !item.isDeleted);

    const term = query.trim().toLowerCase();
    if (term) {
      list = list.filter(item =>
        [
          item.clientName,
          item.company,
          item.position,
          item.testimonial,
          item.relationship,
          item.name,
          item.role,
          item.organization,
        ]
          .join(' ')
          .toLowerCase()
          .includes(term)
      );
    }
    return list;
  }, [sortedReferrals, filter, query]);

  const openCreate = () => {
    setEditing(null);
    setForm(buildInitial(null));
    setModalOpen(true);
  };

  const openEdit = (referral: Referral) => {
    setEditing(referral);
    setForm(buildInitial(referral));
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
      const nextReferral: Referral = {
        id: editing?.id ?? generateId(),
        name: form.clientName.trim(),
        clientName: form.clientName.trim(),
        organization: form.company.trim(),
        company: form.company.trim(),
        role: form.position.trim(),
        position: form.position.trim(),
        avatarUrl: form.clientImage.trim(),
        clientImage: form.clientImage.trim(),
        message: form.testimonial.trim(),
        testimonial: form.testimonial.trim(),
        date: editing?.date ?? new Date().toLocaleDateString(),
        relationship: form.relationship.trim(),
        rating: form.rating,
        verified: form.verified,
        featured: form.featured,
        displayOrder: form.displayOrder,
        createdAt: editing?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
        deletedAt: editing?.deletedAt ?? null,
        isDeleted: editing?.isDeleted ?? false,
      };

      await saveReferral(nextReferral);
      await logActivity({
        action: editing ? 'Referral updated' : 'Referral created',
        item: nextReferral.name,
        itemType: 'referral',
        user: 'Administrator',
      });
      toast(editing ? 'Referral updated.' : 'Referral created.', 'success');
      closeModal();
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to save referral.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (referral: Referral) => {
    await deleteReferral(referral.id);
    await logActivity({
      action: 'Referral deleted',
      item: referral.name,
      itemType: 'referral',
      user: 'Administrator',
    });
    toast('Referral moved to deleted.', 'info');
  };

  const handleRestore = async (referral: Referral) => {
    await restoreReferral(referral.id);
    await logActivity({
      action: 'Referral restored',
      item: referral.name,
      itemType: 'referral',
      user: 'Administrator',
    });
    toast('Referral restored.', 'success');
  };

  const handleToggleFeatured = async (referral: Referral) => {
    await saveReferral({
      ...referral,
      featured: !referral.featured,
      updatedAt: Date.now(),
    });
    await logActivity({
      action: referral.featured ? 'Referral unfeatured' : 'Referral featured',
      item: referral.name,
      itemType: 'referral',
      user: 'Administrator',
    });
    toast(referral.featured ? 'Referral unfeatured.' : 'Referral featured.', 'success');
  };

  const handleDrop = async (targetId: string) => {
    if (!dragId || dragId === targetId || query.trim() || filter !== 'all') return;
    const order = [...sortedReferrals.filter(item => !item.isDeleted)];
    const from = order.findIndex(item => item.id === dragId);
    const to = order.findIndex(item => item.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = order.splice(from, 1);
    order.splice(to, 0, moved);
    await reorderReferrals(order.map(item => item.id));
    await logActivity({
      action: 'Referral reordered',
      item: moved.name,
      itemType: 'referral',
      user: 'Administrator',
    });
    toast('Referral order updated.', 'success');
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
            <Users className="h-3.5 w-3.5" />
            Referrals
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Referral management</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
            Manage client testimonials, reorder the feed, and choose which referrals are featured on the public site.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-zinc-100"
        >
          <Plus className="h-4 w-4" />
          Add referral
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-[1.75rem] border border-white/10 bg-white/5 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search referrals"
            className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-white/25"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'active', label: 'Active' },
            { key: 'featured', label: 'Featured' },
            { key: 'deleted', label: 'Deleted' },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key as FilterKey)}
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
        <GripVertical className="h-3.5 w-3.5" />
        Drag rows to reorder when viewing all active referrals.
      </div>

      {visibleReferrals.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-black/20 text-center">
          <p className="text-sm font-medium text-white">No referrals found</p>
          <p className="mt-2 max-w-sm text-sm text-zinc-500">
            {query ? 'Try a different search term.' : 'Add a referral to power the portfolio testimonial feed.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-black/30 text-left text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                <tr>
                  <th className="px-4 py-4">Order</th>
                  <th className="px-4 py-4">Client</th>
                  <th className="px-4 py-4">Details</th>
                  <th className="px-4 py-4">Rating</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {visibleReferrals.map((referral, index) => (
                  <motion.tr
                    key={referral.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                    draggable={!query.trim() && filter === 'all' && !referral.isDeleted}
                    onDragStart={() => setDragId(referral.id)}
                    onDragEnd={() => setDragId(null)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => void handleDrop(referral.id)}
                    className="bg-black/10 hover:bg-white/5"
                  >
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-center gap-3">
                        <button type="button" className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400">
                          <GripVertical className="h-4 w-4" />
                        </button>
                        <span className="text-sm text-white">{referral.displayOrder ?? index + 1}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                          {referral.clientImage ? (
                            <img src={referral.clientImage} alt={referral.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-zinc-600">
                              <Users className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{referral.name}</p>
                          <p className="text-sm text-zinc-400">
                            {referral.position} · {referral.company}
                          </p>
                          <p className="mt-1 max-w-md line-clamp-2 text-sm text-zinc-500">{referral.testimonial}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="max-w-xs text-sm text-zinc-400">{referral.relationship}</div>
                      {referral.verified && (
                        <div className="mt-2 inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-zinc-300">
                          Verified
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300">
                        {Array.from({ length: referral.rating }).map((_, star) => (
                          <Star key={star} className="h-3.5 w-3.5 fill-white text-white" />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-col gap-2">
                        <span className={`rounded-full border px-3 py-1.5 text-xs ${referral.featured ? 'border-white bg-white text-black' : 'border-white/10 bg-black/20 text-zinc-300'}`}>
                          {referral.featured ? 'Featured' : 'Normal'}
                        </span>
                        {referral.isDeleted && (
                          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-zinc-500">
                            Deleted
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => void handleToggleFeatured(referral)}
                          className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-300 hover:bg-white hover:text-black"
                        >
                          <Star className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEdit(referral)}
                          className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-300 hover:bg-white hover:text-black"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {referral.isDeleted ? (
                          <button
                            onClick={() => void handleRestore(referral)}
                            className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-300 hover:bg-white hover:text-black"
                          >
                            <Undo2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => void handleDelete(referral)}
                            className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-300 hover:bg-white hover:text-black"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <ReferralModal
          editing={editing}
          form={form}
          setForm={setForm}
          saving={saving}
          onClose={closeModal}
          onSubmit={handleSave}
        />
      )}
    </div>
  );
};

function ReferralModal({
  editing,
  form,
  setForm,
  saving,
  onClose,
  onSubmit,
}: {
  editing: Referral | null;
  form: ReferralFormState;
  setForm: React.Dispatch<React.SetStateAction<ReferralFormState>>;
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
        className="w-full max-w-4xl rounded-[2rem] border border-white/10 bg-[#0A0A0B] p-6 text-white shadow-2xl"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Referral editor</p>
            <h2 className="mt-2 text-2xl font-semibold">{editing ? 'Edit referral' : 'Add referral'}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-300 hover:bg-white hover:text-black"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={event => void onSubmit(event)} className="grid gap-4 sm:grid-cols-2">
          <Field label="Client name">
            <input
              value={form.clientName}
              onChange={e => setForm(prev => ({ ...prev, clientName: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
            />
          </Field>

          <Field label="Company">
            <input
              value={form.company}
              onChange={e => setForm(prev => ({ ...prev, company: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
            />
          </Field>

          <Field label="Position">
            <input
              value={form.position}
              onChange={e => setForm(prev => ({ ...prev, position: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
            />
          </Field>

          <Field label="Client image URL">
            <input
              value={form.clientImage}
              onChange={e => setForm(prev => ({ ...prev, clientImage: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
            />
          </Field>

          <Field label="Testimonial" className="sm:col-span-2">
            <textarea
              value={form.testimonial}
              onChange={e => setForm(prev => ({ ...prev, testimonial: e.target.value }))}
              className="min-h-36 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
            />
          </Field>

          <Field label="Relationship">
            <input
              value={form.relationship}
              onChange={e => setForm(prev => ({ ...prev, relationship: e.target.value }))}
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

          <Field label="Rating">
            <select
              value={form.rating}
              onChange={e => setForm(prev => ({ ...prev, rating: Number(e.target.value) }))}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
            >
              {[5, 4, 3, 2, 1].map(item => (
                <option key={item} value={item}>
                  {item} stars
                </option>
              ))}
            </select>
          </Field>

          <div className="flex items-end justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white">Featured referral</p>
              <p className="text-xs text-zinc-500">Promote this testimonial in the public feed.</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, featured: !prev.featured }))}
              className={`rounded-full p-2 transition-all ${form.featured ? 'bg-white text-black' : 'border border-white/10 bg-white/5 text-zinc-300'}`}
            >
              {form.featured ? <Check className="h-4 w-4" /> : <Star className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex items-end justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white">Verified referral</p>
              <p className="text-xs text-zinc-500">Mark this testimonial as verified.</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, verified: !prev.verified }))}
              className={`rounded-full p-2 transition-all ${form.verified ? 'bg-white text-black' : 'border border-white/10 bg-white/5 text-zinc-300'}`}
            >
              {form.verified ? <Check className="h-4 w-4" /> : <Users className="h-4 w-4" />}
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
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {saving ? 'Saving...' : 'Save referral'}
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

export default ReferralsSection;
