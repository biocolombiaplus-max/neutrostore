import type { Product, StoreCollection } from './types';

// Productos de una colección propia de la tienda.
export function productsInCollection<T extends Pick<Product, 'collectionSlugs'>>(products: T[], slug: string): T[] {
  return products.filter((p) => p.collectionSlugs?.includes(slug));
}

export function collectionHref(c: Pick<StoreCollection, 'slug'>): string {
  return `/coleccion/${encodeURIComponent(c.slug)}`;
}
