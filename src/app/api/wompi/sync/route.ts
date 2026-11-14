import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';
import { bestTransaction, findTransactionsByReference, getTransaction, wompiConfig, type WompiTransaction } from '@/lib/wompiServer';
import { MAX_PAYMENT_ATTEMPTS, ORDER_NUMBER_RE, wompiReference } from '@/lib/wompi';

// Panel: estado real en Wompi de los pedidos pagados en línea. Revisa todos
// los intentos de pago de cada pedido (-P1, -P2...) con la llave privada.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!wompiConfig().privateKey) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  const body = (await request.json().catch(() => null)) as { orders?: { orderNumber: string; transactionId?: string }[] } | null;
  const orders = (body?.orders ?? []).filter((o) => ORDER_NUMBER_RE.test(o.orderNumber)).slice(0, 40);

  const results: Record<string, WompiTransaction | null> = {};
  await Promise.all(
    orders.map(async ({ orderNumber, transactionId }) => {
      const found: WompiTransaction[] = [];
      if (transactionId) {
        const tx = await getTransaction(transactionId);
        if (tx && tx.reference.startsWith(orderNumber)) found.push(tx);
      }
      for (let attempt = 1; attempt <= MAX_PAYMENT_ATTEMPTS && !found.some((t) => t.status === 'APPROVED'); attempt++) {
        const list = await findTransactionsByReference(wompiReference(orderNumber, attempt));
        if (!list || list.length === 0) {
          if (attempt > 1) break;
          continue;
        }
        found.push(...list);
      }
      results[orderNumber] = bestTransaction(found);
    }),
  );
  return NextResponse.json({ results });
}
