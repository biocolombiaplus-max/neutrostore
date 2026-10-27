// Celulares de Colombia: +57 3XX XXX XXXX. Se guardan como "3XXXXXXXXX"
// (10 dígitos). Los nombres de las funciones se conservan del proyecto base.

// Deja solo los 10 dígitos nacionales (quita +57, 57 o ceros iniciales).
export function ecNational(raw: string): string {
  let d = (raw || '').replace(/\D/g, '');
  if (d.length > 10 && d.startsWith('57')) d = d.slice(2);
  d = d.replace(/^0+/, '');
  return d.slice(0, 10);
}

export const isEcMobile = (national: string): boolean => /^3\d{9}$/.test(national);

// En Colombia el número local es el mismo nacional: "3001234567".
export const ecLocal = (national: string): string => national || '';

// "3001234567" → "300 123 4567"
export function formatEcNational(national: string): string {
  const d = national.slice(0, 10);
  return [d.slice(0, 3), d.slice(3, 6), d.slice(6, 10)].filter(Boolean).join(' ');
}

// El WhatsApp del cliente queda guardado en su teléfono (aparte del
// seguimiento de visitas) para no volver a pedírselo en la próxima compra.
const PHONE_KEY = 'ns-wa-phone';

export function rememberPhone(national: string): void {
  try {
    if (isEcMobile(national)) window.localStorage.setItem(PHONE_KEY, national);
  } catch {
    /* sin almacenamiento */
  }
}

export function savedPhone(fallback = ''): string {
  try {
    const stored = window.localStorage.getItem(PHONE_KEY);
    if (stored && isEcMobile(stored)) return stored;
  } catch {
    /* sin almacenamiento */
  }
  return ecNational(fallback);
}
