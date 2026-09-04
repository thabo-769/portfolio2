import React, { useMemo, useState } from 'react';
import { Loader2, Save, Plus, Trash2, FileText, UserRound, Mail, Sparkles } from 'lucide-react';
import { usePortfolioCms } from '../context/PortfolioCmsContext';
import { useToast } from './ToastContext';
import type { PortfolioContent, PortfolioSettings } from '../types';

type TabKey = 'home' | 'about' | 'contact';

const emptyLink = { label: '', url: '' };

export const ContentSection: React.FC = () => {
  const { content, settings, updateContent, updateSettings, logActivity, loading } = usePortfolioCms();
  const { toast } = useToast();
  const [tab, setTab] = useState<TabKey>('home');
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<PortfolioContent>(content);
  const [linkDraft, setLinkDraft] = useState(settings.socialLinks.length > 0 ? settings.socialLinks : [emptyLink]);

  const tabs = useMemo(
    () => [
      { key: 'home' as const, label: 'Home', icon: <Sparkles className="h-4 w-4" /> },
      { key: 'about' as const, label: 'About', icon: <UserRound className="h-4 w-4" /> },
      { key: 'contact' as const, label: 'Contact', icon: <Mail className="h-4 w-4" /> },
    ],
    []
  );

  const updateHome = (patch: Partial<PortfolioContent['home']>) =>
    setDraft(prev => ({ ...prev, home: { ...prev.home, ...patch } }));
  const updateAbout = (patch: Partial<PortfolioContent['about']>) =>
    setDraft(prev => ({ ...prev, about: { ...prev.about, ...patch } }));
  const updateContact = (patch: Partial<PortfolioContent['contact']>) =>
    setDraft(prev => ({ ...prev, contact: { ...prev.contact, ...patch } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const nextContent: PortfolioContent = {
        ...draft,
        id: content.id,
        updatedAt: Date.now(),
      };

      const nextSettings: PortfolioSettings = {
        ...settings,
        portfolioName: draft.portfolioName,
        email: draft.contact.email,
        phone: draft.contact.phone,
        availabilityStatus: draft.contact.availabilityStatus,
        socialLinks: linkDraft.filter(link => link.label.trim() || link.url.trim()),
        updatedAt: Date.now(),
      };

      await updateContent(nextContent);
      await updateSettings(nextSettings);
      await logActivity({
        action: 'Content updated',
        item: tab === 'home' ? 'Home section' : tab === 'about' ? 'About section' : 'Contact section',
        itemType: 'content',
        user: 'Administrator',
      });
      toast('Content updated successfully.', 'success');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to save content.', 'error');
    } finally {
      setSaving(false);
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
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
          <FileText className="h-3.5 w-3.5" />
          Content
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Portfolio content</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
          Update the public hero, about copy, and contact information without touching the source code.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-[1.5rem] border border-white/10 bg-white/5 p-2">
        {tabs.map(item => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all ${
              tab === item.key ? 'bg-white text-black' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
        <div className="grid gap-5">
          {tab === 'home' && (
            <div className="grid gap-4">
              <Field label="Portfolio headline">
                <input
                  value={draft.home.headline}
                  onChange={e => updateHome({ headline: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                />
              </Field>
              <Field label="Subtitle">
                <input
                  value={draft.home.subtitle}
                  onChange={e => updateHome({ subtitle: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                />
              </Field>
              <Field label="Introduction">
                <textarea
                  value={draft.home.introduction}
                  onChange={e => updateHome({ introduction: e.target.value })}
                  className="min-h-36 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="CTA text">
                  <input
                    value={draft.home.ctaText}
                    onChange={e => updateHome({ ctaText: e.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                  />
                </Field>
                <Field label="Availability status">
                  <input
                    value={draft.home.availabilityStatus}
                    onChange={e => updateHome({ availabilityStatus: e.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                  />
                </Field>
              </div>
              <Field label="Portfolio name">
                <input
                  value={draft.portfolioName}
                  onChange={e => setDraft(prev => ({ ...prev, portfolioName: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                />
              </Field>
            </div>
          )}

          {tab === 'about' && (
            <div className="grid gap-4">
              <Field label="About description">
                <textarea
                  value={draft.about.description}
                  onChange={e => updateAbout({ description: e.target.value })}
                  className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                />
              </Field>
              <Field label="Biography">
                <textarea
                  value={draft.about.biography}
                  onChange={e => updateAbout({ biography: e.target.value })}
                  className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                />
              </Field>
              <Field label="Developer introduction">
                <textarea
                  value={draft.about.introduction}
                  onChange={e => updateAbout({ introduction: e.target.value })}
                  className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                />
              </Field>
              <Field label="Other portfolio information">
                <textarea
                  value={draft.about.otherInfo}
                  onChange={e => updateAbout({ otherInfo: e.target.value })}
                  className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                />
              </Field>
            </div>
          )}

          {tab === 'contact' && (
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email">
                  <input
                    value={draft.contact.email}
                    onChange={e => updateContact({ email: e.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                  />
                </Field>
                <Field label="Phone">
                  <input
                    value={draft.contact.phone}
                    onChange={e => updateContact({ phone: e.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                  />
                </Field>
              </div>

              <Field label="Availability status">
                <input
                  value={draft.contact.availabilityStatus}
                  onChange={e => updateContact({ availabilityStatus: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                />
              </Field>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Social links</p>
                    <p className="text-xs text-zinc-500">These links appear in the footer and contact cards.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLinkDraft(prev => [...prev, emptyLink])}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300 hover:bg-white/10"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add link
                  </button>
                </div>

                <div className="space-y-3">
                  {linkDraft.map((link, index) => (
                    <div key={`${link.label}-${index}`} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                      <input
                        value={link.label}
                        onChange={e => {
                          const value = e.target.value;
                          setLinkDraft(prev => prev.map((item, idx) => (idx === index ? { ...item, label: value } : item)));
                        }}
                        placeholder="Label"
                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                      />
                      <input
                        value={link.url}
                        onChange={e => {
                          const value = e.target.value;
                          setLinkDraft(prev => prev.map((item, idx) => (idx === index ? { ...item, url: value } : item)));
                        }}
                        placeholder="https://..."
                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setLinkDraft(prev => prev.filter((_, idx) => idx !== index))}
                        className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-zinc-300 hover:bg-white hover:text-black"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => {
              setDraft(content);
              setLinkDraft(settings.socialLinks.length > 0 ? settings.socialLinks : [emptyLink]);
            }}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Reset
          </button>
          <button
            onClick={() => void handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save content'}
          </button>
        </div>
      </div>
    </div>
  );
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

export default ContentSection;
