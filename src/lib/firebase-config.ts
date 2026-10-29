// Configuración web del proyecto de Firebase de Neutro Store
// (neutrostore-ce808). Estos valores son públicos por diseño —Firebase los
// envía a todos los navegadores— y la seguridad de los datos la dan las
// reglas de firestore.rules. Si se definen las variables
// NEXT_PUBLIC_FIREBASE_* (en Vercel o .env.local), tienen prioridad.
export const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCpIqkZdVYCQE687CsVNl0htI9Xka6tXow',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'neutrostore-ce808.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'neutrostore-ce808',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'neutrostore-ce808.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '555035588078',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:555035588078:web:ab61a5b03e80228df98aff',
};
