'use client';

import type { CartItem } from './types';
import type { OrderTotals } from './shipping';

// Pide al servidor el link de pago de Wompi (el monto lo calcula y firma el
// servidor). Lanza un Error con un mensaje listo para mostrar al cliente.
export async function startOnlinePayment(input: {
  orderNumber: string;
  attempt: number;
  items: Pick<CartItem, 'productId' | 'slug' | 'quantity'>[];
  province: string;
  couponCode?: string;
  customer: { name: string; phone: string; address?: string; city?: string; province?: string };
}): Promise<{ url: string; reference: string; totals: OrderTotals }> {
  const res = await fetch('/api/wompi/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...input,
      items: input.items.map((i) => ({ productId: i.productId, slug: i.slug, quantity: i.quantity })),
    }),
  }).catch(() => null);
  const json = (await res?.json().catch(() => null)) as { url?: string; reference?: string; totals?: OrderTotals; message?: string } | null;
  if (!res?.ok || !json?.url || !json.reference || !json.totals) {
    throw new Error(json?.message || 'No pudimos conectar con la pasarela de pago. Revisa tu internet e intenta de nuevo.');
  }
  return { url: json.url, reference: json.reference, totals: json.totals };
}
