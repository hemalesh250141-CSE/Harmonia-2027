import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import type {
  ParticipantProfile,
  PaymentQrConfig,
  PosterConfig,
  TeamRegistration,
} from './types/hackathon';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
export const FIRESTORE_DATABASE_ID = firebaseConfig.firestoreDatabaseId;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration (client is offline).');
    }
    return false;
  }
}

// Run startup connectivity check once
void testFirestoreConnection();

export async function signInWithGooglePopup(): Promise<User> {
  const credential = await signInWithPopup(auth, googleProvider);
  return credential.user;
}

export async function signOutFirebase(): Promise<void> {
  await signOut(auth);
}

export async function fetchParticipantProfile(uid: string): Promise<ParticipantProfile | null> {
  const path = `participants/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'participants', uid));
    return snap.exists() ? (snap.data() as ParticipantProfile) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveParticipantProfileToFirestore(
  profile: ParticipantProfile
): Promise<void> {
  const path = `participants/${profile.uid}`;
  try {
    await setDoc(doc(db, 'participants', profile.uid), profile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveRegistrationToFirestore(
  registration: TeamRegistration
): Promise<void> {
  const path = `registrations/${registration.id}`;
  try {
    await setDoc(doc(db, 'registrations', registration.id), registration);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateRegistrationInFirestore(
  regId: string,
  patch: Partial<TeamRegistration>
): Promise<void> {
  const path = `registrations/${regId}`;
  try {
    await updateDoc(doc(db, 'registrations', regId), patch);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function fetchUserRegistrationsFromFirestore(
  uid: string
): Promise<TeamRegistration[]> {
  const path = 'registrations';
  try {
    const q = query(collection(db, 'registrations'), where('leaderUid', '==', uid));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as TeamRegistration);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function subscribeActiveQrFromFirestore(
  onUpdate: (config: PaymentQrConfig | null) => void
): Unsubscribe {
  const path = 'payment_config/active_qr';
  return onSnapshot(
    doc(db, 'payment_config', 'active_qr'),
    (snap) => {
      onUpdate(snap.exists() ? (snap.data() as PaymentQrConfig) : null);
    },
    (error) => {
      // Public read errors are handled gracefully without crashing public visitors
      console.warn('Active QR listener warning:', error.message, path);
    }
  );
}

export async function saveActiveQrToFirestore(config: PaymentQrConfig): Promise<void> {
  const path = 'payment_config/active_qr';
  try {
    await setDoc(doc(db, 'payment_config', 'active_qr'), config);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeActivePosterFromFirestore(
  onUpdate: (config: PosterConfig | null) => void
): Unsubscribe {
  const path = 'payment_config/active_poster';
  return onSnapshot(
    doc(db, 'payment_config', 'active_poster'),
    (snap) => {
      onUpdate(snap.exists() ? (snap.data() as PosterConfig) : null);
    },
    (error) => {
      console.warn('Active Poster listener warning:', error.message, path);
    }
  );
}

export async function saveActivePosterToFirestore(config: PosterConfig): Promise<void> {
  const path = 'payment_config/active_poster';
  try {
    await setDoc(doc(db, 'payment_config', 'active_poster'), config);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeAllRegistrationsAdmin(
  onData: (rows: TeamRegistration[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'registrations';
  return onSnapshot(
    collection(db, 'registrations'),
    (snap) => {
      onData(snap.docs.map((d) => d.data() as TeamRegistration));
    },
    (error) => {
      if (onError) {
        onError(error);
      } else {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    }
  );
}
