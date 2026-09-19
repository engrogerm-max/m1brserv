import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, disableNetwork, Firestore, setLogLevel } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Silence all internal Firebase SDK warnings, retries, and backoff logs in the console
try {
  setLogLevel('silent');
} catch (e) {
  // ignore
}

export const app = initializeApp(firebaseConfig);

const firestoreDbId = firebaseConfig.firestoreDatabaseId || '(default)';

let dbInstance: Firestore | null = null;

try {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('m1_firestore_quota_exceeded');
  }
  dbInstance = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  }, firestoreDbId);
} catch (e) {
  console.warn('⚠️ Error during Firestore initialization:', e);
}

export const db = dbInstance;

console.log('🔥 Firebase Cloud Database Initialized with persistentLocalCache:', firebaseConfig.projectId);
