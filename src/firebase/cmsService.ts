import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  addDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { getFirestoreDB, getFirebaseStorage, isFirebaseConfigured } from './config';
import {
  defaultPortfolioContent,
  defaultPortfolioSettings,
  defaultSkills,
} from '../data/portfolioDefaults';
import { initialReferrals } from '../data/referrals';
import type {
  ActivityLogEntry,
  AnalyticsEvent,
  AnalyticsSummary,
  ContactMessage,
  MediaAsset,
  PortfolioContent,
  PortfolioSettings,
  Project,
  Referral,
  Skill,
} from '../types';

type CollectionListener<T> = (items: T[], error: string | null) => void;
type DocumentListener<T> = (item: T, error: string | null) => void;

const STORAGE_PREFIX = 'thabo_cms_';

const KEYS = {
  projects: `${STORAGE_PREFIX}projects_v1`,
  skills: `${STORAGE_PREFIX}skills_v1`,
  referrals: `${STORAGE_PREFIX}referrals_v1`,
  messages: `${STORAGE_PREFIX}messages_v1`,
  media: `${STORAGE_PREFIX}media_v1`,
  activity: `${STORAGE_PREFIX}activity_v1`,
  analytics: `${STORAGE_PREFIX}analytics_v1`,
  content: `${STORAGE_PREFIX}content_v1`,
  settings: `${STORAGE_PREFIX}settings_v1`,
} as const;

const DOC_IDS = {
  content: 'main',
  settings: 'main',
} as const;

const DEFAULT_ANALYTICS: AnalyticsSummary = {
  portfolioViews: 0,
  projectViews: 0,
  githubClicks: 0,
  liveClicks: 0,
  contactSubmissions: 0,
  referralViews: 0,
  mostViewedProjects: [],
  lastUpdated: null,
};

function now(): number {
  return Date.now();
}

function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota / privacy-mode failures. The caller still gets the
    // in-memory update via the subscription callback.
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(eventName(key)));
  }
}

function eventName(key: string): string {
  return `${key}:changed`;
}

function readList<T>(key: string, fallback: T[] = []): T[] {
  const value = readJson<unknown>(key, fallback);
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function writeList<T>(key: string, value: T[]): void {
  writeJson(key, value);
}

function readDoc<T>(key: string, fallback: T): T {
  const value = readJson<unknown>(key, fallback);
  return value && typeof value === 'object' ? (value as T) : fallback;
}

function writeDoc<T>(key: string, value: T): void {
  writeJson(key, value);
}

function subscribeLocalList<T>(key: string, fallback: T[], onUpdate: CollectionListener<T>): Unsubscribe {
  const emit = () => onUpdate(readList<T>(key, fallback), null);
  emit();

  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handle = () => emit();
  window.addEventListener(eventName(key), handle);
  window.addEventListener('storage', handle);
  return () => {
    window.removeEventListener(eventName(key), handle);
    window.removeEventListener('storage', handle);
  };
}

function subscribeLocalDoc<T>(key: string, fallback: T, onUpdate: DocumentListener<T>): Unsubscribe {
  const emit = () => onUpdate(readDoc<T>(key, fallback), null);
  emit();

  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handle = () => emit();
  window.addEventListener(eventName(key), handle);
  window.addEventListener('storage', handle);
  return () => {
    window.removeEventListener(eventName(key), handle);
    window.removeEventListener('storage', handle);
  };
}

function sortByDisplayOrder<T extends { displayOrder?: number; createdAt?: number; updatedAt?: number; name?: string }>(
  list: T[]
): T[] {
  return [...list].sort((a, b) => {
    const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    const createdA = a.updatedAt ?? a.createdAt ?? 0;
    const createdB = b.updatedAt ?? b.createdAt ?? 0;
    if (createdA !== createdB) return createdB - createdA;
    return String(a.name ?? '').localeCompare(String(b.name ?? ''));
  });
}

function sortByNewest<T extends { createdAt?: number; updatedAt?: number }>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    const aTime = a.createdAt ?? a.updatedAt ?? 0;
    const bTime = b.createdAt ?? b.updatedAt ?? 0;
    return bTime - aTime;
  });
}

function tsToNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().getTime();
  }
  return fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(item => String(item)).filter(Boolean) : [];
}

function normalizeBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true';
  return fallback;
}

function normalizeProject(raw: Record<string, unknown>, id: string): Project {
  const name = String(raw.name ?? raw.title ?? 'Untitled Project');
  const description = String(raw.description ?? raw.longDescription ?? '');
  const shortDescription = String(raw.shortDescription ?? description).slice(0, 220);
  return {
    id,
    name,
    shortDescription,
    description,
    category: String(raw.category ?? 'Other'),
    technologies: asStringArray(raw.technologies),
    image: String(raw.image ?? ''),
    images: asStringArray(raw.images),
    githubUrl: String(raw.githubUrl ?? ''),
    liveUrl: String(raw.liveUrl ?? ''),
    status: String(raw.status ?? 'Published'),
    featured: normalizeBoolean(raw.featured),
    displayOrder: Number(raw.displayOrder ?? tsToNumber(raw.createdAt, now())),
    completionDate: String(raw.completionDate ?? new Date().toISOString()),
    client: String(raw.client ?? ''),
    projectType: String(raw.projectType ?? ''),
    features: asStringArray(raw.features),
    challenges: String(raw.challenges ?? ''),
    solutions: String(raw.solutions ?? ''),
    results: String(raw.results ?? ''),
    createdAt: tsToNumber(raw.createdAt, now()),
    updatedAt: tsToNumber(raw.updatedAt, now()),
    deletedAt:
      raw.deletedAt === null || raw.deletedAt === undefined || raw.deletedAt === ''
        ? null
        : tsToNumber(raw.deletedAt, now()),
    isDeleted: normalizeBoolean(raw.isDeleted, raw.deletedAt !== null && raw.deletedAt !== undefined && raw.deletedAt !== ''),
  };
}

