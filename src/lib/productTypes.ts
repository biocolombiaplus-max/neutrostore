import type { Product, ProductType } from './types';

// Respaldo si la configuración no trae tipos (no debería pasar).
const FALLBACK: ProductType = {
  value: 'sandalias',
  label: 'Sandalias',
  icon: '👡',
  sizeSystem: 'calzado',
  sizes: ['35', '36', '37', '38', '39', '40'],
  image: '',
  sub: '',
};

export const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Tipo de un producto: el que tiene guardado o, si no tiene (productos
// creados antes de existir los tipos), el primero de la lista.
export function productTypeOf(product: Pick<Product, 'category'>, types: ProductType[]): ProductType {
  return types.find((t) => t.value === product.category) ?? types[0] ?? FALLBACK;
}

export function isFootwear(type: ProductType): boolean {
  return type.sizeSystem === 'calzado';
}

export function productTypeValue(product: Pick<Product, 'category'>, types: ProductType[]): string {
  return productTypeOf(product, types).value;
}

// Orden de tallas: numéricas de menor a mayor y de ropa XS → XXXL.
const CLOTHING_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
export function sortSizeList(list: string[]): string[] {
  return [...list].sort((a, b) => {
    const na = Number(a);
    const nb = Number(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    const ia = CLOTHING_ORDER.indexOf(a.toUpperCase());
    const ib = CLOTHING_ORDER.indexOf(b.toUpperCase());
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b, 'es');
  });
}
