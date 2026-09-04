import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Archive,
  Mail,
  MailOpen,
  Loader2,
  MessageSquareText,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { usePortfolioCms } from '../context/PortfolioCmsContext';
import { useToast } from './ToastContext';
import type { ContactMessage } from '../types';

type FilterKey = 'all' | 'unread' | 'read' | 'archived';

export const MessagesSection: React.FC = () => {
  const { messages, loading, markMessageRead, archiveMessage, deleteMessage, logActivity } = usePortfolioCms();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const visibleMessages = useMemo(() => {
    let list = [...messages].sort((a, b) => b.createdAt - a.createdAt);
    if (filter === 'unread') list = list.filter(message => !message.read && !message.archived);
    if (filter === 'read') list = list.filter(message => message.read && !message.archived);
    if (filter === 'archived') list = list.filter(message => message.archived);

    const term = query.trim().toLowerCase();
    if (term) {
      list = list.filter(message =>
        [message.senderName, message.email, message.subject, message.message]
          .join(' ')
          .toLowerCase()
          .includes(term)
      );
    }
    return list;
  }, [messages, filter, query]);

  const unreadCount = messages.filter(message => !message.read && !message.archived).length;

  const openMessage = async (message: ContactMessage) => {
    setSelected(message);
    if (!message.read) {
      await markMessageRead(message.id, true);
    }
  };

  const handleArchive = async (message: ContactMessage) => {
    await archiveMessage(message.id);
    await logActivity({
      action: 'Message archived',
      item: message.subject || message.senderName,
      itemType: 'message',
      user: 'Administrator',
    });
    toast('Message archived.', 'success');
  };

  const handleDelete = async (message: ContactMessage) => {
    await deleteMessage(message.id);
    await logActivity({
      action: 'Message deleted',
      item: message.subject || message.senderName,
      itemType: 'message',
      user: 'Administrator',
    });
    toast('Message deleted.', 'info');
    if (selected?.id === message.id) setSelected(null);
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
            <Mail className="h-3.5 w-3.5" />
            Messages
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Messages from visitors</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
            Review messages sent through your portfolio contact channels, mark them as read, archive them, or delete them from the inbox.
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300">
          {unreadCount} unread
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-[1.75rem] border border-white/10 bg-white/5 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search messages"
            className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-white/25"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'unread', label: 'Unread' },
            { key: 'read', label: 'Read' },
            { key: 'archived', label: 'Archived' },
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

      {visibleMessages.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-black/20 text-center">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-zinc-300">
            <MessageSquareText className="h-8 w-8" />
          </div>
          <p className="mt-4 text-sm font-medium text-white">No messages found</p>
          <p className="mt-2 max-w-sm text-sm text-zinc-500">
            {query ? 'Try a different search term.' : 'Messages from the contact form will show here.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-black/30 text-left text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                <tr>
                  <th className="px-4 py-4">Sender</th>
                  <th className="px-4 py-4">Subject</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Date</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {visibleMessages.map((message, index) => (
                  <motion.tr
                    key={message.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02, duration: 0.2 }}
                    className={`cursor-pointer bg-black/10 hover:bg-white/5 ${message.read ? '' : 'border-l-2 border-white'}`}
                    onClick={() => void openMessage(message)}
                  >
                    <td className="px-4 py-4 align-top">
                      <p className="text-sm font-semibold text-white">{message.senderName}</p>
                      <p className="text-sm text-zinc-400">{message.email}</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p className="text-sm font-medium text-white">{message.subject || 'No subject'}</p>
                      <p className="mt-1 line-clamp-2 max-w-xl text-sm text-zinc-500">{message.message}</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300">
                        {message.archived ? 'Archived' : message.read ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top text-sm text-zinc-400">
                      {new Date(message.createdAt).toLocaleDateString()} <span className="text-zinc-600">·</span>{' '}
                      {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={event => {
                            event.stopPropagation();
                            void markMessageRead(message.id, !message.read);
                          }}
                          className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-300 hover:bg-white hover:text-black"
                        >
                          {message.read ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={event => {
                            event.stopPropagation();
                            void handleArchive(message);
                          }}
                          className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-300 hover:bg-white hover:text-black"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                        <button
                          onClick={event => {
                            event.stopPropagation();
                            void handleDelete(message);
                          }}
                          className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-300 hover:bg-white hover:text-black"
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

      {selected && (
        <MessageModal
          message={selected}
          onClose={() => setSelected(null)}
          onMarkRead={message => void markMessageRead(message.id, true)}
          onArchive={message => void handleArchive(message)}
          onDelete={message => void handleDelete(message)}
        />
      )}
    </div>
  );
};

function MessageModal({
  message,
  onClose,
  onMarkRead,
  onArchive,
  onDelete,
}: {
  message: ContactMessage;
  onClose: () => void;
  onMarkRead: (message: ContactMessage) => void;
  onArchive: (message: ContactMessage) => void;
  onDelete: (message: ContactMessage) => void;
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-[#0A0A0B] p-6 text-white shadow-2xl"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Message details</p>
            <h2 className="mt-2 text-2xl font-semibold">{message.subject || 'No subject'}</h2>
            <p className="mt-1 text-sm text-zinc-400">
              {message.senderName} · {message.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-300 hover:bg-white hover:text-black"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{message.message}</p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button
            onClick={() => onMarkRead(message)}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            Mark as read
          </button>
          <button
            onClick={() => onArchive(message)}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            Archive
          </button>
          <button
            onClick={() => onDelete(message)}
            className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-zinc-100"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default MessagesSection;
