import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, RotateCcw, AlertTriangle, X, FolderKanban, CalendarDays } from 'lucide-react';
import { Project } from '../types';

interface TrashProps {
  projects: Project[];
  loading: boolean;
  onRestore: (project: Project) => void;
  onPermanentDelete: (project: Project) => void;
}

export const Trash: React.FC<TrashProps> = ({ projects, loading, onRestore, onPermanentDelete }) => {
  const [confirmTarget, setConfirmTarget] = useState<Project | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111827]">Trash</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          {projects.length} trashed project{projects.length === 1 ? '' : 's'} · recoverable
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-[#DCFCE7]">
          <div className="p-4 rounded-2xl bg-[#F0FDF4] text-[#16A34A] mb-4">
            <Trash2 className="w-8 h-8" />
          </div>
          <p className="font-semibold text-[#111827]">Trash is empty</p>
          <p className="text-sm text-[#6B7280] mt-1">Deleted projects appear here so you can restore them.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(project => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-4 bg-white rounded-2xl border border-[#FDE68A] shadow-sm p-4"
            >
              <div className="h-16 w-20 shrink-0 rounded-xl bg-[#F0FDF4] overflow-hidden flex items-center justify-center text-[#16A34A]/40">
                {project.image && !project.image.startsWith('gs://') ? (
                  <img src={project.image} alt={project.name} className="w-full h-full object-cover" />
                ) : (
                  <FolderKanban className="w-6 h-6" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#111827] truncate">{project.name}</h3>
                <p className="text-xs text-[#6B7280] mt-0.5 flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5" />
                  Deleted {project.deletedAt ? new Date(project.deletedAt).toLocaleDateString() : 'recently'}
                </p>
              </div>

              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={() => onRestore(project)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore
                </button>
                <button
                  onClick={() => setConfirmTarget(project)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#FDE68A] text-[#92400E] hover:bg-[#FEF9C3] text-xs font-semibold transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete forever
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {confirmTarget && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md bg-white rounded-2xl border border-[#FDE68A] p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-confirm-title"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#FEF9C3] text-[#92400E]">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h2 id="delete-confirm-title" className="text-base font-bold text-[#111827]">Permanent delete</h2>
              </div>
              <button
                onClick={() => setConfirmTarget(null)}
                aria-label="Close"
                className="p-1 rounded-lg text-[#6B7280] hover:text-[#16A34A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-[#374151] leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-[#111827]">"{confirmTarget.name}"</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-4">
              <button
                onClick={() => setConfirmTarget(null)}
                className="px-4 py-2 rounded-xl border border-[#D1D5DB] text-[#374151] hover:border-[#16A34A] hover:text-[#16A34A] text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const target = confirmTarget;
                  setConfirmTarget(null);
                  onPermanentDelete(target);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#111827] hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Forever
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Trash;