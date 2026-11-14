import { NextResponse } from 'next/server';
import { getTransaction } from '@/lib/wompiServer';

// Estado de un pago (para la página /pago al volver de Wompi). Solo
// devuelve lo necesario para mostrarle el resultado al cliente.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!/^[A-Za-z0-9-]{6,80}$/.test(id)) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  const tx = await getTransaction(id);
  if (!tx) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json(
    {
      id: tx.id,
      status: tx.status,
      reference: tx.reference,
      amountInCents: tx.amount_in_cents,
      methodType: tx.payment_method_type ?? '',
      message: tx.status_message ?? '',
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
