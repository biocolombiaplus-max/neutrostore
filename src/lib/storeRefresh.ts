import { auth } from './firebase';

// Avisa al servidor que hubo cambios en el panel para que la tienda deje de
// mostrar la versión en caché. Se agrupan los guardados seguidos (subidas
// múltiples, autoguardado) en un solo aviso.
let timer: ReturnType<typeof setTimeout> | undefined;

export function refreshStore(): void {
  if (typeof window === 'undefined') return;
  clearTimeout(timer);
  timer = setTimeout(async () => {
    try {
      const token = await auth?.currentUser?.getIdToken();
      if (!token) return;
      await fetch('/api/revalidate', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    } catch {
      // Sin aviso: la tienda se refresca sola al vencer la caché.
    }
  }, 1500);
}

// Igual, pero al instante y diciendo si funcionó (botón "Actualizar la tienda").
export async function refreshStoreNow(): Promise<boolean> {
  try {
    const token = await auth?.currentUser?.getIdToken();
    if (!token) return false;
    const res = await fetch('/api/revalidate', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    return res.ok;
  } catch {
    return false;
  }
}