function normalizeSkill(raw: Record<string, unknown>, id: string): Skill {
  return {
    id,
    name: String(raw.name ?? 'Untitled Skill'),
    category: String(raw.category ?? 'Other'),
    proficiency: (String(raw.proficiency ?? 'Advanced') as Skill['proficiency']),
    years: Number(raw.years ?? 0),
    projectsCount: Number(raw.projectsCount ?? 0),
    description: String(raw.description ?? ''),
    iconName: String(raw.iconName ?? raw.icon ?? 'sparkles'),
    icon: String(raw.icon ?? raw.iconName ?? 'sparkles'),
    technologies: asStringArray(raw.technologies),
    featured: normalizeBoolean(raw.featured),
    displayOrder: Number(raw.displayOrder ?? tsToNumber(raw.createdAt, now())),
    createdAt: tsToNumber(raw.createdAt, now()),
    updatedAt: tsToNumber(raw.updatedAt, now()),
  };
}

function normalizeReferral(raw: Record<string, unknown>, id: string): Referral {
  const clientName = String(raw.clientName ?? raw.name ?? 'Anonymous');
  const company = String(raw.company ?? raw.organization ?? 'Independent');
  const position = String(raw.position ?? raw.role ?? 'Collaborator');
  const testimonial = String(raw.testimonial ?? raw.message ?? '');
  const clientImage = String(raw.clientImage ?? raw.avatarUrl ?? '');
  return {
    id,
    name: clientName,
    clientName,
    role: position,
    position,
    organization: company,
    company,
    avatarUrl: clientImage,
    clientImage,
    message: testimonial,
    testimonial,
    date: String(raw.date ?? new Date().toLocaleDateString()),
    relationship: String(raw.relationship ?? ''),
    rating: Number(raw.rating ?? 5),
    verified: normalizeBoolean(raw.verified, true),
    featured: normalizeBoolean(raw.featured),
    displayOrder: Number(raw.displayOrder ?? tsToNumber(raw.createdAt, now())),
    createdAt: tsToNumber(raw.createdAt, now()),
    updatedAt: tsToNumber(raw.updatedAt, now()),
    deletedAt:
      raw.deletedAt === null || raw.deletedAt === undefined || raw.deletedAt === ''
        ? null
        : tsToNumber(raw.deletedAt, now()),
    isDeleted: normalizeBoolean(raw.isDeleted, raw.deletedAt !== null && raw.deletedAt !== undefined && raw.deletedAt !== ''),
  };
}

function normalizeMessage(raw: Record<string, unknown>, id: string): ContactMessage {
  const senderName = String(raw.senderName ?? raw.name ?? 'Anonymous');
  const status = String(raw.status ?? (normalizeBoolean(raw.archived) ? 'archived' : normalizeBoolean(raw.read, false) ? 'read' : 'unread')) as ContactMessage['status'];
  return {
    id,
    senderName,
    name: senderName,
    email: String(raw.email ?? ''),
    subject: String(raw.subject ?? ''),
    message: String(raw.message ?? ''),
    status,
    read: status === 'read',
    archived: status === 'archived',
    createdAt: tsToNumber(raw.createdAt, now()),
    updatedAt: tsToNumber(raw.updatedAt, now()),
    deletedAt:
      raw.deletedAt === null || raw.deletedAt === undefined || raw.deletedAt === ''
        ? null
        : tsToNumber(raw.deletedAt, now()),
  };
}

function normalizeMedia(raw: Record<string, unknown>, id: string): MediaAsset {
  return {
    id,
    name: String(raw.name ?? 'Untitled Asset'),
    url: String(raw.url ?? ''),
    alt: String(raw.alt ?? ''),
    category: (String(raw.category ?? 'other') as MediaAsset['category']),
    mimeType: String(raw.mimeType ?? 'image/*'),
    size: Number(raw.size ?? 0),
    createdAt: tsToNumber(raw.createdAt, now()),
    updatedAt: tsToNumber(raw.updatedAt, now()),
    deletedAt:
      raw.deletedAt === null || raw.deletedAt === undefined || raw.deletedAt === ''
        ? null
        : tsToNumber(raw.deletedAt, now()),
    isDeleted: normalizeBoolean(raw.isDeleted, raw.deletedAt !== null && raw.deletedAt !== undefined && raw.deletedAt !== ''),
  };
}

function normalizeActivity(raw: Record<string, unknown>, id: string): ActivityLogEntry {
  return {
    id,
    action: String(raw.action ?? 'Updated'),
    item: String(raw.item ?? ''),
    itemType: String(raw.itemType ?? 'portfolio'),
    user: String(raw.user ?? 'Administrator'),
    createdAt: tsToNumber(raw.createdAt, now()),
    details: raw.details ? String(raw.details) : undefined,
  };
}

