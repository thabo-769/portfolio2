import { Project } from '../types';

const STATE_KEY = 'thabo_projects_state_v5';
const ACTIVE_KEY = 'thabo_projects_active_v4';
const TRASH_KEY = 'thabo_projects_trash_v4';
const OLD_ACTIVE_KEY = 'thabo_portfolio_active_projects_v3';
const OLD_TRASH_KEY = 'thabo_portfolio_trash_projects_v3';

const DB_NAME = 'thabo_portfolio_projects';
const DB_VERSION = 1;
const STORE_NAME = 'project_state';
const RECORD_KEY = 'projects';

export interface ProjectPortfolioState {
  active: Project[];
  trash: Project[];
}

export interface PersistedProjectPortfolioState extends ProjectPortfolioState {
  storedAt: number;
}

function normalizeCategory(rawCategory: unknown): Project['category'] {
  const category = String(rawCategory ?? 'Other');
  if (category === 'Mobile App' || category === 'Mobile') return 'Mobile';
  if (['E-commerce', 'Real Estate', 'Clean Energy', 'Business'].includes(category)) return 'Business';
  if (category === 'Personal' || category === 'Gift') return category;
  if (category === 'Personal' || category === 'Business' || category === 'Mobile' || category === 'Gift' || category === 'Other') {
    return category;
  }
  return 'Other';
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function toNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeProjects(value: unknown): Project[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(normalizeProjectRecord)
    .filter((project): project is Project => Boolean(project));
}

function normalizeStoredState(raw: unknown, storedAtFallback = 0): PersistedProjectPortfolioState | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const data = raw as Record<string, unknown>;
  if (!('active' in data) && !('trash' in data)) return null;

  const storedAt = toNumber(data.storedAt, storedAtFallback);

  return {
    active: normalizeProjects(data.active),
    trash: normalizeProjects(data.trash),
    storedAt,
  };
}

function readLocalArray(key: string): Project[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return normalizeProjects(parsed);
  } catch {
    return [];
  }
}

function readLegacyLocalState(): PersistedProjectPortfolioState {
  const active = readLocalArray(ACTIVE_KEY);
  const trash = readLocalArray(TRASH_KEY);

  if (active.length || trash.length) {
    return { active, trash, storedAt: 0 };
  }

  const oldActive = readLocalArray(OLD_ACTIVE_KEY).filter(project => !project.isDeleted);
  const oldTrash = readLocalArray(OLD_TRASH_KEY);

  if (oldActive.length || oldTrash.length) {
    return { active: oldActive, trash: oldTrash, storedAt: 0 };
  }

  return { active: [], trash: [], storedAt: 0 };
}

function readCombinedLocalState(): PersistedProjectPortfolioState | null {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return null;
    return normalizeStoredState(JSON.parse(raw));
  } catch {
    return null;
  }
}

function persistLocalState(state: PersistedProjectPortfolioState): void {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to persist projects to localStorage (combined state):', error);
  }

  try {
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(state.active));
  } catch (error) {
    console.error('Failed to persist active projects to localStorage:', error);
  }

  try {
    localStorage.setItem(TRASH_KEY, JSON.stringify(state.trash));
  } catch (error) {
    console.error('Failed to persist trash projects to localStorage:', error);
  }
}

async function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return null;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onerror = () => reject(request.error ?? new Error('Unable to open project storage database.'));

    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => db.close();
      resolve(db);
    };
  });
}

async function readDatabaseState(): Promise<PersistedProjectPortfolioState | null> {
  const db = await openDatabase();
  if (!db) return null;

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(RECORD_KEY);

    request.onerror = () => reject(request.error ?? new Error('Unable to read project storage database.'));
    request.onsuccess = () => {
      const stored = normalizeStoredState(request.result);
      resolve(stored);
    };

    tx.onerror = () => reject(tx.error ?? new Error('Project storage transaction failed.'));
    tx.oncomplete = () => db.close();
  });
}

async function writeDatabaseState(state: PersistedProjectPortfolioState): Promise<void> {
  const db = await openDatabase();
  if (!db) return;

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(state, RECORD_KEY);

    tx.onerror = () => reject(tx.error ?? new Error('Project storage write failed.'));
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
  });
}

