import { NextResponse } from 'next/server';
import { verifyEvent, type WompiEvent } from '@/lib/wompiServer';
import { orderNumberFromReference, wompiMethodLabel } from '@/lib/wompi';
import { formatPrice } from '@/lib/utils';

// Avisos de Wompi (Wompi → Desarrolladores → URL de eventos:
// https://<tu-dominio>/api/wompi/events). Se verifica la firma con
// WOMPI_EVENTS_SECRET y, si el pago quedó aprobado, se avisa al celular de la
// administradora. El pedido se marca como pagado al abrir el panel (que
// confirma el pago directamente con Wompi).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const event = (await request.json().catch(() => null)) as WompiEvent | null;
  if (!event || !verifyEvent(event, request.headers.get('x-event-checksum'))) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
  }
  const tx = event.data?.transaction;
  if (event.event === 'transaction.updated' && tx?.status === 'APPROVED') {
    const origin = new URL(request.url).origin;
    await fetch(`${origin}/api/send-push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `💳 Pago aprobado · ${orderNumberFromReference(tx.reference)}`,
        bodyText: `${formatPrice(tx.amount_in_cents / 100)} con ${wompiMethodLabel(tx.payment_method_type)}. ¡A despachar!`,
        url: '/admin/pedidos',
      }),
    }).catch(() => {});
  }
  // Wompi solo necesita un 200 para no reintentar.
  return NextResponse.json({ ok: true });
}
