'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSiteSettings, updateSiteSettingsFields } from '@/lib/settings';
import { getAllProducts, updateProduct } from '@/lib/products';
import { uploadProductImage } from '@/lib/storage';
import { collectionHref, productsInCollection } from '@/lib/storeCollections';
import type { Product, StoreCollection } from '@/lib/types';
import { classNames, slugify } from '@/lib/utils';

const inputClass = 'w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none';

// Colecciones propias de la tienda: nombre, foto, descripción, si salen en
// la portada y qué productos tiene cada una (se agregan o quitan aquí mismo).
export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<StoreCollection[] | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [openPicker, setOpenPicker] = useState<string | null>(null);

  useEffect(() => {
    getSiteSettings()
      .then((s) => setCollections(s.storeCollections))
      .catch(() => setCollections([]));
    getAllProducts()
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  if (!collections) return <p className="text-muted">Cargando colecciones...</p>;

  function edit(i: number, patch: Partial<StoreCollection>) {
    setCollections((list) => (list ? list.map((c, j) => (j === i ? { ...c, ...patch } : c)) : list));
    setDirty(true);
  }

  function move(i: number, dir: -1 | 1) {
    setCollections((list) => {
      if (!list) return list;
      const j = i + dir;
      if (j < 0 || j >= list.length) return list;
      const next = [...list];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    setDirty(true);
  }

  function add() {
    setCollections((list) => [{ slug: '', name: '', description: '', image: '', showOnHome: true }, ...(list ?? [])]);
    setDirty(true);
  }

  async function remove(i: number) {
    const c = collections![i];
    if (!window.confirm(`¿Eliminar la colección "${c.name || 'sin nombre'}"? Los productos no se borran, solo dejan de estar en esta colección.`)) return;
    const next = collections!.filter((_, j) => j !== i);
    setCollections(next);
    await save(next);
    // Se quita la colección de sus productos.
    const affected = products.filter((p) => c.slug && p.collectionSlugs?.includes(c.slug));
    await Promise.all(affected.map((p) => updateProduct(p.id, { collectionSlugs: (p.collectionSlugs ?? []).filter((s) => s !== c.slug) }).catch(() => {})));
    setProducts((list) => list.map((p) => (affected.some((a) => a.id === p.id) ? { ...p, collectionSlugs: (p.collectionSlugs ?? []).filter((s) => s !== c.slug) } : p)));
  }

  async function save(list = collections) {
    if (!list) return;
    const clean = list
      .map((c) => ({ ...c, name: c.name.trim(), slug: c.slug.trim() || slugify(c.name), description: c.description.trim() }))
      .filter((c) => c.name && c.slug);
    const slugs = clean.map((c) => c.slug);
    if (new Set(slugs).size !== slugs.length) {
      alert('Hay dos colecciones con el mismo enlace. Cambia el nombre o el enlace de una de ellas.');
      return;
    }
    setSaving(true);
    try {
      await updateSiteSettingsFields({ storeCollections: clean });
      setCollections(clean);
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      alert('No se pudo guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleProduct(product: Product, slug: string) {
    const current = product.collectionSlugs ?? [];
    const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
    setProducts((list) => list.map((p) => (p.id === product.id ? { ...p, collectionSlugs: next } : p)));
    try {
      await updateProduct(product.id, { collectionSlugs: next });
    } catch {
      setProducts((list) => list.map((p) => (p.id === product.id ? { ...p, collectionSlugs: current } : p)));
      alert('No se pudo guardar el cambio del producto. Intenta de nuevo.');
    }
  }

  return (
    <div className="pb-28">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">Colecciones</h1>
          <p className="text-sm text-muted">Agrupa productos de cualquier tipo y marca: temporadas, lanzamientos, ocasiones…</p>
        </div>
        <button type="button" onClick={add} className="btn-primary">
          + Nueva colección
        </button>
      </div>

      {collections.length === 0 && (
        <p className="rounded-card bg-white p-6 text-center text-muted shadow-soft">Todavía no tienes colecciones. Crea la primera con el botón de arriba.</p>
      )}

      <div className="space-y-4">
        {collections.map((c, i) => {
          const inside = c.slug ? productsInCollection(products, c.slug) : [];
          return (
            <div key={i} className="overflow-hidden rounded-card bg-white shadow-soft">
              <div className="grid gap-5 p-5 sm:grid-cols-[180px_1fr] sm:p-6">
                <div>
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ink">
                    {c.image ? (
                      <Image src={c.image} alt={c.name} fill sizes="180px" className="object-cover" />
                    ) : (
                      <span className="flex h-full items-center justify-center text-4xl">🗂️</span>
                    )}
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-sm font-black uppercase text-white">
                      {c.name || 'Sin nombre'}
                    </span>
                  </div>
                  <ImageButton value={c.image} onChange={(url) => edit(i, { image: url })} />
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-cream-alt px-3 py-1 text-xs font-bold text-ink">
                      {inside.length} {inside.length === 1 ? 'producto' : 'productos'}
                    </span>
                    <div className="flex items-center gap-1 text-sm">
                      <button type="button" onClick={() => move(i, -1)} className="rounded-lg px-2 py-1 hover:bg-cream-alt" aria-label="Subir">
                        ↑
                      </button>
                      <button type="button" onClick={() => move(i, 1)} className="rounded-lg px-2 py-1 hover:bg-cream-alt" aria-label="Bajar">
                        ↓
                      </button>
                      <button type="button" onClick={() => remove(i)} className="rounded-lg px-2 py-1 text-urgent hover:bg-urgent/10" aria-label="Eliminar">
                        🗑️
                      </button>
                    </div>
                  </div>
                  <label className="block text-sm font-semibold text-ink">
                    Nombre
                    <input
                      value={c.name}
                      onChange={(e) => edit(i, { name: e.target.value, ...(c.slug && c.slug !== slugify(c.name) ? {} : { slug: slugify(e.target.value) }) })}
                      className={`${inputClass} mt-1`}
                      placeholder="Ej: Colección Verano 2026"
                    />
                  </label>
                  <label className="block text-sm font-semibold text-ink">
                    Descripción corta
                    <input
                      value={c.description}
                      onChange={(e) => edit(i, { description: e.target.value })}
                      className={`${inputClass} mt-1`}
                      placeholder="Ej: Sandalias y camisetas frescas para los días de sol"
                    />
                  </label>
                  <label className="block text-sm font-semibold text-ink">
                    Enlace
                    <div className="mt-1 flex items-center rounded-lg border border-border focus-within:border-primary">
                      <span className="pl-4 text-sm text-muted">/coleccion/</span>
                      <input
                        value={c.slug}
                        onChange={(e) => edit(i, { slug: slugify(e.target.value) })}
                        className="w-full bg-transparent px-1 py-2.5 text-sm focus:outline-none"
                      />
                    </div>
                  </label>
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <input type="checkbox" checked={c.showOnHome} onChange={(e) => edit(i, { showOnHome: e.target.checked })} />
                      Mostrar en la portada
                    </label>
                    {c.slug && !dirty && (
                      <Link href={collectionHref(c)} target="_blank" className="text-xs font-bold text-muted underline hover:text-ink">
                        Ver en la tienda ↗
                      </Link>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={!c.slug}
                    onClick={() => setOpenPicker((o) => (o === c.slug ? null : c.slug))}
                    className="btn-dark w-full py-2.5 text-sm disabled:opacity-50 sm:w-auto"
                  >
                    {openPicker === c.slug ? 'Listo' : '🗂️ Elegir productos de esta colección'}
                  </button>
                </div>
              </div>

              {openPicker === c.slug && (
                <div className="border-t border-border bg-cream-alt/40 p-4 sm:p-6">
                  {dirty && <p className="mb-3 text-xs font-semibold text-urgent">Guarda los cambios de arriba antes de elegir productos para una colección nueva.</p>}
                  {products.length === 0 ? (
                    <p className="text-sm text-muted">
                      Todavía no tienes productos.{' '}
                      <Link href="/admin/productos/nuevo" className="font-bold underline">
                        Agrega el primero
                      </Link>
                    </p>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {products.map((p) => {
                        const on = !!p.collectionSlugs?.includes(c.slug);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => toggleProduct(p, c.slug)}
                            className={classNames(
                              'flex items-center gap-3 rounded-xl bg-white p-2.5 text-left ring-2 transition-colors',
                              on ? 'ring-ink' : 'ring-transparent hover:ring-border',
                            )}
                          >
                            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-cream-alt">
                              {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="48px" className="object-cover" />}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-ink">{p.title}</span>
                              <span className="block truncate text-xs text-muted">{p.brand}</span>
                            </span>
                            <span
                              className={classNames(
                                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black',
                                on ? 'bg-ink text-white' : 'border-2 border-border',
                              )}
                            >
                              {on ? '✓' : ''}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur sm:pl-60">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <p className="hidden flex-1 text-xs text-muted sm:block">
            Los productos que eliges se guardan al instante. Nombre, foto, descripción y orden se guardan con el botón.
          </p>
          {saved && <span className="shrink-0 text-sm font-semibold text-whatsapp">✓ Guardado</span>}
          <button type="button" onClick={() => save()} disabled={saving || !dirty} className="btn-primary w-full disabled:opacity-50 sm:w-auto">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ImageButton({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      onChange(await uploadProductImage(file, 'colecciones', 'original'));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo subir la foto.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }
  return (
    <label className="mt-2 block cursor-pointer rounded-lg border border-border py-2 text-center text-xs font-semibold text-ink hover:border-primary">
      {uploading ? 'Subiendo...' : value ? 'Cambiar foto' : 'Subir foto'}
      <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
    </label>
  );
}
