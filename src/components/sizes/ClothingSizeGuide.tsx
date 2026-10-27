'use client';

import { classNames } from '@/lib/utils';

// Medidas de referencia de camisetas (prenda plana, en centímetros).
const ROWS = [
  { size: 'XS', chest: 46, length: 66 },
  { size: 'S', chest: 49, length: 69 },
  { size: 'M', chest: 52, length: 72 },
  { size: 'L', chest: 55, length: 74 },
  { size: 'XL', chest: 58, length: 76 },
  { size: 'XXL', chest: 61, length: 78 },
];

export default function ClothingSizeGuide({ availableSizes, onPickSize }: { availableSizes?: string[]; onPickSize?: (size: string) => void }) {
  const available = (s: string) => !availableSizes || availableSizes.some((a) => a.toUpperCase() === s);
  return (
    <div>
      <div className="rounded-2xl bg-cream-alt/70 p-4 text-sm leading-relaxed text-ink">
        <p className="font-extrabold">📏 Cómo medir</p>
        <p className="mt-1 text-muted">
          Toma una camiseta que te quede bien, ponla plana sobre una mesa y mide: <strong className="text-ink">pecho</strong> de axila a axila
          y <strong className="text-ink">largo</strong> desde el hombro hasta el borde inferior. Compara con la tabla.
        </p>
      </div>
      <div className="mt-4 overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-center text-sm">
          <thead className="bg-ink text-white">
            <tr>
              <th className="px-3 py-3 font-extrabold text-primary-light">Talla</th>
              <th className="px-3 py-3 font-extrabold">Pecho (cm)</th>
              <th className="px-3 py-3 font-extrabold">Largo (cm)</th>
              {onPickSize && <th className="px-3 py-3" />}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.size} className={classNames('border-t border-border', !available(r.size) && 'text-muted/60')}>
                <td className="px-3 py-3 text-base font-black text-ink">{r.size}</td>
                <td className="px-3 py-3">{r.chest}</td>
                <td className="px-3 py-3">{r.length}</td>
                {onPickSize && (
                  <td className="px-3 py-2">
                    {available(r.size) ? (
                      <button type="button" onClick={() => onPickSize(r.size)} className="rounded-full bg-ink px-3 py-1.5 text-[11px] font-extrabold text-white">
                        Elegir
                      </button>
                    ) : (
                      <span className="text-[11px]">Agotada</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted">
        Medidas aproximadas (±2 cm). Si estás entre dos tallas, elige la mayor para un corte más holgado o escríbenos por WhatsApp y te asesoramos.
      </p>
    </div>
  );
}
