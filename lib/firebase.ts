import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, initializeFirestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getDatabase, Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Safe singleton — prevents "Firebase App named '[DEFAULT]' already exists" on hot-reload
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let rtdb: Database;

try {
  if (getApps().length) {
    app = getApp();
    db = getFirestore(app);
  } else {
    app = initializeApp(firebaseConfig);
    db = initializeFirestore(app, { experimentalForceLongPolling: true });
  }
  auth = getAuth(app);
  storage = getStorage(app);
  if (firebaseConfig.databaseURL) {
    rtdb = getDatabase(app);
  }
} catch (error) {
  console.error('[Firebase] Initialization error:', error);
}

export { app, auth, db, storage, rtdb };
