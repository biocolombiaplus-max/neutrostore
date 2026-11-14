import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';
import { findTransactionsByReference, getMerchant, wompiConfig } from '@/lib/wompiServer';

// Panel → Configuración: revisa que Wompi esté bien conectado.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const c = wompiConfig();
  const merchant = await getMerchant();
  const privateOk = c.privateKey ? (await findTransactionsByReference('NS-VERIFICACION')) !== null : false;
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, '');
  return NextResponse.json({
    publicKey: { ok: !!merchant, merchant: merchant?.name ?? '', methods: merchant?.methods ?? [], test: c.publicKey.startsWith('pub_test') },
    integritySecret: { ok: !!c.integritySecret },
    privateKey: { ok: privateOk, configured: !!c.privateKey },
    eventsSecret: { ok: !!c.eventsSecret },
    eventsUrl: `${origin}/api/wompi/events`,
  });
}
