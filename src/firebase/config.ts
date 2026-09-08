import { initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { browserLocalPersistence, getAuth, setPersistence, type Auth } from 'firebase/auth';
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
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined,
};

// Local/demo storage is available during development, but production must use
// the shared Firebase project so public visitors can see the same projects.
const freeDashboardAccess = import.meta.env.DEV && import.meta.env.VITE_FREE_DASHBOARD_ACCESS === 'true';

/**
 * Returns true only when a usable Firebase project has been configured.
 * Authentication and Firestore only need the core Firebase app settings.
 * Storage remains optional until an image upload is requested.
 */
export function isFirebaseConfigured(): boolean {
  return !freeDashboardAccess && Boolean(config.apiKey && config.authDomain && config.projectId);
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;

function getFirebaseOptions(): FirebaseOptions {
  return {
    apiKey: config.apiKey!,
    authDomain: config.authDomain!,
    projectId: config.projectId!,
    storageBucket: config.storageBucket!,
    messagingSenderId: config.messagingSenderId!,
    appId: config.appId!,
    measurementId: config.measurementId,
  };
}

function requireApp(): FirebaseApp {
  if (!app) {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Add your VITE_FIREBASE_* environment variables.');
    }
    app = initializeApp(getFirebaseOptions());
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

/** Keep the signed-in account available after a browser refresh. */
export async function persistFirebaseAuth(): Promise<void> {
  await setPersistence(getFirebaseAuth(), browserLocalPersistence);
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

/**
 * Firebase Analytics is optional. If a measurement ID is provided we try to
 * initialize it once in supported browsers and otherwise keep the app running
 * normally.
 */
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (analytics) {
    return analytics;
  }

  if (!isFirebaseConfigured() || !config.measurementId) {
    return null;
  }

  if (!(await isSupported())) {
    return null;
  }

  analytics = getAnalytics(requireApp());
  return analytics;
}

/** Firebase configuration errors are never silent — include a useful hint. */
export function firebaseNotConfiguredError(): Error {
  return new Error(
    'Firebase is not configured. Please add the VITE_FIREBASE_* environment variables ' +
      '(see .env.example) and restart the dev server.'
  );
}
