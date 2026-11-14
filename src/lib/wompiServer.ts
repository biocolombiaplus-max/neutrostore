import { createHash, timingSafeEqual } from 'crypto';
import { WOMPI_CHECKOUT_URL, WOMPI_PUBLIC_KEY, wompiApiBase } from './wompi';
import type { WompiStatus } from './types';

// Wompi en el servidor. Las llaves secretas se configuran en Vercel →
// Settings → Environment Variables (NUNCA en el código: el repositorio es
// público):
//   WOMPI_INTEGRITY_SECRET  firma del monto en el link de pago (obligatoria)
//   WOMPI_PRIVATE_KEY       consultar pagos desde el panel
//   WOMPI_EVENTS_SECRET     verificar los avisos de pago que envía Wompi
const env = (name: string) => (process.env[name] || '').trim();

export function wompiConfig() {
  return {
    publicKey: WOMPI_PUBLIC_KEY,
    integritySecret: env('WOMPI_INTEGRITY_SECRET'),
    privateKey: env('WOMPI_PRIVATE_KEY'),
    eventsSecret: env('WOMPI_EVENTS_SECRET'),
  };
}

export function isWompiReady(): boolean {
  const c = wompiConfig();
  return !!(c.publicKey && c.integritySecret);
}

const sha256 = (text: string) => createHash('sha256').update(text, 'utf8').digest('hex');

// Firma de integridad: SHA256(referencia + monto en centavos + moneda + secreto).
export function integritySignature(reference: string, amountInCents: number, currency = 'COP'): string {
  return sha256(`${reference}${amountInCents}${currency}${wompiConfig().integritySecret}`);
}

export interface CheckoutLinkInput {
  reference: string;
  amountInCents: number;
  redirectUrl: string;
  customer: { name: string; phone: string; email?: string; address?: string; city?: string; region?: string };
}

// Link al checkout web de Wompi (tarjeta, PSE, Nequi, Bancolombia...).
export function checkoutLink({ reference, amountInCents, redirectUrl, customer }: CheckoutLinkInput): string {
  const params = new URLSearchParams();
  params.set('public-key', wompiConfig().publicKey);
  params.set('currency', 'COP');
  params.set('amount-in-cents', String(amountInCents));
  params.set('reference', reference);
  params.set('signature:integrity', integritySignature(reference, amountInCents));
  params.set('redirect-url', redirectUrl);
  if (customer.email) params.set('customer-data:email', customer.email);
  if (customer.name) params.set('customer-data:full-name', customer.name.slice(0, 80));
  const phone = customer.phone.replace(/\D/g, '').replace(/^57(?=\d{10}$)/, '');
  if (/^\d{10}$/.test(phone)) {
    params.set('customer-data:phone-number', phone);
    params.set('customer-data:phone-number-prefix', '+57');
  }
  if (customer.address) {
    params.set('shipping-address:address-line-1', customer.address.slice(0, 120));
    params.set('shipping-address:country', 'CO');
    if (customer.city) params.set('shipping-address:city', customer.city);
    if (customer.region) params.set('shipping-address:region', customer.region);
    if (/^\d{10}$/.test(phone)) params.set('shipping-address:phone-number', phone);
  }
  return `${WOMPI_CHECKOUT_URL}?${params.toString()}`;
}

// Evento de Wompi (POST a /api/wompi/events). El checksum es
// SHA256(valores de signature.properties en orden + timestamp + secreto).
export interface WompiEvent {
  event: string;
  data: { transaction?: WompiTransaction } & Record<string, unknown>;
  environment?: string;
  signature?: { properties?: string[]; checksum?: string };
  timestamp?: number;
  sent_at?: string;
}

function pick(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined), obj);
}

export function verifyEvent(event: WompiEvent, headerChecksum?: string | null): boolean {
  const secret = wompiConfig().eventsSecret;
  const props = event.signature?.properties;
  const given = (event.signature?.checksum || headerChecksum || '').toLowerCase();
  if (!secret || !Array.isArray(props) || !given || event.timestamp == null) return false;
  const expected = sha256(props.map((p) => String(pick(event.data, p) ?? '')).join('') + String(event.timestamp) + secret);
  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

export interface WompiTransaction {
  id: string;
  status: WompiStatus;
  reference: string;
  amount_in_cents: number;
  currency?: string;
  payment_method_type?: string;
  created_at?: string;
  finalized_at?: string | null;
  status_message?: string | null;
}

// Consulta pública de una transacción (no necesita llave privada).
export async function getTransaction(id: string): Promise<WompiTransaction | null> {
  const res = await fetch(`${wompiApiBase()}/transactions/${encodeURIComponent(id)}`, { cache: 'no-store' }).catch(() => null);
  if (!res?.ok) return null;
  const json = (await res.json().catch(() => null)) as { data?: WompiTransaction } | null;
  return json?.data ?? null;
}

// Pagos de una referencia (requiere la llave privada).
export async function findTransactionsByReference(reference: string): Promise<WompiTransaction[] | null> {
  const { privateKey } = wompiConfig();
  if (!privateKey) return null;
  const res = await fetch(`${wompiApiBase()}/transactions?reference=${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${privateKey}` },
    cache: 'no-store',
  }).catch(() => null);
  if (!res?.ok) return null;
  const json = (await res.json().catch(() => null)) as { data?: WompiTransaction[] } | null;
  return json?.data ?? [];
}

export async function getMerchant(): Promise<{ name: string; methods: string[] } | null> {
  const res = await fetch(`${wompiApiBase()}/merchants/${encodeURIComponent(wompiConfig().publicKey)}`, {
    next: { revalidate: 3600 },
  }).catch(() => null);
  if (!res?.ok) return null;
  const json = (await res.json().catch(() => null)) as { data?: { name?: string; legal_name?: string; accepted_payment_methods?: string[] } } | null;
  if (!json?.data) return null;
  return { name: json.data.name || json.data.legal_name || '', methods: json.data.accepted_payment_methods ?? [] };
}

// De varias transacciones, la que cuenta: una aprobada si existe; si no, la
// más reciente.
export function bestTransaction(list: WompiTransaction[]): WompiTransaction | null {
  if (!list.length) return null;
  const approved = list.find((t) => t.status === 'APPROVED');
  if (approved) return approved;
  return [...list].sort((a, b) => String(b.created_at ?? '').localeCompare(String(a.created_at ?? '')))[0];
}