function normalizeAnalyticsEvent(raw: Record<string, unknown>, id: string): AnalyticsEvent {
  return {
    id,
    type: String(raw.type ?? 'portfolio_view') as AnalyticsEvent['type'],
    projectId: raw.projectId ? String(raw.projectId) : undefined,
    label: raw.label ? String(raw.label) : undefined,
    createdAt: tsToNumber(raw.createdAt, now()),
    metadata: typeof raw.metadata === 'object' && raw.metadata !== null ? (raw.metadata as Record<string, string>) : undefined,
  };
}

function normalizeContent(
  raw: Record<string, unknown> | PortfolioContent,
  fallback = defaultPortfolioContent
): PortfolioContent {
  const data = raw as Record<string, unknown>;
  const home = (data.home as Record<string, unknown> | undefined) ?? fallback.home;
  const about = (data.about as Record<string, unknown> | undefined) ?? fallback.about;
  const contact = (data.contact as Record<string, unknown> | undefined) ?? fallback.contact;
  return {
    id: String(data.id ?? fallback.id),
    portfolioName: String(data.portfolioName ?? fallback.portfolioName),
    home: {
      headline: String(home.headline ?? fallback.home.headline),
      subtitle: String(home.subtitle ?? fallback.home.subtitle),
      introduction: String(home.introduction ?? fallback.home.introduction),
      ctaText: String(home.ctaText ?? fallback.home.ctaText),
      availabilityStatus: String(home.availabilityStatus ?? fallback.home.availabilityStatus),
    },
    about: {
      description: String(about.description ?? fallback.about.description),
      biography: String(about.biography ?? fallback.about.biography),
      introduction: String(about.introduction ?? fallback.about.introduction),
      otherInfo: String(about.otherInfo ?? fallback.about.otherInfo),
    },
    contact: {
      email: String(contact.email ?? fallback.contact.email),
      phone: String(contact.phone ?? fallback.contact.phone),
      availabilityStatus: String(contact.availabilityStatus ?? fallback.contact.availabilityStatus),
      socials: Array.isArray(contact.socials)
        ? contact.socials.map(item => ({
            label: String((item as Record<string, unknown>).label ?? ''),
            url: String((item as Record<string, unknown>).url ?? ''),
          }))
        : fallback.contact.socials,
    },
    updatedAt: tsToNumber(data.updatedAt, now()),
  };
}

function normalizeSettings(
  raw: Record<string, unknown> | PortfolioSettings,
  fallback = defaultPortfolioSettings
): PortfolioSettings {
  const data = raw as Record<string, unknown>;
  return {
    id: String(data.id ?? fallback.id),
    portfolioName: String(data.portfolioName ?? fallback.portfolioName),
    email: String(data.email ?? fallback.email),
    phone: String(data.phone ?? fallback.phone),
    availabilityStatus: String(data.availabilityStatus ?? fallback.availabilityStatus),
    socialLinks: Array.isArray(data.socialLinks)
      ? data.socialLinks.map(item => ({
          label: String((item as Record<string, unknown>).label ?? ''),
          url: String((item as Record<string, unknown>).url ?? ''),
        }))
      : fallback.socialLinks,
    darkModeDefault: String(data.darkModeDefault ?? fallback.darkModeDefault) as PortfolioSettings['darkModeDefault'],
    dashboardPreferences: {
      compactMode: normalizeBoolean(
        (data.dashboardPreferences as Record<string, unknown> | undefined)?.compactMode,
        fallback.dashboardPreferences.compactMode
      ),
      showAdvanced: normalizeBoolean(
        (data.dashboardPreferences as Record<string, unknown> | undefined)?.showAdvanced,
        fallback.dashboardPreferences.showAdvanced
      ),
    },
    updatedAt: tsToNumber(data.updatedAt, now()),
  };
}

function readProjectsLocal(): Project[] {
  return sortByDisplayOrder(
    readList<Record<string, unknown>>(KEYS.projects, []).map((item, index) =>
      normalizeProject(item, String(item.id ?? `project-${index}`))
    )
  );
}

function writeProjectsLocal(items: Project[]): void {
  writeList(KEYS.projects, items);
}

function readSkillsLocal(): Skill[] {
  const stored = readList<Record<string, unknown>>(KEYS.skills, []);
  const base = stored.length > 0 ? stored : defaultSkills;
  return sortByDisplayOrder(base.map((item, index) => normalizeSkill(item, String(item.id ?? `skill-${index}`))));
}

function writeSkillsLocal(items: Skill[]): void {
  writeList(KEYS.skills, items);
}

function readReferralsLocal(): Referral[] {
  const stored = readList<Record<string, unknown>>(KEYS.referrals, []);
  const base = stored.length > 0 ? stored : initialReferrals;
  return sortByDisplayOrder(base.map((item, index) => normalizeReferral(item, String(item.id ?? `ref-${index}`))));
}

function writeReferralsLocal(items: Referral[]): void {
  writeList(KEYS.referrals, items);
}

function readMessagesLocal(): ContactMessage[] {
  return sortByNewest(
    readList<Record<string, unknown>>(KEYS.messages, []).map((item, index) =>
      normalizeMessage(item, String(item.id ?? `message-${index}`))
    )
  );
}

function writeMessagesLocal(items: ContactMessage[]): void {
  writeList(KEYS.messages, items);
}

function readMediaLocal(): MediaAsset[] {
  return sortByNewest(
    readList<Record<string, unknown>>(KEYS.media, []).map((item, index) =>
      normalizeMedia(item, String(item.id ?? `media-${index}`))
    )
  );
}

function writeMediaLocal(items: MediaAsset[]): void {
  writeList(KEYS.media, items);
}

