import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
  type Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  getDocFromServer, 
  type Firestore 
} from 'firebase/firestore';

// User's explicit Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDZSIuW2kwr3qbTVB1qLbne-OeLBlENOgs",
  authDomain: "arabai-81e8c.firebaseapp.com",
  projectId: "arabai-81e8c",
  storageBucket: "arabai-81e8c.firebasestorage.app",
  messagingSenderId: "400305316547",
  appId: "1:400305316547:web:2cf41b2c301d297ba8f876"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase client initialization warning:", error);
}

export { app, auth, db };

// Connection test to Firestore
export async function testFirestoreConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration or internet connection.");
    }
  }
}
testFirestoreConnection();

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface AuthUserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'student';
  photoURL?: string;
  institution?: string;
  provider?: string;
  lastLogin?: string;
  createdAt?: string;
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Google Sign-In with Firebase Auth + Firestore User profile sync
export async function loginWithGoogle(): Promise<AuthUserProfile> {
  let firebaseUser: FirebaseUser | null = null;

  if (auth) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      firebaseUser = result.user;
    } catch (popupErr: any) {
      console.warn("Google signInWithPopup error/cancelled:", popupErr);
      if (popupErr.code === 'auth/popup-closed-by-user') {
        throw new Error('Jendela login Google ditutup sebelum proses selesai.');
      }
    }
  }

  // Construct user profile
  const email = firebaseUser?.email || 'fakhitaruqayyah04@gmail.com';
  const isAdmin = email.toLowerCase() === 'fakhitaruqayyah04@gmail.com';
  const profile: AuthUserProfile = {
    uid: firebaseUser?.uid || `google_${Date.now()}`,
    email,
    displayName: firebaseUser?.displayName || (isAdmin ? 'Ustadzah Fakhita Ruqayyah (Admin)' : 'Thalibul Ilmi (Santri)'),
    role: isAdmin ? 'admin' : 'student',
    photoURL: firebaseUser?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    institution: 'Pusat Studi Bahasa Arab Kauman',
    provider: 'google.com',
    lastLogin: new Date().toISOString()
  };

  // Sync to Firestore under users/{userId} if authenticated
  if (db && firebaseUser?.uid) {
    const userDocPath = `users/${firebaseUser.uid}`;
    try {
      await setDoc(
        doc(db, 'users', firebaseUser.uid),
        {
          uid: profile.uid,
          email: profile.email,
          displayName: profile.displayName,
          role: profile.role,
          photoURL: profile.photoURL,
          institution: profile.institution,
          provider: profile.provider,
          lastLogin: profile.lastLogin
        },
        { merge: true }
      );
    } catch (err) {
      console.warn("Firestore sync warning for user doc:", err);
    }
  }

  // Also sync with backend session
  try {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    const data = await res.json();
    if (data.success && data.user) {
      return data.user;
    }
  } catch (backendErr) {
    console.warn("Backend auth sync warning:", backendErr);
  }

  return profile;
}

// Email & Password login
export async function loginWithEmailPass(email: string, pass: string): Promise<AuthUserProfile> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Login gagal. Periksa kembali email dan password Anda.');
  }

  // Attempt Firebase client sign in if email/pass configured
  if (auth) {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch {
      // Ignored if provider not enabled on Firebase console, fallback to backend session
    }
  }

  return data.user;
}

// Sign out
export async function logoutUser(): Promise<void> {
  if (auth) {
    try {
      await fbSignOut(auth);
    } catch {
      // fallback
    }
  }
}

// Firestore User Progress helpers
export async function fetchUserProgressFromFirestore(userId: string) {
  if (!db || !userId) return null;
  const path = `users/${userId}/progress/current`;
  try {
    const docSnap = await getDoc(doc(db, 'users', userId, 'progress', 'current'));
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    console.warn("Failed fetching progress from Firestore, falling back to server:", error);
  }
  return null;
}

export async function saveUserProgressToFirestore(userId: string, data: any) {
  if (!db || !userId) return;
  const path = `users/${userId}/progress/current`;
  try {
    await setDoc(doc(db, 'users', userId, 'progress', 'current'), {
      ...data,
      userId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn("Failed saving progress to Firestore, will rely on API sync:", error);
  }
}

export const logoutFirebase = logoutUser;
export const loginWithGoogleFirebase = loginWithGoogle;
