'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ADMIN_FLAG_KEY } from '@/lib/auth-flag';

// Accesos directos para editar la tienda mientras se navega. Solo aparece en
// el navegador donde la administradora inició sesión (marca en este equipo):
// no carga Firebase ni pesa nada para los clientes. Los enlaces abren el
// panel justo en la sección que se quiere cambiar.
const SECTIONS: { icon: string; label: string; section: string; home?: boolean }[] = [
  { icon: '🖼️', label: 'Logo, nombre y WhatsApp', section: 'General' },
  { icon: '✨', label: 'Portada (fotos y textos)', section: 'Inicio — Hero principal', home: true },
  { icon: '📣', label: 'Barra de anuncios', section: 'Barra de anuncios' },
  { icon: '🛍️', label: 'Tipos de producto', section: 'Tipos de producto', home: true },
  { icon: '🧩', label: 'Categorías de la portada', section: 'Inicio — Compra por categoría', home: true },
  { icon: '⭐', label: 'Marca estrella', section: '⭐ Marca estrella', home: true },
  { icon: '🏷️', label: 'Marcas', section: 'Marcas' },
  { icon: '🎨', label: 'Colores y tipografía', section: 'Colores de la marca' },
  { icon: '💬', label: 'Testimonios', section: 'Testimonios', home: true },
  { icon: '❓', label: 'Preguntas frecuentes', section: 'Preguntas frecuentes', home: true },
  { icon: '💳', label: 'Pagos y cuentas', section: 'Formas de pago' },
  { icon: '🚚', label: 'Envíos por departamento', section: 'Envíos' },
  { icon: '📍', label: 'Pie de página, redes y mapa', section: 'Footer' },
];

export default function AdminEditBar() {
  const pathname = usePathname() ?? '';
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      setIsAdmin(window.localStorage.getItem(ADMIN_FLAG_KEY) === '1');
    } catch {
      setIsAdmin(false);
    }
  }, []);

  if (!isAdmin) return null;

  const productSlug = pathname.startsWith('/producto/') ? pathname.split('/')[2] : '';
  const onHome = pathname === '/';
  const sections = onHome ? [...SECTIONS.filter((s) => s.home), ...SECTIONS.filter((s) => !s.home)] : SECTIONS;
  const editUrl = (section: string) => `/admin/configuracion#sec=${encodeURIComponent(section)}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-0 top-1/2 z-40 flex -translate-y-1/2 items-center gap-1.5 rounded-r-2xl border border-l-0 border-primary/60 bg-ink py-3 pl-2.5 pr-3 text-[11px] font-extrabold uppercase tracking-wider text-primary-light shadow-dark transition-all hover:pl-4 [writing-mode:vertical-rl]"
        aria-label="Editar la página"
      >
        ✏️ Editar
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex justify-start bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <aside
            className="flex h-full w-[86%] max-w-sm animate-slideUp flex-col overflow-y-auto bg-[#0b0b0b] p-5 text-white shadow-dark"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-primary-light">Modo administradora</p>
                <h2 className="mt-1 font-heading text-xl font-black uppercase">¿Qué quieres editar?</h2>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold" aria-label="Cerrar">
                ✕
              </button>
            </div>

            {productSlug && (
              <Link
                href={`/admin/productos?buscar=${encodeURIComponent(productSlug)}`}
                className="mt-5 flex items-center gap-3 rounded-2xl bg-gold-gradient px-4 py-3.5 text-sm font-extrabold text-ink"
              >
                👟 Editar este producto →
              </Link>
            )}

            <div className="mt-5 grid grid-cols-2 gap-2">
              <Link href="/admin/productos/nuevo" className="rounded-2xl bg-white/10 px-3 py-3 text-center text-xs font-extrabold hover:bg-white/15">
                ➕ Nuevo producto
              </Link>
              <Link href="/admin/pedidos" className="rounded-2xl bg-white/10 px-3 py-3 text-center text-xs font-extrabold hover:bg-white/15">
                📦 Pedidos
              </Link>
            </div>

            <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.25em] text-white/40">{onHome ? 'Secciones de esta página' : 'Secciones de la tienda'}</p>
            <ul className="mt-2 divide-y divide-white/10 rounded-2xl border border-white/10">
              {sections.map((s) => (
                <li key={s.section}>
                  <Link href={editUrl(s.section)} className="flex items-center justify-between gap-3 px-4 py-3 text-sm font-bold hover:bg-white/5">
                    <span>
                      <span className="mr-2">{s.icon}</span>
                      {s.label}
                    </span>
                    <span className="text-primary-light">→</span>
                  </Link>
                </li>
              ))}
            </ul>

            <Link href="/admin" className="mt-5 text-center text-xs font-bold text-white/50 underline">
              Ir al panel completo
            </Link>
          </aside>
        </div>
      )}
    </>
  );
}