function readActivityLocal(): ActivityLogEntry[] {
  return sortByNewest(
    readList<Record<string, unknown>>(KEYS.activity, []).map((item, index) =>
      normalizeActivity(item, String(item.id ?? `activity-${index}`))
    )
  );
}

function writeActivityLocal(items: ActivityLogEntry[]): void {
  writeList(KEYS.activity, items);
}

function readAnalyticsLocal(): AnalyticsEvent[] {
  return sortByNewest(
    readList<Record<string, unknown>>(KEYS.analytics, []).map((item, index) =>
      normalizeAnalyticsEvent(item, String(item.id ?? `event-${index}`))
    )
  );
}

function writeAnalyticsLocal(items: AnalyticsEvent[]): void {
  writeList(KEYS.analytics, items);
}

function readContentLocal(): PortfolioContent {
  return normalizeContent(readDoc<PortfolioContent>(KEYS.content, defaultPortfolioContent), defaultPortfolioContent);
}

function writeContentLocal(value: PortfolioContent): void {
  writeDoc(KEYS.content, value);
}

function readSettingsLocal(): PortfolioSettings {
  return normalizeSettings(readDoc<PortfolioSettings>(KEYS.settings, defaultPortfolioSettings), defaultPortfolioSettings);
}

function writeSettingsLocal(value: PortfolioSettings): void {
  writeDoc(KEYS.settings, value);
}

function subscribeFirestoreList<T>(
  collectionName: string,
  mapper: (id: string, raw: Record<string, unknown>) => T,
  onUpdate: CollectionListener<T>
): Unsubscribe {
  const db = getFirestoreDB();
  return onSnapshot(
    collection(db, collectionName),
    snapshot => {
      const items = snapshot.docs.map(docSnap => mapper(docSnap.id, docSnap.data() as Record<string, unknown>));
      onUpdate(items, null);
    },
    error => onUpdate([], error instanceof Error ? error.message : `Unable to load ${collectionName}.`)
  );
}

function subscribeFirestoreDoc<T>(
  collectionName: string,
  docId: string,
  mapper: (raw: Record<string, unknown> | null) => T,
  fallback: T,
  onUpdate: DocumentListener<T>
): Unsubscribe {
  const db = getFirestoreDB();
  return onSnapshot(
    doc(db, collectionName, docId),
    snapshot => {
      if (!snapshot.exists()) {
        onUpdate(fallback, null);
        return;
      }
      onUpdate(mapper(snapshot.data() as Record<string, unknown>), null);
    },
    error => onUpdate(fallback, error instanceof Error ? error.message : `Unable to load ${collectionName}.`)
  );
}

export function subscribeToProjects(onUpdate: CollectionListener<Project>): Unsubscribe {
  if (!isFirebaseConfigured()) {
    return subscribeLocalList(KEYS.projects, [], onUpdate);
  }
  return subscribeFirestoreList('projects', (id, raw) => normalizeProject(raw, id), (items, error) => {
    const local = readProjectsLocal();
    const merged = mergeProjectSources(items, local);
    onUpdate(merged, merged.length > 0 ? null : error);
  });
}

export function subscribeToSkills(onUpdate: CollectionListener<Skill>): Unsubscribe {
  if (!isFirebaseConfigured()) {
    return subscribeLocalList(KEYS.skills, defaultSkills, onUpdate);
  }
  return subscribeFirestoreList('skills', (id, raw) => normalizeSkill(raw, id), (items, error) => {
    onUpdate(sortByDisplayOrder(items), error);
  });
}

export function subscribeToReferrals(onUpdate: CollectionListener<Referral>): Unsubscribe {
  if (!isFirebaseConfigured()) {
    return subscribeLocalList(KEYS.referrals, initialReferrals, onUpdate);
  }
  return subscribeFirestoreList('referrals', (id, raw) => normalizeReferral(raw, id), (items, error) => {
    onUpdate(sortByDisplayOrder(items), error);
  });
}

export function subscribeToMessages(onUpdate: CollectionListener<ContactMessage>): Unsubscribe {
  if (!isFirebaseConfigured()) {
    return subscribeLocalList(KEYS.messages, [], onUpdate);
  }
  return subscribeFirestoreList('messages', (id, raw) => normalizeMessage(raw, id), (items, error) => {
    onUpdate(sortByNewest(items), error);
  });
}

export function subscribeToMedia(onUpdate: CollectionListener<MediaAsset>): Unsubscribe {
  if (!isFirebaseConfigured()) {
    return subscribeLocalList(KEYS.media, [], onUpdate);
  }
  return subscribeFirestoreList('media', (id, raw) => normalizeMedia(raw, id), (items, error) => {
    onUpdate(sortByNewest(items), error);
  });
}

export function subscribeToActivity(onUpdate: CollectionListener<ActivityLogEntry>): Unsubscribe {
  if (!isFirebaseConfigured()) {
    return subscribeLocalList(KEYS.activity, [], onUpdate);
  }
  return subscribeFirestoreList('activity', (id, raw) => normalizeActivity(raw, id), (items, error) => {
    onUpdate(sortByNewest(items), error);
  });
}

export function subscribeToAnalyticsEvents(onUpdate: CollectionListener<AnalyticsEvent>): Unsubscribe {
  if (!isFirebaseConfigured()) {
    return subscribeLocalList(KEYS.analytics, [], onUpdate);
  }
  return subscribeFirestoreList('analytics', (id, raw) => normalizeAnalyticsEvent(raw, id), (items, error) => {
    onUpdate(sortByNewest(items), error);
  });
}

