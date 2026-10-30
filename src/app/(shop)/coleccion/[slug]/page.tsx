import { redirect } from 'next/navigation';
import { getSiteSettingsServer } from '@/lib/settingsServer';
import { brandMatches } from '@/lib/brand';

// Link corto y fácil de compartir (Instagram, WhatsApp, anuncios):
// • /coleccion/verano-2026 → una colección propia de la tienda.
// • /coleccion/guess → si no es una colección, todos los modelos de esa marca.
export default async function ColeccionPage({ params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug).trim().toLowerCase();
  const settings = await getSiteSettingsServer();
  if (settings.storeCollections.some((c) => c.slug === slug)) redirect(`/catalogo?coleccion=${encodeURIComponent(slug)}`);

  const wanted = slug.replace(/[-_]+/g, ' ').trim();
  // Entre las marcas que coinciden ("On", "On Cloud"...) se usa la más corta,
  // que agrupa a todas.
  const matches = settings.brands.filter((b) => brandMatches(wanted, b)).sort((a, b) => a.length - b.length);
  const brand = matches[0] ?? wanted.replace(/\b\w/g, (c) => c.toUpperCase());
  redirect(`/catalogo?marca=${encodeURIComponent(brand)}`);
}
