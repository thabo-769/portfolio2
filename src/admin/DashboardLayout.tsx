import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  Bell,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Mail,
  Menu,
  Moon,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  TabletSmartphone,
  Sun,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type AdminSection =
  | 'overview'
  | 'projects'
  | 'content'
  | 'messages'
  | 'remoteDevices'
  | 'media'
  | 'analytics'
  | 'activity'
  | 'trash'
  | 'settings';

interface DashboardLayoutProps {
  active: AdminSection;
  onNavigate: (section: AdminSection) => void;
  onQuickAdd: () => void;
  projectCount: number;
  trashCount: number;
  unreadCount: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusLabel: string;
  onLogout: () => Promise<void>;
  children: React.ReactNode;
}

const NAV_GROUPS: Array<{
  label: string;
  items: Array<{ id: AdminSection; label: string; icon: React.ReactNode }>;
}> = [
  {
    label: 'Main',
    items: [{ id: 'overview', label: 'Dashboard', icon: <LayoutDashboard className="h-4.5 w-4.5" /> }],
  },
  {
    label: 'Portfolio',
    items: [
      { id: 'projects', label: 'Projects', icon: <FolderKanban className="h-4.5 w-4.5" /> },
      { id: 'content', label: 'Content', icon: <FileText className="h-4.5 w-4.5" /> },
    ],
  },
  {
    label: 'Communication',
    items: [
      { id: 'messages', label: 'Messages', icon: <Mail className="h-4.5 w-4.5" /> },
      { id: 'remoteDevices', label: 'Remote Access', icon: <TabletSmartphone className="h-4.5 w-4.5" /> },
    ],
  },
  {
    label: 'Insights',
    items: [
      { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-4.5 w-4.5" /> },
      { id: 'activity', label: 'Activity', icon: <Activity className="h-4.5 w-4.5" /> },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'trash', label: 'Trash', icon: <Trash2 className="h-4.5 w-4.5" /> },
      { id: 'settings', label: 'Settings', icon: <Settings className="h-4.5 w-4.5" /> },
    ],
  },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  active,
  onNavigate,
  onQuickAdd,
  projectCount,
  trashCount,
  unreadCount,
  searchValue,
  onSearchChange,
  statusLabel,
  onLogout,
  children,
}) => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lightMode, setLightMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('portfolio_admin_theme') === 'light';
    } catch {
      return false;
    }
  });

  const toggleLightMode = () => {
    setLightMode(current => {
      const next = !current;
      try {
        localStorage.setItem('portfolio_admin_theme', next ? 'light' : 'dark');
      } catch {
        // The preference is optional when browser storage is unavailable.
      }
      return next;
    });
  };

  const go = (section: AdminSection) => {
    setMobileOpen(false);
    onNavigate(section);
  };

  const openNavigation = () => {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      setSidebarOpen(true);
    } else {
      setMobileOpen(true);
    }
  };

  const navButton = (id: AdminSection, label: string, icon: React.ReactNode) => {
    const isActive = active === id;
    return (
      <button
        key={id}
        onClick={() => go(id)}
        className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm transition-all ${
          isActive
            ? 'bg-white text-black shadow-[0_0_24px_rgba(255,255,255,0.16)]'
            : 'text-[#A1A1AA] hover:bg-[#0C0C0C] hover:text-white'
        }`}
      >
        <span className={`shrink-0 ${isActive ? 'text-black' : 'text-zinc-300'}`}>{icon}</span>
        <span className="font-medium">{label}</span>
        {id === 'trash' && trashCount > 0 && (
          <span className="ml-auto rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-black">
            {trashCount}
          </span>
        )}
        {id === 'messages' && unreadCount > 0 && (
          <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-black">
            {unreadCount}
          </span>
        )}
        {id === 'projects' && projectCount > 0 && (
          <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-zinc-200">
            {projectCount}
          </span>
        )}
      </button>
    );
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-[#000000] text-white">
      <div className="flex items-start gap-3 border-b border-white/10 px-5 py-5">
        <button
          type="button"
          onClick={() => {
            if (mobileOpen) {
              setMobileOpen(false);
            } else {
              setSidebarOpen(false);
            }
          }}
          aria-label="Close navigation sidebar"
          title="Close navigation sidebar"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white text-black transition-transform hover:scale-105"
        >
          <ShieldCheck className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#71717A]">Private Control Center</p>
          <h1 className="mt-1 text-sm font-bold uppercase tracking-tight text-white">Portfolio Dashboard</h1>
          <p className="truncate text-xs text-zinc-500">{user?.email ?? 'Administrator'}</p>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map(group => (
          <div key={group.label} className="space-y-2">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-600">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map(item => navButton(item.id, item.label, item.icon))}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t border-white/10 px-4 py-4">
        <div className="rounded-2xl border border-[#1F1F1F] bg-[#0C0C0C] px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#71717A]">Portfolio Status</p>
          <p className="mt-1 text-sm font-medium text-white">{statusLabel}</p>
        </div>

        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm text-[#A1A1AA] transition-all hover:bg-[#0C0C0C] hover:text-white"
        >
          <LayoutGrid className="h-4.5 w-4.5" />
          <span>View Portfolio</span>
        </Link>

        <button
          onClick={() => void onLogout()}
          className="flex w-full items-center gap-3 rounded-2xl border border-white bg-white px-3.5 py-3 text-xs font-bold uppercase tracking-wider text-black transition-all hover:bg-[#A1A1AA]"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className={`admin-theme min-h-screen bg-[#000000] text-white ${lightMode ? 'admin-light' : ''}`}>
      {sidebarOpen && (
        <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-white/10 lg:block">
          {sidebar}
        </aside>
      )}

      {mobileOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-80 max-w-[90vw] border-r border-white/10 shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
              className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 p-2 text-white"
            >
              <X className="h-4 w-4" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className={sidebarOpen ? 'lg:pl-72' : ''}>
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#000000]/90 backdrop-blur-md">
          <div className="flex flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={openNavigation}
                  className={`rounded-2xl border border-white/10 bg-white/5 p-2 text-white ${sidebarOpen ? 'lg:hidden' : ''}`}
                  aria-label="Open navigation"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.32em] text-[#71717A]">Dashboard</p>
                  <h2 className="text-lg font-bold uppercase tracking-tight text-white">
                    {NAV_GROUPS.flatMap(group => group.items).find(item => item.id === active)?.label ?? 'Dashboard'}
                  </h2>
                </div>
              </div>

              <div className="hidden items-center gap-2 lg:flex">
                <div className="rounded-full border border-white/10 bg-[#0C0C0C]/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#A1A1AA]">
                  {statusLabel}
                </div>
                <button
                  onClick={onQuickAdd}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_24px_rgba(255,255,255,0.18)] transition-all hover:bg-[#A1A1AA]"
                >
                  <Plus className="h-4 w-4" />
                  Add Projects
                </button>
                <button
                  onClick={toggleLightMode}
                  aria-label={lightMode ? 'Use dark mode' : 'Use light mode'}
                  aria-pressed={lightMode}
                  className="rounded-full border border-white/10 bg-white/5 p-2 text-white transition-colors hover:bg-white hover:text-black"
                >
                  {lightMode ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
                </button>
                <button
                  aria-label="Notifications"
                  className="rounded-full border border-white/10 bg-white/5 p-2 text-white"
                >
                  <Bell className="h-4.5 w-4.5" />
                </button>
                <div className="rounded-full border border-white/10 bg-[#0C0C0C]/85 px-3 py-2 text-xs text-[#A1A1AA]">
                  {user?.email ?? 'Administrator'}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  value={searchValue}
                  onChange={e => onSearchChange(e.target.value)}
                  placeholder="Search projects, messages, or devices"
                  className="w-full rounded-2xl border border-white/10 bg-[#0C0C0C]/85 py-3 pl-11 pr-4 text-sm text-white placeholder:text-[#71717A] outline-none transition-all focus:border-white/30 focus:bg-[#18181B]"
                />
              </div>

              <div className="flex items-center gap-2 sm:hidden">
                <button
                  onClick={onQuickAdd}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-bold uppercase tracking-wider text-black"
                >
                  <Plus className="h-4 w-4" />
                  Add Projects
                </button>
                <button
                  onClick={toggleLightMode}
                  aria-label={lightMode ? 'Use dark mode' : 'Use light mode'}
                  aria-pressed={lightMode}
                  className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white"
                >
                  {lightMode ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
                </button>
                <button
                  aria-label="Notifications"
                  className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white"
                >
                  <Bell className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => void onLogout()}
                  className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white"
                  aria-label="Logout"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
