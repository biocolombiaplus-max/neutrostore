import type { Product, SiteSettings } from './types';
import { codUnitPrice } from './shipping';

// Precios reales del catálogo para explicar las formas de pago con números
// verdaderos (no un "precio general" que puede confundir): desde cuánto
// cuestan los productos y un ejemplo con el más económico.
export interface PriceSummary {
  min: number;
  max: number;
  example: { title: string; price: number; codPrice: number } | null;
}

export function priceSummary(products: Pick<Product, 'title' | 'price' | 'codPrice'>[], settings: SiteSettings): PriceSummary {
  const priced = products.filter((p) => p.price > 0);
  if (priced.length === 0) return { min: 0, max: 0, example: null };
  const cheapest = priced.reduce((a, b) => (b.price < a.price ? b : a));
  return {
    min: cheapest.price,
    max: Math.max(...priced.map((p) => p.price)),
    example: { title: cheapest.title.trim(), price: cheapest.price, codPrice: codUnitPrice(cheapest, settings) },
  };
}
