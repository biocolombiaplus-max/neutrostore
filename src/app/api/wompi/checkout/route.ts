import { NextResponse } from 'next/server';
import { checkoutLink, isWompiReady } from '@/lib/wompiServer';
import { computeServerTotals, TotalsError, type ServerItem } from '@/lib/serverTotals';
import { MAX_PAYMENT_ATTEMPTS, ORDER_NUMBER_RE, wompiReference } from '@/lib/wompi';

// Crea el link de pago de Wompi de un pedido. El monto lo calcula el
// servidor con los precios reales (no se confía en lo que manda el
// navegador) y va firmado con la llave de integridad.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Body {
  orderNumber?: string;
  attempt?: number;
  items?: ServerItem[];
  province?: string;
  couponCode?: string;
  customer?: { name?: string; phone?: string; email?: string; address?: string; city?: string; province?: string };
}

export async function POST(request: Request) {
  if (!isWompiReady()) {
    return NextResponse.json({ error: 'not_configured', message: 'El pago en línea no está disponible en este momento.' }, { status: 503 });
  }
  const body = (await request.json().catch(() => null)) as Body | null;
  const orderNumber = String(body?.orderNumber || '');
  const attempt = Math.floor(Number(body?.attempt) || 1);
  if (!ORDER_NUMBER_RE.test(orderNumber) || attempt < 1 || attempt > MAX_PAYMENT_ATTEMPTS) {
    return NextResponse.json({ error: 'bad_request', message: 'Pedido no válido.' }, { status: 400 });
  }

  try {
    const totals = await computeServerTotals({ items: body?.items ?? [], province: body?.province ?? '', couponCode: body?.couponCode });
    const amountInCents = Math.round(totals.total) * 100;
    if (amountInCents < 150000) return NextResponse.json({ error: 'amount', message: 'El monto mínimo para pagar en línea es $1.500.' }, { status: 400 });

    const reference = wompiReference(orderNumber, attempt);
    const origin = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, '');
    const redirectUrl = `${origin}/pago?pedido=${encodeURIComponent(orderNumber)}`;
    const c = body?.customer ?? {};
    const url = checkoutLink({
      reference,
      amountInCents,
      redirectUrl,
      customer: {
        name: String(c.name || ''),
        phone: String(c.phone || ''),
        email: c.email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.email) ? c.email : undefined,
        address: c.address ? String(c.address) : undefined,
        city: c.city ? String(c.city) : undefined,
        region: c.province ? String(c.province) : undefined,
      },
    });
    return NextResponse.json({ url, reference, totals });
  } catch (err) {
    if (err instanceof TotalsError) return NextResponse.json({ error: 'items', message: err.message }, { status: 400 });
    return NextResponse.json({ error: 'server', message: 'No pudimos preparar el pago. Intenta de nuevo.' }, { status: 500 });
  }
}
