'use client';

import Link from 'next/link';
import { useSiteSettings } from '@/lib/settings-context';
import type { Product } from '@/lib/types';
import { classNames } from '@/lib/utils';
import SafeImage from '../SafeImage';
import ProductCard from '../ProductCard';

// Tarjetas grandes "Compra por categoría" con los tipos de producto de la
// tienda multimarca (Sandalias, Camisetas...). Se editan en Configuración →
// Tipos de producto.
export function ProductTypeTiles({ counts }: { counts: Record<string, number> }) {
  const { productTypes } = useSiteSettings();
  const types = productTypes.filter((t) => (counts[t.value] ?? 0) > 0);
  if (types.length < 2) return null;

  return (
    <section className="bg-white pt-12 sm:pt-16">
      <div className="container-page">
        <p className="section-eyebrow">Tienda multimarca</p>
        <h2 className="section-title mt-2">Compra por categoría</h2>
        <div className={classNames('mt-8 grid gap-3 sm:gap-5', types.length === 2 ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-3')}>
          {types.map((t) => (
            <Link
              key={t.value}
              href={`/catalogo?tipo=${encodeURIComponent(t.value)}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-[22px] bg-ink ring-1 ring-primary/20 sm:aspect-[16/11]"
            >
              {t.image && (
                <SafeImage
                  src={t.image}
                  alt={t.label}
                  fill
                  sizes="(max-width: 1024px) 50vw, 40vw"
                  className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <span className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-light backdrop-blur sm:left-5 sm:top-5">
                {counts[t.value]} {counts[t.value] === 1 ? 'modelo' : 'modelos'}
              </span>
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-7">
                <p className="text-2xl sm:text-3xl">{t.icon}</p>
                <h3 className="mt-1 font-heading text-2xl font-black uppercase text-white sm:text-5xl">{t.label}</h3>
                {t.sub && <p className="mt-1 hidden text-sm text-white/80 sm:block">{t.sub}</p>}
                <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-gold-gradient px-4 py-2 text-[10px] font-extrabold uppercase tracking-wider text-ink sm:text-xs">
                  Ver {t.label.toLowerCase()} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// Una vitrina por tipo de producto: sus modelos más vendidos y un enlace a
// todos, como las secciones de las grandes tiendas en línea.
export function ProductTypeRails({ rails }: { rails: Record<string, Product[]> }) {
  const { productTypes } = useSiteSettings();
  const types = productTypes.filter((t) => (rails[t.value]?.length ?? 0) > 0);
  if (types.length < 2) return null;

  return (
    <>
      {types.map((t, i) => (
        <section key={t.value} className={classNames('py-12 sm:py-16', i % 2 === 0 ? 'bg-cream-alt/50' : 'bg-white')}>
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="section-eyebrow">
                  {t.icon} {t.sub || 'Lo más pedido'}
                </p>
                <h2 className="section-title mt-2">{t.label}</h2>
              </div>
              <Link
                href={`/catalogo?tipo=${encodeURIComponent(t.value)}`}
                className="rounded-full border-2 border-ink px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-ink transition-colors hover:bg-ink hover:text-white"
              >
                Ver todo →
              </Link>
            </div>
            <div className="-mx-4 mt-7 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-4">
              {rails[t.value].map((p) => (
                <div key={p.id} className="w-[46%] shrink-0 snap-start sm:w-auto">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
