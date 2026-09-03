import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTask,
} from 'firebase/storage';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  type User,
} from 'firebase/auth';
import { Project } from '../types';
import { getFirebaseAuth, getFirestoreDB, getFirebaseStorage } from './config';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface CreateProjectInput {
  name: string;
  shortDescription?: string;
  description: string;
  category: string;
  technologies: string[];
  githubUrl: string;
  liveUrl: string;
  featured: boolean;
  status: 'Published' | 'Draft';
  client?: string;
  projectType?: string;
  completionDate?: string;
}

export type Listener = (projects: Project[], error: string | null) => void;

/* -------------------------------------------------------------------------- */
/*  Auth                                                                      */
/* -------------------------------------------------------------------------- */

export function onAuthChange(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

export async function signIn(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  return credential.user;
}

export async function signOut(): Promise<void> {
  return fbSignOut(getFirebaseAuth());
}

export function currentUserEmail(): string | null {
  return getFirebaseAuth().currentUser?.email ?? null;
}
/* -------------------------------------------------------------------------- */
/*  Firestore <-> Project mapping                                              */
/* -------------------------------------------------------------------------- */

type StoredProject = {
  [key: string]: unknown;
  id?: string;
  name: string;
  title?: string;
  description: string;
  category: string;
  technologies: string[];
  image: string;
  images: string[];
  githubUrl: string;
  liveUrl: string;
  featured: boolean;
  status: string;
  createdAt: unknown;
  updatedAt: unknown;
  deletedAt: unknown;
  isDeleted: boolean;
  shortDescription?: string;
  client?: string;
  projectType?: string;
  completionDate?: string;
  features?: string[];
  challenges?: string;
  solutions?: string;
  results?: string;
};

function tsToNumber(value: unknown, fallback = 0): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

export function projectToStored(
  input: CreateProjectInput,
  imageUrl: string,
  now: number
): Omit<StoredProject, 'id'> {
  return {
    name: input.name,
    title: input.name,
    description: input.description,
    category: input.category,
    technologies: input.technologies,
    image: imageUrl,
    githubUrl: input.githubUrl,
    liveUrl: input.liveUrl,
    featured: input.featured,
    status: input.status,
    shortDescription: input.shortDescription ?? input.description.slice(0, 160),
    client: input.client ?? '',
    projectType: input.projectType ?? '',
    completionDate: input.completionDate ?? new Date(now).toISOString(),
    features: [],
    challenges: '',
    solutions: '',
    results: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    deletedAt: null,
    isDeleted: false,
  };
}

export function storedToProject(id: string, data: Record<string, unknown>): Project {
  return {
    id,
    name: String(data.name ?? data.title ?? 'Untitled Project'),
    shortDescription: String(data.shortDescription ?? data.description ?? '').slice(0, 220),
    description: String(data.description ?? ''),
    category: String(data.category ?? 'Other'),
    technologies: asStringArray(data.technologies),
    image: String(data.image ?? ''),
    images: asStringArray(data.images),
    githubUrl: String(data.githubUrl ?? ''),
    liveUrl: String(data.liveUrl ?? ''),
    status: String(data.status ?? 'Published'),
    featured: Boolean(data.featured),
    completionDate: String(data.completionDate ?? ''),
    client: String(data.client ?? ''),
    projectType: String(data.projectType ?? ''),
    features: asStringArray(data.features),
    challenges: String(data.challenges ?? ''),
    solutions: String(data.solutions ?? ''),
    results: String(data.results ?? ''),
    createdAt: tsToNumber(data.createdAt, 0),
    updatedAt: tsToNumber(data.updatedAt, Date.now()),
    deletedAt: data.deletedAt === null || data.deletedAt === undefined ? null : tsToNumber(data.deletedAt, Date.now()),
    isDeleted: Boolean(data.isDeleted === undefined ? data.deletedAt !== null && data.deletedAt !== undefined : data.isDeleted),
  };
}
/* -------------------------------------------------------------------------- */
/*  Real-time listener                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Subscribes to every project document. Consumers split active/trash (or
 * published) themselves. Errors (e.g. missing rules / unconfigured Firebase)
 * are surfaced to the listener so the UI can show a helpful message.
 */
export function subscribeToProjects(onUpdate: Listener): Unsubscribe {
  const db = getFirestoreDB();
  const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    snapshot => {
      const projects = snapshot.docs.map(docSnap =>
        storedToProject(docSnap.id, docSnap.data())
      );
      onUpdate(projects, null);
    },
    error => {
      onUpdate([], error instanceof Error ? error.message : 'Unable to load projects.');
    }
  );
}

/* -------------------------------------------------------------------------- */
/*  Mutations                                                                  */
/* -------------------------------------------------------------------------- */

export async function createProject(input: CreateProjectInput, imageUrl = ''): Promise<string> {
  const db = getFirestoreDB();
  const docRef = await addDoc(collection(db, 'projects'), projectToStored(input, imageUrl, Date.now()));
  return docRef.id;
}

export async function updateProject(project: Project, imageUrl = ''): Promise<void> {
  const db = getFirestoreDB();
  const payload: Record<string, unknown> = {
    name: project.name,
    title: project.name,
    description: project.description,
    category: project.category,
    technologies: project.technologies,
    githubUrl: project.githubUrl,
    liveUrl: project.liveUrl,
    featured: project.featured,
    status: project.status,
    shortDescription: project.shortDescription || project.description.slice(0, 160),
    updatedAt: serverTimestamp(),
  };
  if (imageUrl) payload.image = imageUrl;
  await updateDoc(doc(db, 'projects', project.id), payload);
}

/** Soft delete: mark the doc as trashed so it hides from the public portfolio. */
export async function trashProject(id: string): Promise<void> {
  const db = getFirestoreDB();
  await updateDoc(doc(db, 'projects', id), {
    isDeleted: true,
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/** Restore a trashed project so it is visible again when Published. */
export async function restoreProject(id: string): Promise<void> {
  const db = getFirestoreDB();
  await updateDoc(doc(db, 'projects', id), {
    isDeleted: false,
    deletedAt: null,
    updatedAt: serverTimestamp(),
  });
}

/** Permanently delete the Firestore document (and its image when possible). */
export async function permanentlyDeleteProject(project: Project): Promise<void> {
  const db = getFirestoreDB();
  if (project.image && project.image.startsWith('gs://')) {
    try {
      await deleteObject(ref(getFirebaseStorage(), project.image));
    } catch {
      // Image may already be gone — the document deletion is what matters.
    }
  }
  await deleteDoc(doc(db, 'projects', project.id));
}

/* -------------------------------------------------------------------------- */
/*  Storage upload helper                                                      */
/* -------------------------------------------------------------------------- */

export interface UploadHandle {
  task: UploadTask;
  promise: Promise<string>;
}

/**
 * Uploads a project image to Firebase Storage and resolves with the download
 * URL. The returned UploadTask exposes progress for progress bars.
 */
export function uploadProjectImage(file: File, projectIdHint: string): UploadHandle {
  const storage = getFirebaseStorage();
  const path = `projects/${projectIdHint}/${Date.now()}_${sanitize(file.name)}`;
  const task = uploadBytesResumable(ref(storage, path), file);
  const promise = new Promise<string>((resolve, reject) => {
    task.then(
      snapshot => {
        getDownloadURL(snapshot.ref)
          .then(resolve)
          .catch(reject);
      },
      reject
    );
  });
  return { task, promise };
}

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_') || 'image';
}