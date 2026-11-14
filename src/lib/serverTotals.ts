import { getActiveProductsServer } from './productsServer';
import { getSiteSettingsServer } from './settingsServer';
import { computeOrderTotals, type OrderTotals } from './shipping';
import { COUPON_CODES } from './coupon';
import { FIREBASE_CONFIG } from './firebase-config';

// Total de un pedido calculado en el SERVIDOR con los precios reales de la
// base de datos (nunca con los que manda el navegador): es el monto que se
// firma y se cobra en el pago en línea.
export interface ServerItem {
  productId: string;
  slug: string;
  quantity: number;
}

export class TotalsError extends Error {}

// Descuento de un cupón: los fijos (NEUTRO5...) o uno personal de
// fidelización vigente y sin usar.
async function couponPercent(code: string | undefined): Promise<number> {
  const c = (code || '').trim().toUpperCase();
  if (!c) return 0;
  if (COUPON_CODES[c]) return COUPON_CODES[c];
  if (!/^[A-Z0-9-]{4,40}$/.test(c) || !FIREBASE_CONFIG.projectId) return 0;
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/loyalty/${encodeURIComponent(c)}`,
    { cache: 'no-store' },
  ).catch(() => null);
  if (!res?.ok) return 0;
  const f = ((await res.json().catch(() => null)) as { fields?: Record<string, Record<string, string | boolean>> } | null)?.fields;
  if (!f) return 0;
  const used = f.couponUsed?.booleanValue === true;
  const expires = Number(f.couponExpiresAt?.integerValue ?? f.couponExpiresAt?.doubleValue ?? 0);
  const method = f.couponMethod?.stringValue;
  const percent = Number(f.couponPercent?.integerValue ?? f.couponPercent?.doubleValue ?? 0);
  if (used || expires < Date.now() || (method && method !== 'transferencia')) return 0;
  return percent;
}

export async function computeServerTotals(input: { items: ServerItem[]; province: string; couponCode?: string }): Promise<OrderTotals> {
  if (!Array.isArray(input.items) || input.items.length === 0 || input.items.length > 30) throw new TotalsError('Carrito vacío.');
  const [products, settings, percent] = await Promise.all([getActiveProductsServer(), getSiteSettingsServer(), couponPercent(input.couponCode)]);
  const priced = input.items.map((item) => {
    const product = products.find((p) => p.id === item.productId) ?? products.find((p) => p.slug === item.slug);
    const quantity = Math.floor(Number(item.quantity));
    if (!product) throw new TotalsError('Uno de los productos ya no está disponible.');
    if (!(quantity >= 1 && quantity <= 20)) throw new TotalsError('Cantidad no válida.');
    return { price: product.price, quantity };
  });
  // Pago en línea = pago completo por adelantado (como transferencia).
  return computeOrderTotals(settings, priced, 'transferencia', input.province || '', percent);
}