export function subscribeToContent(onUpdate: DocumentListener<PortfolioContent>): Unsubscribe {
  if (!isFirebaseConfigured()) {
    return subscribeLocalDoc(KEYS.content, defaultPortfolioContent, onUpdate);
  }
  return subscribeFirestoreDoc('content', DOC_IDS.content, raw => normalizeContent(raw ?? {}, defaultPortfolioContent), defaultPortfolioContent, onUpdate);
}

export function subscribeToSettings(onUpdate: DocumentListener<PortfolioSettings>): Unsubscribe {
  if (!isFirebaseConfigured()) {
    return subscribeLocalDoc(KEYS.settings, defaultPortfolioSettings, onUpdate);
  }
  return subscribeFirestoreDoc('settings', DOC_IDS.settings, raw => normalizeSettings(raw ?? {}, defaultPortfolioSettings), defaultPortfolioSettings, onUpdate);
}

function saveListItem<T extends { id: string }>(key: string, items: T[], item: T, sort = false): T[] {
  const next = [...items.filter(existing => existing.id !== item.id), item];
  if (sort) {
    return next;
  }
  return next;
}

function removeListItem<T extends { id: string }>(items: T[], id: string): T[] {
  return items.filter(item => item.id !== id);
}

function mergeProjectSources(remote: Project[], local: Project[]): Project[] {
  const merged = new Map<string, Project>();
  local.forEach(project => merged.set(project.id, project));
  remote.forEach(project => merged.set(project.id, project));
  return sortByDisplayOrder([...merged.values()]);
}

function updateFirestoreListDoc(collectionName: string, itemId: string, payload: Record<string, unknown>): Promise<void> {
  const db = getFirestoreDB();
  return setDoc(doc(db, collectionName, itemId), payload, { merge: true });
}

function updateFirestoreListExisting(collectionName: string, itemId: string, payload: Record<string, unknown>): Promise<void> {
  const db = getFirestoreDB();
  return updateDoc(doc(db, collectionName, itemId), payload);
}

function deleteFirestoreListDoc(collectionName: string, itemId: string): Promise<void> {
  const db = getFirestoreDB();
  return deleteDoc(doc(db, collectionName, itemId));
}

function writeActivityEntry(entry: Omit<ActivityLogEntry, 'id' | 'createdAt'>): Promise<string> {
  return createEntry('activity', {
    ...entry,
    createdAt: now(),
  }) as Promise<string>;
}

async function createEntry(collectionName: string, data: Record<string, unknown>): Promise<string> {
  if (!isFirebaseConfigured()) {
    const id = String(data.id ?? createId(collectionName));
    const key = (KEYS as Record<string, string>)[collectionName as keyof typeof KEYS] ?? `${STORAGE_PREFIX}${collectionName}`;
    const stored = readList<Record<string, unknown>>(key, []);
    writeList(key, [...stored, { ...data, id }]);
    return id;
  }
  const db = getFirestoreDB();
  const docRef = await addDoc(collection(db, collectionName), data);
  return docRef.id;
}

export async function recordActivity(entry: Omit<ActivityLogEntry, 'id' | 'createdAt'>): Promise<void> {
  const payload = {
    ...entry,
    createdAt: now(),
  };
  if (!isFirebaseConfigured()) {
    const existing = readActivityLocal();
    const next: ActivityLogEntry = {
      id: createId('activity'),
      action: payload.action,
      item: payload.item,
      itemType: payload.itemType,
      user: payload.user,
      createdAt: payload.createdAt,
      details: payload.details,
    };
    writeActivityLocal(sortByNewest([next, ...existing]));
    return;
  }
  try {
    await addDoc(collection(getFirestoreDB(), 'activity'), payload);
  } catch {
    // Activity history must never make a successfully saved project fail.
    const existing = readActivityLocal();
    const next: ActivityLogEntry = {
      id: createId('activity'),
      action: payload.action,
      item: payload.item,
      itemType: payload.itemType,
      user: payload.user,
      createdAt: payload.createdAt,
      details: payload.details,
    };
    writeActivityLocal(sortByNewest([next, ...existing]));
  }
}

export async function recordAnalyticsEvent(event: Omit<AnalyticsEvent, 'id' | 'createdAt'>): Promise<void> {
  const payload = {
    ...event,
    createdAt: now(),
  };
  if (!isFirebaseConfigured()) {
    const existing = readAnalyticsLocal();
    const next: AnalyticsEvent = {
      id: createId('event'),
      type: payload.type,
      projectId: payload.projectId,
      label: payload.label,
      createdAt: payload.createdAt,
      metadata: payload.metadata,
    };
    writeAnalyticsLocal(sortByNewest([next, ...existing]));
    return;
  }
  await addDoc(collection(getFirestoreDB(), 'analytics'), payload);
}

export async function upsertProject(project: Project, imageUrl?: string): Promise<string> {
  const payload = {
    ...project,
    image: imageUrl ?? project.image,
    updatedAt: now(),
  };
  if (!isFirebaseConfigured()) {
    const existing = readProjectsLocal();
    const next = saveListItem(KEYS.projects, existing, { ...project, image: payload.image, updatedAt: payload.updatedAt });
    writeProjectsLocal(sortByDisplayOrder(next));
    return project.id;
  }
  try {
    await updateFirestoreListDoc('projects', project.id, payload);
  } catch {
    // Keep the editor usable when Firebase Auth/rules are not enabled yet.
    const existing = readProjectsLocal();
    const next = saveListItem(KEYS.projects, existing, { ...project, image: payload.image, updatedAt: payload.updatedAt });
    writeProjectsLocal(sortByDisplayOrder(next));
  }
  return project.id;
}

