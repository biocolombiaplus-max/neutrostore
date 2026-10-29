'use client';

import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { ADMIN_FLAG_KEY } from './auth-flag';

const CONFIG_ERROR = new Error(
  'Firebase no está configurado todavía. Agrega las variables NEXT_PUBLIC_FIREBASE_* (ver README.md).',
);

// El panel se abre solo con la contraseña: el correo del administrador es
// fijo (cuenta de Firebase Authentication) y Firebase valida la contraseña en
// sus servidores, así que la clave nunca queda escrita en el código.
export const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@neutrostore.co').trim().toLowerCase();


export function loginAdmin(email: string, password: string) {
  if (!auth) return Promise.reject(CONFIG_ERROR);
  return signInWithEmailAndPassword(auth, email, password).then((cred) => {
    try {
      window.localStorage.setItem(ADMIN_FLAG_KEY, '1');
    } catch {
      /* sin almacenamiento */
    }
    return cred;
  });
}

export function loginAdminWithPassword(password: string) {
  return loginAdmin(ADMIN_EMAIL, password);
}

export function isFirebaseReady(): boolean {
  return !!auth;
}

// Mensaje claro para cada error de inicio de sesión de Firebase.
export function loginErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code ?? '';
  if (error === CONFIG_ERROR) return 'El panel todavía no está conectado a Firebase (ver README, paso 1).';
  if (code === 'auth/too-many-requests') return 'Demasiados intentos. Espera unos minutos y vuelve a intentar.';
  if (code === 'auth/network-request-failed') return 'Sin conexión. Revisa tu internet e intenta de nuevo.';
  if (code === 'auth/user-not-found' || code === 'auth/invalid-email')
    return `Falta crear la cuenta ${ADMIN_EMAIL} en Firebase Authentication (ver README, paso 5).`;
  return 'Contraseña incorrecta.';
}

export async function changeAdminPassword(current: string, next: string): Promise<void> {
  const user = auth?.currentUser;
  if (!user?.email) throw CONFIG_ERROR;
  await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, current));
  await updatePassword(user, next);
}

export function logoutAdmin() {
  try {
    window.localStorage.removeItem(ADMIN_FLAG_KEY);
  } catch {
    /* sin almacenamiento */
  }
  if (!auth) return Promise.resolve();
  return signOut(auth);
}

export function watchAuthState(callback: (user: User | null) => void) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function isAdminUser(uid: string): Promise<boolean> {
  if (!db) return false;
  const snap = await getDoc(doc(db, 'admins', uid));
  return snap.exists();
}
