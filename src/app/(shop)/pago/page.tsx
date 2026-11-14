'use client';

import Link from 'next/link';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getLastLocalOrder, notifyOrderByEmail } from '@/lib/localOrders';
import { useSiteSettings } from '@/lib/settings-context';
import { formatPrice, whatsappLinkTo } from '@/lib/utils';
import { trackPixel } from '@/lib/pixel';
import { trackVisitorPurchase } from '@/lib/visitor';
import { attemptFromReference, MAX_PAYMENT_ATTEMPTS, wompiMethodLabel } from '@/lib/wompi';
import { startOnlinePayment } from '@/lib/wompiClient';
import { WhatsAppIcon } from '@/components/icons';
import type { Order, WompiStatus } from '@/lib/types';

interface Tx {
  id: string;
  status: WompiStatus;
  reference: string;
  amountInCents: number;
  methodType: string;
  message: string;
}

type View = 'loading' | 'approved' | 'pending' | 'failed' | 'missing';

// Pantalla al volver de Wompi (redirect-url): confirma el pago con Wompi y
// le dice al cliente exactamente qué pasó y qué sigue.
function PagoContent() {
  const params = useSearchParams();
  const settings = useSiteSettings();
  const orderNumber = params.get('pedido') ?? '';
  const txId = params.get('id') ?? '';
  const [tx, setTx] = useState<Tx | null>(null);
  const [view, setView] = useState<View>('loading');
  const [order, setOrder] = useState<Order | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState('');
  const polls = useRef(0);

  useEffect(() => {
    const last = getLastLocalOrder();
    if (last && last.orderNumber === orderNumber) setOrder(last);
  }, [orderNumber]);

  // Consulta el pago; si sigue en proceso (PSE, Nequi) se vuelve a mirar
  // cada pocos segundos durante unos minutos.
  useEffect(() => {
    if (!txId) {
      setView('missing');
      return;
    }
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    const check = async () => {
      const res = await fetch(`/api/wompi/transaction?id=${encodeURIComponent(txId)}`, { cache: 'no-store' }).catch(() => null);
      const data = (await res?.json().catch(() => null)) as Tx | null;
      if (stop) return;
      if (!res?.ok || !data || (orderNumber && !data.reference.startsWith(orderNumber))) {
        setView(polls.current < 3 ? 'loading' : 'missing');
      } else {
        setTx(data);
        setView(data.status === 'APPROVED' ? 'approved' : data.status === 'PENDING' ? 'pending' : 'failed');
        if (data.status !== 'PENDING') return;
      }
      polls.current += 1;
      if (polls.current < 45) timer = setTimeout(check, 4000);
    };
    check();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [txId, orderNumber]);

  // Pago aprobado: compra para el Píxel y correo a la tienda (una sola vez).
  useEffect(() => {
    if (view !== 'approved' || !tx) return;
    const key = `ns-paid-${tx.reference}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, '1');
    } catch {
      /* sin almacenamiento */
    }
    const total = tx.amountInCents / 100;
    trackVisitorPurchase(orderNumber);
    trackPixel(
      'Purchase',
      {
        content_ids: order?.items.map((i) => i.metaId || i.productId) ?? [],
        content_type: 'product',
        num_items: order?.items.reduce((n, i) => n + i.quantity, 0) ?? 1,
        value: total,
        currency: 'COP',
      },
      orderNumber,
    );
    if (order) {
      notifyOrderByEmail({
        to: settings.notificationEmail,
        storeName: settings.storeName,
        accentColor: settings.colors.primary,
        orderNumber,
        items: order.items,
        subtotal: order.subtotal,
        shipping: order.shipping,
        total,
        payNow: total,
        payOnDelivery: 0,
        paymentMethod: 'transferencia',
        customer: order.customer,
      });
    }
  }, [view, tx, order, orderNumber, settings]);

  async function retry() {
    if (!order) return;
    setRetrying(true);
    setRetryError('');
    try {
      const last = tx?.reference ?? order.payment?.reference ?? '';
      const attempt = Math.min(MAX_PAYMENT_ATTEMPTS, (last ? attemptFromReference(last) : 1) + 1);
      const { url } = await startOnlinePayment({
        orderNumber,
        attempt,
        items: order.items,
        province: order.customer.province,
        couponCode: order.couponCode,
        customer: order.customer,
      });
      window.location.href = url;
    } catch (err) {
      setRetryError(err instanceof Error ? err.message : 'No pudimos abrir el pago. Intenta de nuevo.');
      setRetrying(false);
    }
  }

  const amount = tx ? tx.amountInCents / 100 : order?.total ?? 0;
  const method = wompiMethodLabel(tx?.methodType);
  const waMessage =
    view === 'approved'
      ? `Hola ${settings.storeName}, ya pagué mi pedido *${orderNumber}* en línea (${method}, ${formatPrice(amount)}). Referencia de pago: ${tx?.id}. ¡Gracias!`
      : `Hola ${settings.storeName}, quiero ayuda con el pago de mi pedido *${orderNumber}*.`;
  const waUrl = whatsappLinkTo(settings.whatsappNumber, waMessage, settings.whatsappCountryCode);

  return (
    <div className="container-page max-w-xl py-10 sm:py-16">
      {view === 'loading' && (
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          <h1 className="mt-6 text-2xl font-black uppercase text-ink">Confirmando tu pago…</h1>
          <p className="mt-2 text-sm text-muted">Estamos verificando con la pasarela. No cierres esta página.</p>
        </div>
      )}

      {view === 'approved' && (
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 animate-popIn items-center justify-center rounded-full bg-whatsapp text-4xl text-white shadow-lift">✓</div>
          <p className="mt-6 text-[11px] font-extrabold uppercase tracking-[0.25em] text-primary-dark">Pedido {orderNumber}</p>
          <h1 className="mt-2 font-heading text-3xl font-black uppercase text-ink">¡Pago aprobado!</h1>
          <p className="mt-2 text-sm text-muted">
            {order?.customer.name ? `${order.customer.name.split(' ')[0]}, gracias` : 'Gracias'} por tu compra. Ya estamos alistando tu pedido.
          </p>
          <div className="mt-7 rounded-3xl bg-ink p-6 text-left text-white">
            <Row label="Pagaste" value={formatPrice(amount)} big />
            <Row label="Medio de pago" value={method} />
            <Row label="Referencia" value={tx?.id ?? ''} mono />
            {order && <Row label="Entrega" value={`${order.customer.city}, ${order.customer.province}`} />}
          </div>
          <ol className="mt-6 space-y-2 text-left text-sm">
            <Step n={1} text="Despachamos tu pedido hoy mismo con Servientrega." />
            <Step n={2} text="Te enviamos el número de guía por WhatsApp." />
            <Step n={3} text={`Lo recibes en ${settings.shipping.deliveryTime}. ¡Nada más que pagar!`} />
          </ol>
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-7 w-full py-4">
            <WhatsAppIcon /> Avisar por WhatsApp que ya pagué
          </a>
          <Link href="/catalogo" className="mt-4 block text-sm font-bold text-muted underline">
            Seguir comprando
          </Link>
        </div>
      )}

      {view === 'pending' && (
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold-gradient text-4xl shadow-lift">⏳</div>
          <h1 className="mt-6 font-heading text-3xl font-black uppercase text-ink">Tu pago está en proceso</h1>
          <p className="mt-2 text-sm text-muted">
            {method === 'PSE' || method === 'Nequi'
              ? `Tu banco está confirmando el pago con ${method}. Suele tardar unos segundos.`
              : 'La pasarela está confirmando tu pago. Suele tardar unos segundos.'}{' '}
            Esta página se actualiza sola.
          </p>
          <div className="mx-auto mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-cream-alt">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
          </div>
          <p className="mt-6 text-xs text-muted">
            Pedido {orderNumber} · {formatPrice(amount)}. Si ya pagaste y no se actualiza, escríbenos y lo verificamos.
          </p>
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary mt-4 inline-flex">
            Escribir por WhatsApp
          </a>
        </div>
      )}

      {(view === 'failed' || view === 'missing') && (
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-urgent/10 text-4xl">✕</div>
          <h1 className="mt-6 font-heading text-3xl font-black uppercase text-ink">
            {view === 'missing' ? 'No se completó el pago' : 'Tu pago no fue aprobado'}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {view === 'failed' && tx?.message ? `${tx.message}. ` : ''}
            No se hizo ningún cobro. Puedes intentarlo otra vez con otra tarjeta o medio de pago, o pedir por WhatsApp y pagar contra entrega.
          </p>
          {order ? (
            <button type="button" onClick={retry} disabled={retrying} className="btn-primary btn-shine mt-7 w-full py-4 text-base disabled:opacity-60">
              {retrying ? 'Abriendo la pasarela…' : `🔒 Intentar pagar de nuevo ${formatPrice(order.total)}`}
            </button>
          ) : (
            <Link href="/carrito" className="btn-primary mt-7 w-full py-4">
              Volver al carrito
            </Link>
          )}
          {retryError && <p className="mt-3 rounded-xl bg-urgent/10 p-3 text-sm font-semibold text-urgent">{retryError}</p>}
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-3 w-full py-4">
            <WhatsAppIcon /> Pedir por WhatsApp y pagar al recibir
          </a>
          <p className="mt-5 text-xs text-muted">Pedido {orderNumber}</p>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, big = false, mono = false }: { label: string; value: string; big?: boolean; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 py-2.5 last:border-0">
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">{label}</span>
      <span className={big ? 'text-2xl font-black text-primary-light' : mono ? 'break-all font-mono text-xs text-white/85' : 'text-sm font-bold'}>{value}</span>
    </div>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <li className="flex items-start gap-3 rounded-2xl bg-cream-alt/70 p-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-black text-white">{n}</span>
      <span className="text-ink">{text}</span>
    </li>
  );
}

export default function PagoPage() {
  return (
    <Suspense fallback={null}>
      <PagoContent />
    </Suspense>
  );
}
