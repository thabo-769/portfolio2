import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

/**
 * Firebase configuration.
 *
 * Credentials are read exclusively from environment variables (Vite exposes
 * VITE_* vars at build time) so no secret is committed to source. If the
 * required variables are not provided the app simply reports Firebase as
 * "not configured" instead of crashing or using placeholder credentials.
 */
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

/**
 * Returns true only when a usable Firebase project has been configured.
 * Without a project id and API key none of the Firebase services can work.
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(config.apiKey && config.authDomain && config.projectId);
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

function requireApp(): FirebaseApp {
  if (!app) {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Add your VITE_FIREBASE_* environment variables.');
    }
    app = initializeApp(config);
  }
  return app;
}

/** Lazily-initialized Auth instance. Throws a clear error when not configured. */
export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(requireApp());
  }
  return auth;
}

/** Lazily-initialized Firestore instance. */
export function getFirestoreDB(): Firestore {
  if (!db) {
    db = getFirestore(requireApp());
  }
  return db;
}

/** Lazily-initialized Storage instance. */
export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) {
    storage = getStorage(requireApp());
  }
  return storage;
}

/** Firebase configuration errors are never silent — include a useful hint. */
export function firebaseNotConfiguredError(): Error {
  return new Error(
    'Firebase is not configured. Please add the VITE_FIREBASE_* environment variables ' +
      '(see .env.example) and restart the dev server.'
  );
}