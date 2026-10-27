import type { Metadata } from 'next';
import CatalogView from './CatalogView';
import { getActiveProductsServer } from '@/lib/productsServer';
import { slimProduct } from '@/lib/productMap';
import { getSiteSettingsServer } from '@/lib/settingsServer';

export async function generateMetadata({ searchParams }: { searchParams: { marca?: string; genero?: string; tipo?: string } }): Promise<Metadata> {
  const { productTypes } = await getSiteSettingsServer();
  const brand = searchParams.marca;
  const type = productTypes.find((t) => t.value === searchParams.tipo);
  const gender = searchParams.genero === 'hombre' ? 'hombre' : searchParams.genero === 'mujer' ? 'mujer' : '';
  const what = type ? type.label : 'Sandalias y camisetas';
  const title = `${what}${brand ? ` ${brand}` : ''}${gender ? ` para ${gender}` : ''} en Colombia`;
  const description = `${brand ? `Todos los modelos ${brand}` : type ? `${type.label}: ${type.sub || 'las mejores marcas'}` : 'Tienda multimarca: sandalias, camisetas y más'}${
    gender ? ` para ${gender}` : ''
  }. Envío a toda Colombia con Servientrega y pago contra entrega.`;
  return {
    title,
    description,
    alternates: {
      canonical: brand
        ? `/catalogo?marca=${encodeURIComponent(brand)}`
        : type
          ? `/catalogo?tipo=${type.value}`
          : gender
            ? `/catalogo?genero=${gender}`
            : '/catalogo',
    },
    openGraph: { title, description },
  };
}

// Los zapatos llegan en el HTML: el catálogo aparece al instante y Google lo ve.
export default async function CatalogoPage() {
  const products = (await getActiveProductsServer()).map(slimProduct);
  return <CatalogView initialProducts={products} />;
}
