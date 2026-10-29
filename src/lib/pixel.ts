// Envío de eventos a Meta por DOS vías con el mismo identificador:
// 1) el Píxel (navegador) y 2) la API de conversiones (servidor, /api/meta-capi).
// Meta junta ambos (deduplicación) y así no se pierden las ventas de quien
// usa iPhone o bloqueadores. Nunca rompe la tienda si algo falla.
import { adAttribution, isStaffDevice, visitorContact, visitorId } from './visitor';

type FbqParams = Record<string, unknown>;
type Fbq = (command: 'track' | 'trackCustom', event: string, params?: FbqParams, options?: { eventID?: string }) => void;

function newEventId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

function cookie(name: string): string {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : '';
}

// Identificador del clic en el anuncio (fbclid) en el formato que pide Meta.
function clickId(): string {
  const fromCookie = cookie('_fbc');
  if (fromCookie) return fromCookie;
  try {
    const fbclid = new URLSearchParams(window.location.search).get('fbclid');
    if (fbclid) {
      const value = `fb.1.${Date.now()}.${fbclid}`;
      localStorage.setItem('bs-fbc', value);
      return value;
    }
    return localStorage.getItem('bs-fbc') || '';
  } catch {
    return '';
  }
}

function sendToServer(event: string, params: FbqParams | undefined, eventId: string) {
  try {
    const { name, phone } = visitorContact();
    const body = JSON.stringify({
      event_name: event,
      event_id: eventId,
      event_source_url: window.location.href.split('#')[0],
      custom_data: params ?? {},
      user_data: { fbp: cookie('_fbp'), fbc: clickId(), external_id: visitorId(), phone, name },
    });
    fetch('/api/meta-capi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
  } catch {
    // nada
  }
}

// Datos para atribuir a Meta una venta que se cierra después (por WhatsApp).
// También guarda de dónde llegó el cliente y si vino de una campaña de Meta
// Ads (para la comisión de la agencia).
export function adTracking(): { vid: string; fbp: string; fbc: string; ua: string; source: string; campaign: string; metaAd: boolean } {
  if (typeof window === 'undefined') return { vid: '', fbp: '', fbc: '', ua: '', source: '', campaign: '', metaAd: false };
  return { vid: visitorId(), fbp: cookie('_fbp'), fbc: clickId(), ua: navigator.userAgent.slice(0, 300), ...adAttribution() };
}

export function trackPixel(event: string, params?: FbqParams, eventID?: string): void {
  if (typeof window === 'undefined' || isStaffDevice()) return;
  const id = eventID || newEventId();
  sendToServer(event, params, id);

  const w = window as unknown as { fbq?: Fbq; __bsPixelQueue?: unknown[][] };
  const fbq = w.fbq;
  if (typeof fbq !== 'function') {
    // El píxel aún no cargó: se guarda y se envía apenas cargue.
    w.__bsPixelQueue = (w.__bsPixelQueue ?? []).slice(-30);
    w.__bsPixelQueue.push(['track', event, params, { eventID: id }]);
    return;
  }
  try {
    fbq('track', event, params, { eventID: id });
  } catch {
    // Nada: el seguimiento nunca debe afectar la compra.
  }
}
