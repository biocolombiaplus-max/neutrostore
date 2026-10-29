import { FIREBASE_CONFIG } from './firebase-config';
import { ADMIN_EMAIL } from './auth-flag';

// Valida en el servidor que la petición viene de un administrador: token de
// Firebase válido y usuario presente en la colección "admins".
export async function isAdminRequest(request: Request): Promise<boolean> {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return false;
  try {
    const lookup = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_CONFIG.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
    });
    if (!lookup.ok) return false;
    const account = ((await lookup.json()) as { users?: { localId: string; email?: string }[] }).users?.[0];
    const uid = account?.localId;
    if (!uid) return false;
    // La cuenta fija del panel siempre es administradora.
    if (account?.email?.toLowerCase() === ADMIN_EMAIL) return true;
    const adminDoc = await fetch(
      `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/admins/${uid}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' },
    );
    return adminDoc.ok;
  } catch {
    return false;
  }
}