export async function createProjectEntry(project: Project, imageUrl?: string): Promise<string> {
  const id = project.id || createId('project');
  const payload = {
    ...project,
    id,
    image: imageUrl ?? project.image,
    createdAt: project.createdAt || now(),
    updatedAt: now(),
  };
  if (!isFirebaseConfigured()) {
    const existing = readProjectsLocal();
    const next = saveListItem(KEYS.projects, existing, normalizeProject(payload as Record<string, unknown>, id));
    writeProjectsLocal(sortByDisplayOrder(next));
    return id;
  }
  try {
    await setDoc(doc(getFirestoreDB(), 'projects', id), payload, { merge: true });
  } catch {
    const existing = readProjectsLocal();
    const next = saveListItem(KEYS.projects, existing, normalizeProject(payload as Record<string, unknown>, id));
    writeProjectsLocal(sortByDisplayOrder(next));
  }
  return id;
}

export async function trashProjectEntry(id: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    const existing = readProjectsLocal();
    const next = existing.map(project =>
      project.id === id
        ? { ...project, isDeleted: true, deletedAt: now(), updatedAt: now() }
        : project
    );
    writeProjectsLocal(sortByDisplayOrder(next));
    return;
  }
  const deletedAt = now();
  try {
    await updateFirestoreListExisting('projects', id, {
      isDeleted: true,
      deletedAt,
      updatedAt: deletedAt,
    });
  } catch {
    const next = readProjectsLocal().map(project =>
      project.id === id ? { ...project, isDeleted: true, deletedAt, updatedAt: deletedAt } : project
    );
    writeProjectsLocal(sortByDisplayOrder(next));
  }
}

export async function restoreProjectEntry(id: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    const existing = readProjectsLocal();
    const next = existing.map(project =>
      project.id === id
        ? { ...project, isDeleted: false, deletedAt: null, updatedAt: now() }
        : project
    );
    writeProjectsLocal(sortByDisplayOrder(next));
    return;
  }
  const updatedAt = now();
  try {
    await updateFirestoreListExisting('projects', id, {
      isDeleted: false,
      deletedAt: null,
      updatedAt,
    });
  } catch {
    const next = readProjectsLocal().map(project =>
      project.id === id ? { ...project, isDeleted: false, deletedAt: null, updatedAt } : project
    );
    writeProjectsLocal(sortByDisplayOrder(next));
  }
}

export async function permanentlyDeleteProjectEntry(project: Project): Promise<void> {
  if (!isFirebaseConfigured()) {
    const existing = readProjectsLocal();
    writeProjectsLocal(removeListItem(existing, project.id));
    return;
  }
  try {
    await deleteFirestoreListDoc('projects', project.id);
  } catch {
    writeProjectsLocal(removeListItem(readProjectsLocal(), project.id));
  }
}

export async function reorderProjects(projectIds: string[]): Promise<void> {
  const updates = projectIds.map((projectId, index) => ({
    id: projectId,
    displayOrder: index,
  }));
  if (!isFirebaseConfigured()) {
    const existing = readProjectsLocal().map(project => {
      const match = updates.find(update => update.id === project.id);
      return match ? { ...project, displayOrder: match.displayOrder, updatedAt: now() } : project;
    });
    writeProjectsLocal(sortByDisplayOrder(existing));
    return;
  }
  const db = getFirestoreDB();
  await Promise.all(
    updates.map(update =>
      updateDoc(doc(db, 'projects', update.id), {
        displayOrder: update.displayOrder,
        updatedAt: now(),
      })
    )
  );
}

export async function toggleProjectFeatured(id: string, featured: boolean): Promise<void> {
  if (!isFirebaseConfigured()) {
    const existing = readProjectsLocal().map(project =>
      project.id === id ? { ...project, featured, updatedAt: now() } : project
    );
    writeProjectsLocal(sortByDisplayOrder(existing));
    return;
  }
  await updateFirestoreListExisting('projects', id, {
    featured,
    updatedAt: now(),
  });
}

export async function toggleProjectStatus(id: string, status: Project['status']): Promise<void> {
  if (!isFirebaseConfigured()) {
    const existing = readProjectsLocal().map(project =>
      project.id === id ? { ...project, status, updatedAt: now() } : project
    );
    writeProjectsLocal(sortByDisplayOrder(existing));
    return;
  }
  await updateFirestoreListExisting('projects', id, {
    status,
    updatedAt: now(),
  });
}

export async function saveSkillEntry(skill: Skill): Promise<string> {
  const payload = {
    ...skill,
    updatedAt: now(),
    createdAt: skill.createdAt ?? now(),
  };
  if (!isFirebaseConfigured()) {
    const existing = readSkillsLocal();
    const next = saveListItem(KEYS.skills, existing, normalizeSkill(payload as Record<string, unknown>, skill.id));
    writeSkillsLocal(sortByDisplayOrder(next));
    return skill.id;
  }
  await setDoc(doc(getFirestoreDB(), 'skills', skill.id), payload, { merge: true });
  return skill.id;
}

export async function deleteSkillEntry(id: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    const next = removeListItem(readSkillsLocal(), id);
    writeSkillsLocal(next);
    return;
  }
  await deleteFirestoreListDoc('skills', id);
}

