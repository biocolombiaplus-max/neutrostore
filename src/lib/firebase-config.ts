// Configuración web del proyecto de Firebase de Neutro Store. Se toma de las
// variables NEXT_PUBLIC_FIREBASE_* (en Vercel o .env.local). Estos valores son
// públicos por diseño —Firebase los envía a todos los navegadores— y la
// seguridad de los datos la dan las reglas de firestore.rules. Mientras no se
// configuren, la tienda funciona con el catálogo de demostración.
export const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};
