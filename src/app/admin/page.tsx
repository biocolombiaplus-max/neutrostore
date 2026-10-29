'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllProducts } from '@/lib/products';
import { getAllOrders } from '@/lib/orders';
import { getSiteSettings, updateSiteSettingsFields } from '@/lib/settings';
import { formatPrice } from '@/lib/utils';
import type { Order, Product, SiteSettings } from '@/lib/types';

// Pedidos que cuentan como venta (los pendientes aún no han pagado).
const SOLD = new Set(['confirmado', 'enviado', 'entregado']);

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [allOrders, setAllOrders] = useState<Order[] | null>(null);
  const [since, setSince] = useState<number | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    (async () => {
      const [p, o, s] = await Promise.all([
        getAllProducts().catch(() => [] as Product[]),
        getAllOrders().catch(() => [] as Order[]),
        getSiteSettings().catch(() => null),
      ]);
      setProducts(p);
      setAllOrders(o);
      setSince(s?.statsResetAt ?? 0);
      setSettings(s);
    })();
  }, []);

  // Solo cuentan los pedidos desde el inicio oficial (lo anterior fueron pruebas).
  const orders = allOrders && since !== null ? allOrders.filter((o) => o.createdAt >= since) : null;
  const live = orders?.filter((o) => o.status !== 'cancelado') ?? [];
  const sold = live.filter((o) => SOLD.has(o.status));
  const revenue = sold.reduce((sum, o) => sum + o.total, 0);
  const pendingRevenue = live.filter((o) => o.status === 'pendiente').reduce((sum, o) => sum + o.total, 0);
  const unitsSold = sold.reduce((sum, o) => sum + o.items.reduce((s, i) => s + (i.quantity || 1), 0), 0);

  const cards = [
    { label: 'Productos activos', value: products ? `${products.filter((p) => p.active).length}/${products.length}` : '—' },
    { label: 'Pedidos', value: orders ? live.length : '—', hint: orders ? `${sold.length} confirmados` : '' },
    { label: 'Pedidos pendientes', value: orders ? live.length - sold.length : '—', hint: orders && pendingRevenue ? `${formatPrice(pendingRevenue)} por cobrar` : '' },
    { label: 'Ventas confirmadas', value: orders ? formatPrice(revenue) : '—', hint: orders ? `${unitsSold} ${unitsSold === 1 ? 'unidad vendida' : 'unidades vendidas'}` : '' },
  ];

  async function resetStats() {
    if (!window.confirm('¿Reiniciar el panel en cero desde ahora?\n\nLos pedidos NO se borran: siguen en la sección Pedidos. Solo dejan de contar en estas cifras.')) return;
    setResetting(true);
    const now = Date.now();
    try {
      await updateSiteSettingsFields({ statsResetAt: now });
      setSince(now);
    } catch {
      alert('No se pudo reiniciar. Intenta de nuevo.');
    } finally {
      setResetting(false);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="mb-1 font-heading text-2xl font-bold text-ink">Panel de control</h1>
          <p className="text-sm text-muted">
            Resumen de tu tienda
            {!!since && <> · desde el {new Date(since).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}</>}
          </p>
        </div>
        <button
          type="button"
          onClick={resetStats}
          disabled={resetting || since === null}
          className="rounded-full bg-white px-4 py-2 text-xs font-bold text-muted ring-1 ring-border transition-colors hover:text-ink disabled:opacity-60"
        >
          {resetting ? 'Reiniciando...' : '↺ Reiniciar en cero'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-card bg-white p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{c.label}</p>
            <p className="mt-2 text-2xl font-bold text-ink">{c.value}</p>
            {c.hint && <p className="mt-1 text-xs text-muted">{c.hint}</p>}
          </div>
        ))}
      </div>

      {settings && products && <SetupChecklist settings={settings} productCount={products.length} />}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/productos/nuevo" className="btn-primary">
          + Agregar producto
        </Link>
        <Link href="/admin/pedidos" className="btn-secondary">
          Ver pedidos
        </Link>
      </div>
    </div>
  );
}

// Lista de "primeros pasos" para dejar la tienda lista para vender. Cada
// punto se marca solo cuando ya está hecho y desaparece la tarjeta al final.
function SetupChecklist({ settings, productCount }: { settings: SiteSettings; productCount: number }) {
  const sample = (n: string) => /^0*$/.test(n.replace(/\D/g, '')) || n.replace(/\D/g, '') === '3000000000';
  const items = [
    { done: !!settings.whatsappNumber.trim(), label: 'Pon el número de WhatsApp de la tienda', href: '/admin/configuracion#sec=General' },
    { done: settings.logoUrl !== '/logo.png', label: 'Sube tu logo oficial', href: '/admin/configuracion#sec=General' },
    {
      done: settings.payments.bankAccounts.length > 0 && settings.payments.bankAccounts.every((b) => !sample(b.number)),
      label: 'Cambia las cuentas de ejemplo por tus cuentas reales (Bancolombia, Nequi…)',
      href: '/admin/configuracion#sec=Formas%20de%20pago',
    },
    { done: !!settings.notificationEmail.trim(), label: 'Escribe el correo donde recibes los pedidos', href: '/admin/configuracion#sec=General' },
    {
      done: !!(settings.footer.instagram || settings.footer.facebook || settings.footer.tiktok || settings.footer.youtube),
      label: 'Agrega tus redes sociales y la dirección del mapa',
      href: '/admin/configuracion#sec=Footer',
    },
    { done: productCount > 0, label: 'Publica tu primer producto (los de ejemplo desaparecen solos)', href: '/admin/productos/nuevo' },
  ];
  const doneCount = items.filter((i) => i.done).length;
  if (doneCount === items.length) return null;

  return (
    <div className="mt-8 overflow-hidden rounded-card bg-[#0a0a0a] p-5 text-white shadow-soft ring-1 ring-primary/40 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-primary-light">Primeros pasos</p>
          <h2 className="mt-1 font-heading text-xl font-black uppercase">Deja tu tienda lista para vender</h2>
        </div>
        <p className="text-sm font-bold text-white/70">
          {doneCount} de {items.length} listos
        </p>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gold-gradient transition-all" style={{ width: `${(doneCount / items.length) * 100}%` }} />
      </div>
      <ul className="mt-5 space-y-2">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                item.done ? 'bg-white/[0.03] text-white/40 line-through' : 'bg-white/[0.07] hover:bg-white/[0.12]'
              }`}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                    item.done ? 'bg-whatsapp text-white' : 'border-2 border-primary/60 text-primary-light'
                  }`}
                >
                  {item.done ? '✓' : ''}
                </span>
                {item.label}
              </span>
              {!item.done && <span className="text-primary-light">→</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