export async function reorderSkills(skillIds: string[]): Promise<void> {
  const orderMap = new Map(skillIds.map((id, index) => [id, index] as const));
  if (!isFirebaseConfigured()) {
    const existing = readSkillsLocal().map(skill =>
      orderMap.has(skill.id) ? { ...skill, displayOrder: orderMap.get(skill.id) ?? skill.displayOrder, updatedAt: now() } : skill
    );
    writeSkillsLocal(sortByDisplayOrder(existing));
    return;
  }
  const db = getFirestoreDB();
  await Promise.all(
    skillIds.map((id, index) =>
      updateDoc(doc(db, 'skills', id), {
        displayOrder: index,
        updatedAt: now(),
      })
    )
  );
}

export async function saveReferralEntry(referral: Referral): Promise<string> {
  const payload = {
    ...referral,
    name: referral.clientName ?? referral.name,
    clientName: referral.clientName ?? referral.name,
    role: referral.position ?? referral.role,
    position: referral.position ?? referral.role,
    organization: referral.company ?? referral.organization,
    company: referral.company ?? referral.organization,
    avatarUrl: referral.clientImage ?? referral.avatarUrl,
    clientImage: referral.clientImage ?? referral.avatarUrl,
    message: referral.testimonial ?? referral.message,
    testimonial: referral.testimonial ?? referral.message,
    updatedAt: now(),
    createdAt: referral.createdAt ?? now(),
  };
  if (!isFirebaseConfigured()) {
    const existing = readReferralsLocal();
    const next = saveListItem(KEYS.referrals, existing, normalizeReferral(payload as Record<string, unknown>, referral.id));
    writeReferralsLocal(sortByDisplayOrder(next));
    return referral.id;
  }
  await setDoc(doc(getFirestoreDB(), 'referrals', referral.id), payload, { merge: true });
  return referral.id;
}

export async function deleteReferralEntry(id: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    const existing = readReferralsLocal();
    const next = existing.map(referral =>
      referral.id === id ? { ...referral, isDeleted: true, deletedAt: now(), updatedAt: now() } : referral
    );
    writeReferralsLocal(sortByDisplayOrder(next));
    return;
  }
  await updateFirestoreListExisting('referrals', id, {
    isDeleted: true,
    deletedAt: now(),
    updatedAt: now(),
  });
}

export async function restoreReferralEntry(id: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    const existing = readReferralsLocal();
    const next = existing.map(referral =>
      referral.id === id ? { ...referral, isDeleted: false, deletedAt: null, updatedAt: now() } : referral
    );
    writeReferralsLocal(sortByDisplayOrder(next));
    return;
  }
  await updateFirestoreListExisting('referrals', id, {
    isDeleted: false,
    deletedAt: null,
    updatedAt: now(),
  });
}

export async function reorderReferrals(referralIds: string[]): Promise<void> {
  const orderMap = new Map(referralIds.map((id, index) => [id, index] as const));
  if (!isFirebaseConfigured()) {
    const existing = readReferralsLocal().map(referral =>
      orderMap.has(referral.id) ? { ...referral, displayOrder: orderMap.get(referral.id) ?? referral.displayOrder, updatedAt: now() } : referral
    );
    writeReferralsLocal(sortByDisplayOrder(existing));
    return;
  }
  const db = getFirestoreDB();
  await Promise.all(
    referralIds.map((id, index) =>
      updateDoc(doc(db, 'referrals', id), {
        displayOrder: index,
        updatedAt: now(),
      })
    )
  );
}

export async function createMessageEntry(message: {
  senderName: string;
  email: string;
  subject?: string;
  message: string;
}): Promise<string> {
  const payload = {
    id: createId('message'),
    senderName: message.senderName,
    name: message.senderName,
    email: message.email,
    subject: message.subject ?? '',
    message: message.message,
    status: 'unread' as const,
    read: false,
    archived: false,
    createdAt: now(),
    updatedAt: now(),
    deletedAt: null,
  };
  if (!isFirebaseConfigured()) {
    const existing = readMessagesLocal();
    writeMessagesLocal(sortByNewest([payload as ContactMessage, ...existing]));
    return payload.id;
  }
  const db = getFirestoreDB();
  await setDoc(doc(db, 'messages', payload.id), payload);
  return payload.id;
}

export async function setMessageRead(id: string, read: boolean): Promise<void> {
  const status: ContactMessage['status'] = read ? 'read' : 'unread';
  if (!isFirebaseConfigured()) {
    const next = readMessagesLocal().map(message =>
      message.id === id ? { ...message, read, archived: false, status, updatedAt: now() } : message
    );
    writeMessagesLocal(sortByNewest(next));
    return;
  }
  await updateFirestoreListExisting('messages', id, {
    read,
    archived: false,
    status,
    updatedAt: now(),
  });
}

export async function archiveMessageEntry(id: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    const next: ContactMessage[] = readMessagesLocal().map(message =>
      message.id === id ? { ...message, read: true, archived: true, status: 'archived', updatedAt: now() } : message
    );
    writeMessagesLocal(sortByNewest(next));
    return;
  }
  await updateFirestoreListExisting('messages', id, {
    read: true,
    archived: true,
    status: 'archived',
    updatedAt: now(),
  });
}

export async function deleteMessageEntry(id: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    const next = removeListItem(readMessagesLocal(), id);
    writeMessagesLocal(next);
    return;
  }
  await deleteFirestoreListDoc('messages', id);
}

