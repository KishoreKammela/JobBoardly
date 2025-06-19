import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider, // For Microsoft
  type Auth,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined;
let storageInstance: FirebaseStorage | undefined;

const requiredKeys: (keyof typeof firebaseConfig)[] = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];
const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  console.warn(
    `Firebase initialization skipped. Missing environment variables: ${missingKeys.join(', ')}. Please ensure all NEXT_PUBLIC_FIREBASE_ variables are set in your .env file.`
  );
} else {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  authInstance = getAuth(app);
  dbInstance = getFirestore(app);
  storageInstance = getStorage(app);
}

// Export instances or throw error if not initialized
// This allows other files to import these services directly,
// but they might be undefined if initialization failed.
// Consider adding checks in consuming files or a global "isFirebaseInitialized" flag.

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
const microsoftProvider = new OAuthProvider('microsoft.com');

// It's safer to export potentially undefined services and let consuming code handle it,
// or export a function that returns the instance (or throws if not initialized).
// For simplicity with existing code, we export them directly.
// Consumers should be aware these might be undefined if Firebase fails to init.

export {
  app,
  authInstance as auth, // Rename to avoid conflict with auth in other files if they re-export
  dbInstance as db,
  storageInstance as storage,
  googleProvider,
  githubProvider,
  microsoftProvider,
};