export function normalizeProjectRecord(raw: unknown): Project | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const data = raw as Record<string, unknown>;
  const now = Date.now();
  const hasCurrentShape =
    'name' in data ||
    'images' in data ||
    'createdAt' in data ||
    'updatedAt' in data ||
    'deletedAt' in data ||
    'isDeleted' in data;

  if (hasCurrentShape) {
    return {
      id: String(data.id ?? `project-${now}`),
      name: String(data.name ?? data.title ?? 'Untitled Project'),
      shortDescription: String(data.shortDescription ?? ''),
      description: String(data.description ?? data.longDescription ?? ''),
      category: normalizeCategory(data.category),
      technologies: asStringArray(data.technologies),
      image: String(data.image ?? ''),
      images: asStringArray(data.images),
      githubUrl: String(data.githubUrl ?? ''),
      liveUrl: String(data.liveUrl ?? ''),
      status: String(data.status ?? 'Completed'),
      featured: Boolean(data.featured),
      displayOrder: toNumber(data.displayOrder, now),
      completionDate: String(data.completionDate ?? new Date().toISOString()),
      client: String(data.client ?? ''),
      projectType: String(data.projectType ?? ''),
      features: asStringArray(data.features),
      challenges: String(data.challenges ?? data.challenge ?? ''),
      solutions: String(data.solutions ?? data.solution ?? ''),
      results: String(data.results ?? ''),
      createdAt: toNumber(data.createdAt, now),
      updatedAt: toNumber(data.updatedAt, now),
      deletedAt:
        data.deletedAt === null || data.deletedAt === undefined || data.deletedAt === ''
          ? null
          : toNumber(data.deletedAt, now),
      isDeleted: Boolean(data.isDeleted),
    };
  }

  const oldCategory = String(data.category ?? 'Other');
  let category = 'Other';
  if (oldCategory === 'Mobile App' || oldCategory === 'Mobile') category = 'Mobile';
  else if (['E-commerce', 'Real Estate', 'Clean Energy', 'Business'].includes(oldCategory)) category = 'Business';
  else if (oldCategory === 'Personal' || oldCategory === 'Gift') category = oldCategory;

  const year = Number(data.year || 0);
  const yearDate = year ? new Date(year, 0, 1).toISOString() : new Date().toISOString();
  const oldFeatures = Array.isArray(data.features) ? data.features.map(String) : [];
  const metrics = Array.isArray(data.metrics)
    ? data.metrics.map((m: Record<string, unknown>) => `${String(m.value)} ${String(m.label)}`).join(' · ')
    : '';

  return {
    id: String(data.id ?? `project-${now}`),
    name: String(data.title ?? 'Untitled Project'),
    shortDescription: String(data.shortDescription ?? ''),
    description: String(data.longDescription ?? data.description ?? ''),
    category,
    technologies: Array.isArray(data.technologies) ? data.technologies.map(String) : [],
    image: String(data.image ?? ''),
    images: asStringArray(data.images),
    githubUrl: String(data.githubUrl ?? ''),
    liveUrl: String(data.liveUrl ?? ''),
    status: String(data.status ?? 'Completed'),
    featured: Boolean(data.featured),
    displayOrder: toNumber(data.displayOrder, now),
    completionDate: String(data.completionDate ?? yearDate),
    client: String(data.client ?? ''),
    projectType: String(data.projectType ?? ''),
    features: oldFeatures,
    challenges: String(data.challenge ?? data.challenges ?? ''),
    solutions: String(data.solution ?? data.solutions ?? ''),
    results: metrics || String(data.results ?? ''),
    createdAt: year ? new Date(year, 0, 1).getTime() : now,
    updatedAt: now,
    deletedAt:
      data.deletedAt === null || data.deletedAt === undefined || data.deletedAt === ''
        ? null
        : toNumber(data.deletedAt, now),
    isDeleted: Boolean(data.isDeleted),
  };
}

export function readLocalProjectState(): PersistedProjectPortfolioState {
  const combined = readCombinedLocalState();
  if (combined) return combined;
  return readLegacyLocalState();
}

export async function loadPersistedProjectState(): Promise<PersistedProjectPortfolioState> {
  try {
    const indexed = await readDatabaseState();
    if (indexed) return indexed;
  } catch (error) {
    console.error('Failed to read projects from IndexedDB:', error);
  }

  return readLocalProjectState();
}

export async function persistProjectState(state: ProjectPortfolioState, storedAt = Date.now()): Promise<void> {
  const normalized: PersistedProjectPortfolioState = {
    active: normalizeProjects(state.active),
    trash: normalizeProjects(state.trash),
    storedAt,
  };

  persistLocalState(normalized);

  try {
    await writeDatabaseState(normalized);
  } catch (error) {
    console.error('Failed to persist projects to IndexedDB:', error);
  }
}

export async function requestPersistentProjectStorage(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) return false;

  try {
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
