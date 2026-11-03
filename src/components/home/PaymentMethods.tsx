'use client';

import Link from 'next/link';
import { useSiteSettings } from '@/lib/settings-context';
import type { PriceSummary } from '@/lib/priceSummary';
import { formatPrice } from '@/lib/utils';
import PaymentLogos, { CourierLogo } from '@/components/brand/PaymentLogos';

// Explica las dos formas de pago con los precios REALES del catálogo (desde
// cuánto y un ejemplo con un producto de verdad) — es lo que más dudas genera
// antes de comprar en línea en Colombia, así que va bien visible y sin letra
// pequeña.
export default function PaymentMethods({ prices }: { prices: PriceSummary }) {
  const { payments, shipping } = useSiteSettings();
  const banks = Array.from(new Set(payments.bankAccounts.map((b) => b.bank).filter(Boolean)));
  const shippingCost = shipping.defaultRate;
  const ex = prices.example;
  const range = prices.min ? (prices.min === prices.max ? formatPrice(prices.min) : `${formatPrice(prices.min)} a ${formatPrice(prices.max)}`) : '';

  return (
    <section id="formas-de-pago" className="scroll-mt-24 bg-ink py-16 text-white sm:py-24">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-primary-light">Formas de pago</p>
          <h2 className="mt-2 font-heading text-3xl font-black uppercase sm:text-5xl">
            Paga como <span className="text-gold-gradient">te quede mejor</span>
          </h2>
          <p className="mt-4 text-sm text-white/70 sm:text-base">
            Pagas el precio de tu producto + el envío a toda Colombia. Tú eliges cuándo: todo ya, o el envío hoy y el resto al recibir.
          </p>
          {range && (
            <p className="mx-auto mt-5 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-primary/40 bg-white/[0.04] px-5 py-2 text-xs font-bold sm:text-sm">
              <span className="text-white/60">Precios del catálogo</span>
              <span className="text-primary-light">{range}</span>
              <span className="text-white/30">·</span>
              <span className="text-white/60">Envío</span>
              <span className="text-primary-light">{formatPrice(shippingCost)}</span>
            </p>
          )}
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-2">
          {/* Transferencia */}
          <div className="relative flex flex-col overflow-hidden rounded-3xl border border-primary/50 bg-gradient-to-br from-white/10 to-white/[0.02] p-7 sm:p-9">
            <span className="absolute right-5 top-5 rounded-full bg-gold-gradient px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-ink">
              Despacho inmediato
            </span>
            <span className="text-4xl">🏦</span>
            <h3 className="mt-4 text-2xl font-black uppercase">Transferencia o Nequi</h3>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-primary-light">Pagas todo en un solo pago</p>
            <p className="mt-3 text-sm leading-relaxed text-white/75">
              Transfiere desde la app de tu banco o Nequi, o deposita en un Corresponsal Bancolombia. Nos mandas la foto del comprobante
              por WhatsApp y despachamos ese mismo día.
            </p>

            {ex && (
              <div className="mt-6 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/50">Ejemplo con {ex.title}</p>
                <div className="mt-3 space-y-1.5 text-sm">
                  <p className="flex justify-between"><span className="text-white/70">Producto</span><span className="font-bold">{formatPrice(ex.price)}</span></p>
                  <p className="flex justify-between"><span className="text-white/70">Envío a toda Colombia</span><span className="font-bold">{formatPrice(shippingCost)}</span></p>
                  <p className="flex justify-between border-t border-white/15 pt-2 text-base">
                    <span className="font-extrabold">Pagas hoy</span>
                    <span className="font-black text-primary-light">{formatPrice(ex.price + shippingCost)}</span>
                  </p>
                </div>
              </div>
            )}

            <ul className="mt-5 space-y-2 text-sm text-white/85">
              <li>✅ Despacho el mismo día con Servientrega</li>
              <li>✅ Número de guía por WhatsApp</li>
            </ul>
            {banks.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {banks.map((b) => (
                  <span key={b} className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold ring-1 ring-white/15">
                    {b}
                  </span>
                ))}
              </div>
            )}
            <div className="min-h-8 flex-1" />
            <Link
              href="/catalogo"
              className="group btn-primary btn-shine w-full justify-between gap-3 rounded-2xl px-5 py-4 text-left normal-case tracking-normal"
            >
              <span className="flex flex-col">
                <span className="text-[15px] font-black uppercase tracking-wide">Elegir y pagar ya</span>
                <span className="text-[11px] font-bold opacity-75">Transferencia o Nequi · despacho hoy</span>
              </span>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-lg text-primary-light transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>

          {/* Contra entrega */}
          {payments.codEnabled && (
            <div className="relative flex flex-col overflow-hidden rounded-3xl bg-gold-gradient p-7 text-ink sm:p-9">
              <span className="absolute right-5 top-5 rounded-full bg-ink px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-primary-light">
                Más confianza
              </span>
              <span className="text-4xl">💵</span>
              <h3 className="mt-4 text-2xl font-black uppercase">Pago contra entrega</h3>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-ink/70">El envío hoy · tu producto al recibir</p>
              <p className="mt-3 text-sm font-medium leading-relaxed text-ink/80">
                Hoy pagas solo el envío para garantizar tu pedido. <strong>El valor de tu producto lo pagas en efectivo cuando lo recibes</strong>{' '}
                en tu casa.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-2xl bg-ink/90 p-4 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary-light">Hoy pagas</p>
                  <p className="mt-1 text-2xl font-black sm:text-3xl">{formatPrice(payments.codAdvance)}</p>
                  <p className="text-[11px] text-white/70">el envío</p>
                </div>
                <div className="rounded-2xl bg-white/70 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink/70">Al recibir pagas</p>
                  <p className="mt-1 text-2xl font-black sm:text-3xl">{ex ? formatPrice(ex.codPrice) : 'El producto'}</p>
                  <p className="text-[11px] text-ink/70">{ex ? `ej: ${ex.title}` : 'en efectivo'}</p>
                </div>
              </div>
              {ex && (
                <p className="mt-3 text-center text-xs font-semibold text-ink/75">
                  Total {formatPrice(payments.codAdvance + ex.codPrice)} · el mismo precio que ves en cada producto
                </p>
              )}
              <div className="min-h-8 flex-1" />
              <Link
                href="/catalogo"
                className="group flex w-full items-center justify-between gap-3 rounded-2xl bg-ink px-5 py-4 text-white shadow-dark transition-transform hover:-translate-y-0.5"
              >
                <span className="flex flex-col">
                  <span className="text-[15px] font-black uppercase tracking-wide">Elegir y pagar al recibir</span>
                  <span className="text-[11px] font-bold text-primary-light">Confirmas por WhatsApp · pagas en efectivo</span>
                </span>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-gradient text-lg text-ink transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          )}
        </div>

        <div className="mx-auto mt-8 flex max-w-5xl flex-col items-center gap-6 rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-6 sm:flex-row sm:justify-between sm:px-8">
          <div className="text-center sm:text-left">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/50">Paga desde tu banco o app favorita</p>
            <PaymentLogos className="mt-3 justify-center sm:justify-start" />
          </div>
          <div className="shrink-0 text-center sm:text-right">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/50">Enviamos con</p>
            <CourierLogo className="mt-3" />
          </div>
        </div>
      </div>
    </section>
  );
}
