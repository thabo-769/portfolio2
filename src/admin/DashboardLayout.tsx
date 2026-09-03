import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  Sparkles,
  UserRound,
  Trash2,
  Settings,
  LogOut,
  LayoutGrid,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type AdminSection =
  | 'overview'
  | 'projects'
  | 'add-project'
  | 'skills'
  | 'portfolio'
  | 'trash'
  | 'settings';

interface DashboardLayoutProps {
  active: AdminSection;
  onNavigate: (section: AdminSection) => void;
  projectCount: number;
  trashCount: number;
  onLogout: () => Promise<void>;
  children: React.ReactNode;
}

const NAV_ITEMS: { id: AdminSection; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4.5 h-4.5" /> },
  { id: 'projects', label: 'Projects', icon: <FolderKanban className="w-4.5 h-4.5" /> },
  { id: 'add-project', label: 'Add Project', icon: <PlusCircle className="w-4.5 h-4.5" /> },
  { id: 'skills', label: 'Skills', icon: <Sparkles className="w-4.5 h-4.5" /> },
  { id: 'portfolio', label: 'Portfolio', icon: <UserRound className="w-4.5 h-4.5" /> },
  { id: 'trash', label: 'Trash', icon: <Trash2 className="w-4.5 h-4.5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-4.5 h-4.5" /> },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  active,
  onNavigate,
  projectCount,
  trashCount,
  onLogout,
  children,
}) => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const go = (section: AdminSection) => {
    setMobileOpen(false);
    onNavigate(section);
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-6 py-6 flex items-center gap-3 border-b border-[#DCFCE7]">
        <div className="p-2.5 rounded-2xl bg-white text-[#16A34A] shadow-lg">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Admin Dashboard</p>
          <p className="text-xs text-[#DCFCE7]/80">Portfolio Control Center</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-[#16A34A] shadow-md font-semibold'
                  : 'text-[#DCFCE7]/85 hover:bg-white/15 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.id === 'trash' && trashCount > 0 && (
                <span className="ml-auto text-[10px] font-bold bg-[#22C55E] text-[#111827] rounded-full px-2 py-0.5">
                  {trashCount}
                </span>
              )}
              {item.id === 'projects' && projectCount > 0 && (
                <span className="ml-auto text-[10px] font-bold bg-white/20 text-white rounded-full px-2 py-0.5">
                  {projectCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-4 space-y-1">
        <div className="px-3.5 py-3 mb-1 rounded-xl bg-white/10 border border-white/20">
          <p className="text-xs text-[#DCFCE7]/70">Signed in as</p>
          <p className="text-sm text-white font-medium truncate">{user?.email ?? 'Administrator'}</p>
        </div>
        <Link
          to="/"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-[#DCFCE7]/85 hover:bg-white/15 hover:text-white transition-all"
          onClick={() => setMobileOpen(false)}
        >
          <LayoutGrid className="w-4.5 h-4.5" />
          <span>View Portfolio</span>
        </Link>
        <button
          onClick={() => void onLogout()}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-[#111827] bg-white hover:bg-[#DCFCE7] font-semibold transition-all cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5 text-[#16A34A]" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0FDF4] text-[#111827] font-sans">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-72 bg-[#16A34A]">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-[#16A34A] shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="absolute top-4 right-4 p-1.5 rounded-lg text-white hover:bg-white/15 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-50 bg-[#16A34A] text-white flex items-center justify-between px-5 py-4 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-white/20"><ShieldCheck className="w-5 h-5" /></div>
          <span className="font-bold text-sm">Admin Dashboard</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="p-2 rounded-xl hover:bg-white/15 cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <main className="lg:pl-72">
        <div className="px-5 sm:px-8 py-8 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;