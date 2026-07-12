import 'server-only';
import { App, cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { Firestore, getFirestore } from 'firebase-admin/firestore';

let app: App | null = null;

function credentials() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) return null;
  return { projectId, clientEmail, privateKey };
}

export function getFirebaseAdminApp() {
  if (app) return app;
  if (getApps().length) return (app = getApp());
  const serviceAccount = credentials();
  if (!serviceAccount) throw new Error('Firebase Admin chưa được cấu hình trên server.');
  return (app = initializeApp({ credential: cert(serviceAccount), projectId: serviceAccount.projectId }));
}

export function getAdminFirestore(): Firestore { return getFirestore(getFirebaseAdminApp()); }
