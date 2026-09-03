import React from 'react';
import { motion } from 'framer-motion';
import {
  FolderKanban,
  CheckCircle2,
  Trash2,
  Star,
  Sparkles,
  Activity,
  Loader2,
} from 'lucide-react';
import { Project } from '../types';
import { AdminSection } from './DashboardLayout';

interface OverviewProps {
  projects: Project[];
  loading: boolean;
  onNavigate: (section: AdminSection) => void;
}

interface StatCard {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
  section: AdminSection;
}

export const Overview: React.FC<OverviewProps> = ({ projects, loading, onNavigate }) => {
  const active = projects.filter(p => !p.isDeleted);
  const trash = projects.filter(p => p.isDeleted);
  const published = active.filter(p => p.status === 'Published').length;
  const featured = active.filter(p => p.featured).length;
  const drafts = active.filter(p => p.status === 'Draft').length;

  const stats: StatCard[] = [
    { label: 'Total Projects', value: projects.length, icon: <FolderKanban className="w-5 h-5" />, accent: 'bg-[#16A34A]', section: 'projects' },
    { label: 'Published', value: published, icon: <CheckCircle2 className="w-5 h-5" />, accent: 'bg-[#22C55E]', section: 'projects' },
    { label: 'Drafts', value: drafts, icon: <Activity className="w-5 h-5" />, accent: 'bg-[#15803D]', section: 'projects' },
    { label: 'Featured', value: featured, icon: <Star className="w-5 h-5" />, accent: 'bg-[#4ADE80]', section: 'projects' },
    { label: 'Trashed', value: trash.length, icon: <Trash2 className="w-5 h-5" />, accent: 'bg-[#86EFAC]', section: 'trash' },
  ];

  // Skills are static definitions; count for display.
  const skillsCount = 3 + 4 + 3 + 2 + 2; // frontend/backend/mobile/database/tools clusters

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111827]">Overview</h1>
        <p className="text-sm text-[#6B7280] mt-1">A snapshot of your portfolio's health and content.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-[#16A34A]">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((stat, i) => (
            <motion.button
              key={stat.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              onClick={() => onNavigate(stat.section)}
              className="text-left bg-white rounded-2xl border border-[#DCFCE7] shadow-sm hover:shadow-lg hover:border-[#22C55E] p-5 transition-all cursor-pointer"
            >
              <div className={`inline-flex p-2.5 rounded-xl text-white ${stat.accent} shadow-md mb-4`}>
                {stat.icon}
              </div>
              <p className="text-3xl font-bold text-[#111827]">{stat.value}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mt-1">{stat.label}</p>
            </motion.button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills summary */}
        <div className="bg-white rounded-2xl border border-[#DCFCE7] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-[#F0FDF4] text-[#16A34A]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111827]">Skills</h2>
              <p className="text-xs text-[#6B7280]">Displayed in the public marquee</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-[#111827]">{skillsCount}</p>
          <p className="text-xs text-[#6B7280] mt-1">Technologies across four moving rows</p>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl border border-[#DCFCE7] p-6">
          <h2 className="text-base font-bold text-[#111827] mb-4">Quick Actions</h2>
          <div className="space-y-2.5">
            <button
              onClick={() => onNavigate('add-project')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#16A34A] text-white text-sm font-semibold hover:bg-[#15803D] transition-all cursor-pointer"
            >
              Add a new project
              <span aria-hidden="true">→</span>
            </button>
            <button
              onClick={() => onNavigate('projects')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-[#DCFCE7] text-[#15803D] text-sm font-semibold hover:bg-[#F0FDF4] transition-all cursor-pointer"
            >
              Manage existing projects
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;