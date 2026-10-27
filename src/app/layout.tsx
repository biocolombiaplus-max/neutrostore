import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || 'Neutro Store';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://neutrostore.vercel.app';
const TITLE = `${STORE_NAME} | Sandalias para mujer en Colombia`;
const DESCRIPTION =
  'Sandalias para mujer: plataformas, slides y diseños con tachas doradas. Envío a toda Colombia y pago contra entrega: adelantas solo el envío y el resto al recibir.';

// Imagen que aparece al compartir el link (WhatsApp, Facebook, Instagram,
// iMessage...): 1200×630, fondo negro con el logo dorado. Se regenera con
// scripts/og-image.py si cambia la marca.
const OG_IMAGE = {
  url: '/og-image.jpg',
  width: 1200,
  height: 630,
  type: 'image/jpeg',
  alt: `${STORE_NAME} — Sandalias para mujer en Colombia`,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s — ${STORE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: ['sandalias mujer Colombia', 'sandalias plataforma', 'sandalias Guess Colombia', 'sandalias con tachas', 'slides mujer', 'sandalias Bogotá', 'sandalias Medellín', 'pago contra entrega'],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: STORE_NAME,
    locale: 'es_EC',
    type: 'website',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: STORE_NAME,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0E0E0E',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-body">{children}</body>
    </html>
  );
}
