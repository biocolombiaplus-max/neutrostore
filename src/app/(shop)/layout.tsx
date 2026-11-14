import type { Metadata } from 'next';
import SiteChrome from '@/components/SiteChrome';
import { getSiteSettingsServer } from '@/lib/settingsServer';
import { googleFontsHref } from '@/lib/fonts';
import { isWompiReady } from '@/lib/wompiServer';

// Las páginas de la tienda dependen de datos en vivo de Firestore (productos,
// carrito, pedidos), así que se renderizan siempre en el momento de la
// solicitud en lugar de generarse como HTML estático en el build.
export const dynamic = 'force-dynamic';

// Verificación del dominio en Meta (se pega el código en el panel).
export async function generateMetadata(): Promise<Metadata> {
  const { metaDomainVerification } = await getSiteSettingsServer();
  return metaDomainVerification ? { other: { 'facebook-domain-verification': metaDomainVerification } } : {};
}

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const saved = await getSiteSettingsServer();
  // Pago en línea (Wompi): solo si está configurado en el servidor y activo
  // en el panel.
  const settings = {
    ...saved,
    payments: { ...saved.payments, onlineReady: isWompiReady() && saved.payments.onlineEnabled !== false },
  };

  return (
    <>
      {/* El logo, la foto del hero y la tipografía ya llegan resueltos en
          este mismo HTML — así el navegador empieza a descargarlos de una
          vez, sin esperar a un viaje extra a la base de datos desde el
          cliente antes de saber qué imagen mostrar. */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={googleFontsHref([settings.fonts.headingFont, settings.fonts.bodyFont, 'Playfair Display'])} />
      <SiteChrome initialSettings={settings}>{children}</SiteChrome>
    </>
  );
}
