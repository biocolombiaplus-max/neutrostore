// Wompi (pasarela de Bancolombia): datos que pueden estar en el navegador.
// Las llaves secretas (privada, integridad y eventos) viven SOLO en el
// servidor, en variables de entorno de Vercel (ver src/lib/wompiServer.ts).
import type { WompiStatus } from './types';

// La llave pública está hecha para mostrarse (va en el link de pago). La
// variable de entorno, si existe, tiene prioridad.
export const WOMPI_PUBLIC_KEY = (process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || 'pub_prod_oiyJUzKisvmwXI45nZB69f-QeyKvpnnCY').trim();

export const WOMPI_CHECKOUT_URL = 'https://checkout.wompi.co/p/';

// Llaves de pruebas (pub_test_...) usan el ambiente sandbox.
export function wompiApiBase(publicKey = WOMPI_PUBLIC_KEY): string {
  return publicKey.startsWith('pub_test') ? 'https://sandbox.wompi.co/v1' : 'https://production.wompi.co/v1';
}

// Cada intento de pago de un pedido tiene su propia referencia (Wompi no
// repite referencias): NS-20261114-1234-P1, -P2...
export const MAX_PAYMENT_ATTEMPTS = 5;
export function wompiReference(orderNumber: string, attempt: number): string {
  return `${orderNumber}-P${attempt}`;
}
export function orderNumberFromReference(reference: string): string {
  return reference.replace(/-P\d+$/, '');
}
export function attemptFromReference(reference: string): number {
  return Number(reference.match(/-P(\d+)$/)?.[1] ?? 1);
}

export const ORDER_NUMBER_RE = /^NS-\d{8}-\d{4}$/;

const METHOD_LABELS: Record<string, string> = {
  CARD: 'Tarjeta',
  PSE: 'PSE',
  NEQUI: 'Nequi',
  BANCOLOMBIA_TRANSFER: 'Botón Bancolombia',
  BANCOLOMBIA_QR: 'QR Bancolombia',
  BANCOLOMBIA_COLLECT: 'Corresponsal Bancolombia',
  BANCOLOMBIA_BNPL: 'Compra y Paga Después',
  DAVIPLATA: 'DaviPlata',
  PCOL: 'Puntos Colombia',
  SU_PLUS: 'SU+ Pay',
};

export function wompiMethodLabel(type?: string): string {
  if (!type) return 'Pago en línea';
  return METHOD_LABELS[type] ?? type.replace(/_/g, ' ').toLowerCase();
}

export const WOMPI_STATUS_LABELS: Record<WompiStatus, string> = {
  APPROVED: 'Aprobado',
  PENDING: 'En proceso',
  DECLINED: 'Rechazado',
  VOIDED: 'Anulado',
  ERROR: 'Con error',
};
