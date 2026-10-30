'use client';

import Link from 'next/link';
import { useSiteSettings } from '@/lib/settings-context';
import { collectionHref } from '@/lib/storeCollections';
import { classNames } from '@/lib/utils';
import SafeImage from '../SafeImage';

// Sección "Colecciones" de la portada: las colecciones marcadas para el
// inicio que tienen productos (Admin → Colecciones).
export default function CollectionsShowcase({ counts }: { counts: Record<string, number> }) {
  const { storeCollections } = useSiteSettings();
  const list = storeCollections.filter((c) => c.showOnHome && (counts[c.slug] ?? 0) > 0);
  if (list.length === 0) return null;
  const [first, ...rest] = list;

  return (
    <section className="bg-[#070707] py-14 text-white sm:py-20">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.35em] text-primary-light">
              <span className="h-px w-10 bg-gold-gradient" />
              Colecciones
            </p>
            <h2 className="mt-3 font-heading text-3xl font-black uppercase sm:text-5xl">Elige tu colección</h2>
          </div>
          <Link
            href="/catalogo"
            className="rounded-full border-2 border-white/30 px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider transition-colors hover:border-primary hover:text-primary-light"
          >
            Ver todo el catálogo →
          </Link>
        </div>

        <div className={classNames('mt-8 grid gap-3 sm:gap-5', rest.length > 0 ? 'lg:grid-cols-2' : '')}>
          <CollectionCard c={first} count={counts[first.slug]} big />
          {rest.length > 0 && (
            <div className={classNames('grid gap-3 sm:gap-5', rest.length > 1 ? 'grid-cols-2' : '')}>
              {rest.slice(0, 4).map((c) => (
                <CollectionCard key={c.slug} c={c} count={counts[c.slug]} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function CollectionCard({
  c,
  count,
  big = false,
}: {
  c: { slug: string; name: string; description: string; image: string };
  count: number;
  big?: boolean;
}) {
  return (
    <Link
      href={collectionHref(c)}
      className={classNames(
        'group relative overflow-hidden rounded-[22px] bg-ink ring-1 ring-primary/25',
        big ? 'aspect-[4/5] sm:aspect-[16/12] lg:aspect-auto lg:min-h-[520px]' : 'aspect-[4/5] sm:aspect-square',
      )}
    >
      {c.image && (
        <SafeImage
          src={c.image}
          alt={c.name}
          fill
          sizes={big ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 1024px) 50vw, 25vw'}
          className="object-cover opacity-85 transition-transform duration-700 group-hover:scale-110"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <span className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-light backdrop-blur sm:left-5 sm:top-5">
        {count} {count === 1 ? 'producto' : 'productos'}
      </span>
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-7">
        <h3 className={classNames('font-heading font-black uppercase leading-[0.95]', big ? 'text-3xl sm:text-5xl' : 'text-lg sm:text-2xl')}>{c.name}</h3>
        {c.description && <p className={classNames('mt-2 text-white/75', big ? 'max-w-md text-sm' : 'hidden text-xs sm:block')}>{c.description}</p>}
        <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-gold-gradient px-4 py-2 text-[10px] font-extrabold uppercase tracking-wider text-ink sm:text-xs">
          Ver colección →
        </span>
      </div>
    </Link>
  );
}