export async function uploadMediaEntry(file: File, category: MediaAsset['category'] = 'other', alt = ''): Promise<MediaAsset> {
  const mediaId = createId('media');
  if (!isFirebaseConfigured()) {
    let base64: string;
    try {
      base64 = await fileToOptimizedDataUrl(file);
    } catch {
      base64 = await fileToDataUrl(file);
    }
    const asset: MediaAsset = {
      id: mediaId,
      name: file.name,
      url: base64,
      alt,
      category,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      createdAt: now(),
      updatedAt: now(),
      deletedAt: null,
      isDeleted: false,
    };
    const existing = readMediaLocal();
    writeMediaLocal(sortByNewest([asset, ...existing]));
    return asset;
  }

  let url: string;
  try {
    const storage = getFirebaseStorage();
    const path = `media/${mediaId}/${sanitizeFileName(file.name)}`;
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file);
    url = await withTimeout(
      new Promise<string>((resolve, reject) => {
        task.on(
          'state_changed',
          undefined,
          reject,
          () => {
            void getDownloadURL(task.snapshot.ref).then(resolve).catch(reject);
          }
        );
      }),
      20000,
      () => task.cancel()
    );
  } catch {
    // Preserve the fast image-insertion behavior until Firebase Storage rules
    // and Authentication are enabled in the project.
    url = await fileToOptimizedDataUrl(file).catch(() => fileToDataUrl(file));
  }

  const asset: MediaAsset = {
    id: mediaId,
    name: file.name,
    url,
    alt,
    category,
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
    createdAt: now(),
    updatedAt: now(),
    deletedAt: null,
    isDeleted: false,
  };

  try {
    await setDoc(doc(getFirestoreDB(), 'media', mediaId), asset);
  } catch {
    const existing = readMediaLocal();
    writeMediaLocal(sortByNewest([asset, ...existing]));
  }
  return asset;
}

export async function deleteMediaEntry(id: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    const next = readMediaLocal().map(media =>
      media.id === id ? { ...media, isDeleted: true, deletedAt: now(), updatedAt: now() } : media
    );
    writeMediaLocal(sortByNewest(next));
    return;
  }
  await updateFirestoreListExisting('media', id, {
    isDeleted: true,
    deletedAt: now(),
    updatedAt: now(),
  });
}

export async function updateContentEntry(content: PortfolioContent): Promise<void> {
  const next = { ...content, updatedAt: now() };
  if (!isFirebaseConfigured()) {
    writeContentLocal(next);
    return;
  }
  await setDoc(doc(getFirestoreDB(), 'content', DOC_IDS.content), next, { merge: true });
}

export async function updateSettingsEntry(settings: PortfolioSettings): Promise<void> {
  const next = { ...settings, updatedAt: now() };
  if (!isFirebaseConfigured()) {
    writeSettingsLocal(next);
    return;
  }
  await setDoc(doc(getFirestoreDB(), 'settings', DOC_IDS.settings), next, { merge: true });
}

export function deriveAnalyticsSummary(events: AnalyticsEvent[]): AnalyticsSummary {
  const summary: AnalyticsSummary = {
    ...DEFAULT_ANALYTICS,
    lastUpdated: events[0]?.createdAt ?? null,
  };
  const projectViews = new Map<string, number>();

  for (const event of events) {
    if (summary.lastUpdated === null || event.createdAt > summary.lastUpdated) {
      summary.lastUpdated = event.createdAt;
    }
    switch (event.type) {
      case 'portfolio_view':
        summary.portfolioViews += 1;
        break;
      case 'project_view':
        summary.projectViews += 1;
        if (event.projectId) {
          projectViews.set(event.projectId, (projectViews.get(event.projectId) ?? 0) + 1);
        }
        break;
      case 'github_click':
        summary.githubClicks += 1;
        break;
      case 'live_click':
        summary.liveClicks += 1;
        break;
      case 'contact_submission':
        summary.contactSubmissions += 1;
        break;
      case 'referral_view':
        summary.referralViews += 1;
        break;
    }
  }

  summary.mostViewedProjects = [...projectViews.entries()]
    .map(([projectId, views]) => ({ projectId, name: projectId, views }))
    .sort((a, b) => b.views - a.views);

  return summary;
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_') || 'asset';
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Unable to read file.'));
    reader.readAsDataURL(file);
  });
}

function withTimeout<T>(promise: Promise<T>, milliseconds: number, onTimeout: () => void): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      onTimeout();
      reject(new Error('Image upload timed out. Check Firebase Storage configuration and try again.'));
    }, milliseconds);

    promise.then(
      value => {
        window.clearTimeout(timer);
        resolve(value);
      },
      error => {
        window.clearTimeout(timer);
        reject(error);
      }
    );
  });
}

async function fileToOptimizedDataUrl(file: File): Promise<string> {
  if (file.type === 'image/svg+xml' || typeof document === 'undefined') {
    return fileToDataUrl(file);
  }

  const source = await fileToDataUrl(file);
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error('Unable to process image.'));
    element.src = source;
  });

  const maxSize = 1400;
  const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) return source;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.78);
}

export function getLocalAnalyticsSummary(): AnalyticsSummary {
  return deriveAnalyticsSummary(readAnalyticsLocal());
}

export function getDefaultContent(): PortfolioContent {
  return defaultPortfolioContent;
}

export function getDefaultSettings(): PortfolioSettings {
  return defaultPortfolioSettings;
}

export function getDefaultSkills(): Skill[] {
  return defaultSkills;
}

export function getDefaultReferrals(): Referral[] {
  return initialReferrals.map((item, index) =>
    normalizeReferral(item as unknown as Record<string, unknown>, String(item.id ?? `ref-${index}`))
  );
}
