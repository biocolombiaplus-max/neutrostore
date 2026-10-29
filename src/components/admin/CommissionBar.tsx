'use client';

import { useState } from 'react';
import type { CommissionSettings, Order } from '@/lib/types';
import { classNames, formatPrice } from '@/lib/utils';

// Comisión de la agencia (Biomarketing): un valor fijo por cada venta (o por
// cada unidad) de las campañas de Meta Ads. Se liquida por quincenas: del 1
// al 15 y del 16 al último día del mes.
// • Ganado: pedidos confirmados, enviados o entregados.
// • Por confirmar: pedidos pendientes (aún sin pago).
// • Los cancelados nunca cuentan.
const EARNED = new Set(['confirmado', 'enviado', 'entregado']);

const dayLabel = (d: Date) => d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });

interface Period {
  key: string;
  start: Date;
  end: Date;
}

function quincena(date: Date): Period {
  const y = date.getFullYear();
  const m = date.getMonth();
  const first = date.getDate() <= 15;
  return {
    key: `${y}-${String(m + 1).padStart(2, '0')}-${first ? 1 : 2}`,
    start: new Date(y, m, first ? 1 : 16),
    end: first ? new Date(y, m, 15, 23, 59, 59, 999) : new Date(y, m + 1, 0, 23, 59, 59, 999),
  };
}

// Pedidos que cuentan para la comisión (solo Meta Ads si así está configurado).
export function commissionOrders(orders: Order[], config: CommissionSettings): Order[] {
  return orders.filter((o) => !config.onlyMetaAds || !!o.tracking?.metaAd);
}

// Cuántas "ventas" suma un grupo de pedidos: pedidos o unidades.
function count(orders: Order[], config: CommissionSettings): number {
  if (config.per === 'venta') return orders.length;
  return orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + (i.quantity || 1), 0), 0);
}

function inPeriod(orders: Order[], p: Period, statuses: (s: string) => boolean) {
  return orders.filter((o) => statuses(o.status) && o.createdAt >= p.start.getTime() && o.createdAt <= p.end.getTime());
}

export default function CommissionBar({
  orders,
  since,
  paid,
  config,
  onTogglePaid,
  now = new Date(),
}: {
  orders: Order[] | null;
  since: number;
  paid: string[];
  config: CommissionSettings;
  onTogglePaid?: (key: string, value: boolean) => Promise<void>;
  now?: Date;
}) {
  const [busy, setBusy] = useState('');
  if (!config.enabled || config.amount <= 0) return null;

  const unit = (n: number) =>
    config.per === 'venta' ? `${n} ${n === 1 ? 'venta' : 'ventas'}` : `${n} ${n === 1 ? 'unidad' : 'unidades'}`;
  const current = quincena(now);
  const list = commissionOrders(orders ?? [], config);
  const earned = count(inPeriod(list, current, (s) => EARNED.has(s)), config);
  const pending = count(inPeriod(list, current, (s) => s === 'pendiente'), config);
  const totalDays = Math.round((current.end.getTime() - current.start.getTime()) / 86400000);
  const elapsed = Math.min(totalDays, Math.max(1, Math.ceil((now.getTime() - current.start.getTime()) / 86400000)));
  const daysLeft = totalDays - elapsed;

  // Quincenas anteriores (hasta 12) para liquidar y marcar pagadas. Si nunca
  // se reinició el panel, se muestran desde el primer pedido.
  const firstOrder = list.reduce((min, o) => Math.min(min, o.createdAt), Date.now());
  const from = since || firstOrder;
  const history: (Period & { units: number })[] = [];
  let cursor = new Date(current.start.getTime() - 1);
  for (let i = 0; i < 12 && cursor.getTime() >= from; i++) {
    const p = quincena(cursor);
    history.push({ ...p, units: count(inPeriod(list, p, (s) => EARNED.has(s)), config) });
    cursor = new Date(p.start.getTime() - 1);
  }
  const owed = history.filter((h) => h.units > 0 && !paid.includes(h.key)).reduce((s, h) => s + h.units * config.amount, 0);

  async function toggle(key: string, value: boolean) {
    if (!onTogglePaid) return;
    setBusy(key);
    try {
      await onTogglePaid(key, value);
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="relative mt-6 overflow-hidden rounded-card bg-[#0a0a0a] p-5 text-white shadow-soft ring-1 ring-primary/40 sm:p-6">
      <span className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.3),transparent_70%)]" />
      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-light">
            💼 Ganancia de {config.name} · esta quincena
          </p>
          <p className="mt-1 text-3xl font-black sm:text-4xl">
            {orders ? formatPrice(earned * config.amount) : '—'} <span className="text-sm font-bold text-white/50">COP</span>
          </p>
          <p className="mt-1 text-xs text-white/60">
            {unit(earned)} {config.onlyMetaAds ? 'de Meta Ads ' : ''}confirmadas × {formatPrice(config.amount)} · del {dayLabel(current.start)} al{' '}
            {dayLabel(current.end)}
          </p>
          {pending > 0 && (
            <p className="mt-1 text-xs font-semibold text-primary-light">
              + {formatPrice(pending * config.amount)} por confirmar ({unit(pending)} pendientes de pago)
            </p>
          )}
        </div>
        <div className="sm:text-right">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">Se cobra el</p>
          <p className="text-lg font-black text-primary-light">{dayLabel(current.end)}</p>
          <p className="text-[11px] text-white/50">{daysLeft === 0 ? '¡Hoy es día de pago!' : `Faltan ${daysLeft} ${daysLeft === 1 ? 'día' : 'días'}`}</p>
        </div>
      </div>
      <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gold-gradient transition-all" style={{ width: `${Math.round((elapsed / totalDays) * 100)}%` }} />
      </div>

      {history.length > 0 && (
        <div className="relative mt-4 border-t border-white/10 pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/50">Quincenas anteriores</p>
            {owed > 0 && <p className="text-xs font-bold text-primary-light">Por pagar: {formatPrice(owed)}</p>}
          </div>
          <ul className="mt-2 space-y-1.5">
            {history.map((h) => {
              const isPaid = paid.includes(h.key);
              return (
                <li key={h.key} className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-white/70">
                    {dayLabel(h.start)} – {dayLabel(h.end)} · {unit(h.units)} · <strong className="text-white">{formatPrice(h.units * config.amount)}</strong>
                  </span>
                  {h.units > 0 && (
                    <button
                      type="button"
                      disabled={!onTogglePaid || busy === h.key}
                      onClick={() => toggle(h.key, !isPaid)}
                      className={classNames(
                        'rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider transition-colors disabled:opacity-60',
                        isPaid ? 'bg-whatsapp/20 text-whatsapp' : 'bg-white/10 text-primary-light ring-1 ring-primary/40 hover:bg-primary hover:text-ink',
                      )}
                    >
                      {isPaid ? '✓ Pagada' : 'Marcar pagada'}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <p className="relative mt-3 text-[11px] text-white/40">
        {formatPrice(config.amount)} por {config.per === 'venta' ? 'cada venta' : 'cada unidad vendida'}
        {config.onlyMetaAds ? ' de las campañas de Meta Ads (pedidos con la marca 📣 Meta Ads)' : ''} · solo pedidos confirmados · los cancelados no
        cuentan
        {since ? ` · desde el ${new Date(since).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}
      </p>
    </div>
  );
}
