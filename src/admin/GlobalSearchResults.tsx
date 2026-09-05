import React, { useMemo, useSyncExternalStore } from 'react';
import { FolderKanban, Mail, TabletSmartphone } from 'lucide-react';
import { usePortfolioCms } from '../context/PortfolioCmsContext';
import { AdminSection } from './DashboardLayout';
import { getRemoteDevicesState, subscribeRemoteDevicesState } from '../communication/remoteDevices/services/remoteDevicesStore';

interface GlobalSearchResultsProps {
  query: string;
  onNavigate: (section: AdminSection) => void;
}

export const GlobalSearchResults: React.FC<GlobalSearchResultsProps> = ({ query, onNavigate }) => {
  const { projects, messages } = usePortfolioCms();
  const remoteDevices = useSyncExternalStore(subscribeRemoteDevicesState, getRemoteDevicesState, getRemoteDevicesState).devices;

  const term = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!term) return null;

    const projectMatches = projects.filter(project =>
      [project.name, project.shortDescription, project.description, project.category, ...(project.technologies ?? [])]
        .join(' ')
        .toLowerCase()
        .includes(term)
    );

    const messageMatches = messages.filter(message =>
      [message.senderName, message.email, message.subject, message.message].join(' ').toLowerCase().includes(term)
    );

    const deviceMatches = remoteDevices.filter(device =>
      [device.name, device.operatingSystem, device.type, device.connectionMethod, ...(device.connectionMethods ?? [])]
        .join(' ')
        .toLowerCase()
        .includes(term)
    );

    return { projectMatches, messageMatches, deviceMatches };
  }, [term, projects, messages, remoteDevices]);

  if (!results) return null;

  const sections = [
    {
      id: 'projects' as AdminSection,
      label: 'Projects',
      icon: <FolderKanban className="h-4 w-4" />,
      items: results.projectMatches.map(item => item.name),
    },
    {
      id: 'messages' as AdminSection,
      label: 'Messages',
      icon: <Mail className="h-4 w-4" />,
      items: results.messageMatches.map(item => item.subject || item.senderName),
    },
    {
      id: 'remoteDevices' as AdminSection,
      label: 'Remote Access',
      icon: <TabletSmartphone className="h-4 w-4" />,
      items: results.deviceMatches.map(item => item.name),
    },
  ];

  return (
    <div className="mb-6 rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-white">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Global search</p>
          <h2 className="mt-2 text-lg font-semibold">Results for "{query}"</h2>
        </div>
        <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-zinc-400">
          {sections.reduce((count, section) => count + section.items.length, 0)} matches
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-5">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => onNavigate(section.id)}
            className="rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition-all hover:bg-white/5"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              {section.icon}
              {section.label}
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">{section.items.length}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {section.items.slice(0, 3).map(item => (
                <span key={item} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-zinc-300">
                  {item}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GlobalSearchResults;
