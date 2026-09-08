import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, FolderKanban, Loader2, RotateCcw, Trash2, X } from 'lucide-react';
import { usePortfolioCms } from '../context/PortfolioCmsContext';
import { useToast } from './ToastContext';
import { Project } from '../types';

type ConfirmState =
  | { mode: 'single'; project: Project }
  | { mode: 'bulk' }
  | null;

export const Trash: React.FC = () => {
  const { projects, loading, restoreProject, permanentlyDeleteProject, logActivity } = usePortfolioCms();
  const { toast } = useToast();
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [emptying, setEmptying] = useState(false);

  const trashed = useMemo(
    () => projects.filter(project => project.isDeleted).sort((a, b) => (b.deletedAt ?? b.updatedAt) - (a.deletedAt ?? a.updatedAt)),
    [projects]
  );

  const handleRestore = async (project: Project) => {
    setBusyId(project.id);
    try {
      await restoreProject(project.id);
      await logActivity({
        action: 'Project restored',
        item: project.name,
        itemType: 'project',
        user: 'Administrator',
      });
      toast('Project restored.', 'success');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to restore project.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteForever = async (project: Project) => {
    setBusyId(project.id);
    try {
      await permanentlyDeleteProject(project);
      await logActivity({
        action: 'Project permanently deleted',
        item: project.name,
        itemType: 'project',
        user: 'Administrator',
      });
      toast('Project permanently deleted.', 'success');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to permanently delete project.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleEmptyTrash = async () => {
    setEmptying(true);
    try {
      for (const project of trashed) {
        await permanentlyDeleteProject(project);
      }
      await logActivity({
        action: 'Trash emptied',
        item: `${trashed.length} project${trashed.length === 1 ? '' : 's'}`,
        itemType: 'project',
        user: 'Administrator',
      });
      toast('Trash emptied.', 'success');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to empty trash.', 'error');
    } finally {
      setEmptying(false);
    }
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
            <Trash2 className="h-3.5 w-3.5" />
            Trash
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Project trash</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
            Deleted projects are kept here until you restore them or permanently delete them.
          </p>
        </div>

        <button
          onClick={() => setConfirm({ mode: 'bulk' })}
          disabled={trashed.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Empty trash
        </button>
      </div>

      {trashed.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-black/20 text-center">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-zinc-300">
            <Trash2 className="h-8 w-8" />
          </div>
          <p className="mt-4 text-sm font-medium text-white">Trash is empty</p>
          <p className="mt-2 max-w-sm text-sm text-zinc-500">Deleted projects will appear here with restore and delete actions.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {trashed.map(project => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="h-20 w-28 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                  {project.image ? (
                    <img src={project.image} alt={project.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-600">
                      <FolderKanban className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                  <p className="mt-1 max-w-2xl text-sm text-zinc-400">{project.shortDescription || project.description}</p>
                  <p className="mt-2 text-xs text-zinc-500">
                    Deleted {project.deletedAt ? new Date(project.deletedAt).toLocaleString() : 'recently'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => void handleRestore(project)}
                  disabled={busyId === project.id || emptying}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-zinc-100"
                >
                  <RotateCcw className="h-4 w-4" />
                  Restore
                </button>
                <button
                  onClick={() => setConfirm({ mode: 'single', project })}
                  disabled={busyId === project.id || emptying}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete forever
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {confirm && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-[#0A0A0B] p-6 text-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Confirmation</p>
                  <h2 className="mt-2 text-xl font-semibold">
                    {confirm.mode === 'bulk' ? 'Empty trash' : 'Delete project forever'}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setConfirm(null)}
                disabled={emptying}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-300 hover:bg-white hover:text-black"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-zinc-300">
              {confirm.mode === 'bulk'
                ? 'This will permanently remove every project in the trash. This action cannot be undone.'
                : `Are you sure you want to permanently delete "${confirm.project.name}"? This action cannot be undone.`}
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirm(null)}
                disabled={emptying}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const current = confirm;
                  setConfirm(null);
                  if (current.mode === 'bulk') {
                    void handleEmptyTrash();
                  } else {
                    void handleDeleteForever(current.project);
                  }
                }}
                disabled={emptying || (confirm.mode === 'single' && busyId === confirm.project.id)}
                className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-zinc-100"
              >
                {emptying ? 'Deleting...' : 'Confirm'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Trash;
