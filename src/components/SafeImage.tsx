'use client';

import Image, { type ImageProps } from 'next/image';
import { useEffect, useState } from 'react';

// next/image con respaldo: si una foto no carga (servidor ocupado, sin
// internet, la primera vez que se genera su versión optimizada...) se
// reintenta sola varias veces, esperando cada vez un poco más; el último
// intento pide la foto original sin optimizar. Solo si todo falla se muestra
// un fondo con el monograma dorado de la tienda en vez de un hueco.
const RETRIES = 4;
const DELAYS = [800, 2000, 4000, 7000];

// hideOnError: para fotos secundarias (la del mouse): si fallan no se muestra
// nada, así su respaldo no tapa la foto principal.
export default function SafeImage({ alt, className, hideOnError, ...props }: ImageProps & { hideOnError?: boolean }) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  // Si la foto cambia (otro color), se empieza de cero.
  useEffect(() => {
    setAttempt(0);
    setFailed(false);
  }, [props.src]);

  if (failed || !props.src) {
    if (hideOnError) return null;
    return (
      <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cream-alt to-gold-100">
        <span className="font-display text-4xl font-bold text-primary/50">NS</span>
      </span>
    );
  }

  return (
    <Image
      key={attempt}
      alt={alt}
      className={className}
      onError={() => {
        if (attempt < RETRIES) setTimeout(() => setAttempt((a) => a + 1), DELAYS[attempt] ?? 7000);
        else setFailed(true);
      }}
      {...props}
      // Último intento: la foto original, sin pasar por la optimización.
      {...(attempt === RETRIES ? { unoptimized: true } : {})}
    />
  );
}
