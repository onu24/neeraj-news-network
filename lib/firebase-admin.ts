import * as admin from 'firebase-admin';

/**
 * lib/firebase-admin.ts — Server-side Firebase SDK
 *
 * This SDK is only for server environments (Server Components, API Routes, Middleware).
 * It is used for verifying session cookies and managing data with elevated privileges.
 */

function cleanEnv(value?: string | null) {
  if (!value) return undefined;
  return value.trim().replace(/^['"]|['"]$/g, '');
}

function normalizeBucketName(value?: string | null) {
  const cleaned = cleanEnv(value);
  if (!cleaned) return undefined;

  return cleaned
    .replace(/^gs:\/\//, '')
    .replace(/^https?:\/\/storage\.googleapis\.com\//, '')
    .replace(/\/+$/, '');
}

const projectId = cleanEnv(process.env.FIREBASE_PROJECT_ID) || cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
const clientEmail = cleanEnv(process.env.FIREBASE_CLIENT_EMAIL);
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY
      .trim()
      .replace(/^['"]+|['"]+$/g, '') // Remove any number of outer quotes
      .replace(/\\(.)/g, (match, p) => (p === 'n' ? '\n' : p)) // Unescape: \n -> newline, others -> char
      .trim()
  : undefined;
const configuredStorageBucket =
  normalizeBucketName(process.env.FIREBASE_STORAGE_BUCKET) ||
  normalizeBucketName(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
const fallbackFirebaseStorageBucket = projectId ? `${projectId}.firebasestorage.app` : undefined;
const fallbackAppspotBucket = projectId ? `${projectId}.appspot.com` : undefined;
const storageBucket = configuredStorageBucket || fallbackFirebaseStorageBucket || fallbackAppspotBucket;

export const isFirebaseAdminConfigured = () => {
  return !!privateKey && !!clientEmail && !!projectId;
};

export function getAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  if (!isFirebaseAdminConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[Firebase Admin] Missing service account credentials.');
    }
    // Return a dummy value that will be caught by checks, but don't initialize a fake app
    // during the build phase as it causes hangs.
    return null as any;
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      ...(storageBucket ? { storageBucket } : {}),
    });
  } catch (error: any) {
    if (error.code === 'app/duplicate-app') {
      return admin.app();
    }
    console.error('[Firebase Admin] Initialization error:', error);
    throw error;
  }
}

export const adminAuth = () => getAdminApp().auth();
export const adminDb = () => getAdminApp().firestore();
export const adminStorage = () => getAdminApp().storage();
export const getAdminStorageBucketName = () => storageBucket;
export const getAdminStorageBucketCandidates = () =>
  Array.from(
    new Set([configuredStorageBucket, fallbackFirebaseStorageBucket, fallbackAppspotBucket].filter(Boolean))
  ) as string[];
