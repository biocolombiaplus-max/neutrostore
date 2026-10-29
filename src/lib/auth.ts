'use client';

import {
  createUserWithEmailAndPassword,
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
import { ADMIN_EMAIL, ADMIN_FLAG_KEY, ADMIN_INITIAL_PASSWORD } from './auth-flag';

export { ADMIN_EMAIL };

const CONFIG_ERROR = new Error(
  'Firebase no está configurado todavía. Agrega las variables NEXT_PUBLIC_FIREBASE_* (ver README.md).',
);

// El panel se abre solo con la contraseña: el correo del administrador es
// fijo (cuenta de Firebase Authentication) y Firebase valida la contraseña en
// sus servidores, así que la clave nunca queda escrita en el código.


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

function markAdminBrowser() {
  try {
    window.localStorage.setItem(ADMIN_FLAG_KEY, '1');
  } catch {
    /* sin almacenamiento */
  }
}

// Entrar escribiendo solo la contraseña. La primera vez (cuando la cuenta
// del panel todavía no existe en Firebase) se crea sola con la contraseña
// inicial (123456): no hay que crear nada a mano en la consola de Firebase.
export async function loginAdminWithPassword(password: string) {
  if (!auth) throw CONFIG_ERROR;
  try {
    return await loginAdmin(ADMIN_EMAIL, password);
  } catch (err) {
    const code = (err as { code?: string })?.code ?? '';
    const mayNotExist = code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials';
    if (!mayNotExist || password !== ADMIN_INITIAL_PASSWORD) throw err;
    try {
      const cred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, password);
      markAdminBrowser();
      return cred;
    } catch (createErr) {
      // Ya existe: la contraseña escrita simplemente no es la correcta.
      if ((createErr as { code?: string })?.code === 'auth/email-already-in-use') throw err;
      throw createErr;
    }
  }
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
  if (code === 'auth/operation-not-allowed')
    return 'Activa "Correo electrónico/contraseña" en Firebase → Authentication → Sign-in method.';
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

export async function isAdminUser(uid: string, email?: string | null): Promise<boolean> {
  // La cuenta fija del panel siempre es administradora.
  if (email && email.toLowerCase() === ADMIN_EMAIL) return true;
  if (!db) return false;
  const snap = await getDoc(doc(db, 'admins', uid));
  return snap.exists();
}
