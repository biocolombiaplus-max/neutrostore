'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { isFirebaseReady, loginAdminWithPassword, loginErrorMessage } from '@/lib/auth';
import { useSiteSettings } from '@/lib/settings-context';

// Acceso al panel solo con la contraseña (el correo de la cuenta de
// administrador es fijo, ver ADMIN_EMAIL en src/lib/auth-flag.ts). La primera
// vez, la contraseña inicial (123456) crea la cuenta sola.
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { storeName, logoUrl } = useSiteSettings();
  const inputRef = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [error, setError] = useState(
    searchParams.get('error') === 'no-autorizado' ? 'Esta cuenta no tiene permisos de administrador (ver README, paso 5).' : '',
  );
  const next = searchParams.get('next');

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setError('');
    setLoading(true);
    try {
      await loginAdminWithPassword(password);
      router.push(next && next.startsWith('/admin') ? next : '/admin');
    } catch (err) {
      setError(loginErrorMessage(err));
      setLoading(false);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      inputRef.current?.select();
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070707] px-4 py-10">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(184,146,58,0.28),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <form
        onSubmit={handleSubmit}
        className={`relative w-full max-w-[400px] animate-slideUp overflow-hidden rounded-[28px] border border-primary/30 bg-gradient-to-b from-[#151515] to-[#0b0b0b] p-8 text-white shadow-dark sm:p-10 ${
          shake ? 'animate-attention' : ''
        }`}
      >
        <span className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary-light to-transparent" />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl || '/logo.png'} alt={storeName} className="mx-auto h-20 w-auto object-contain" />

        <p className="mt-6 text-center text-[10px] font-extrabold uppercase tracking-[0.35em] text-primary-light">Acceso privado</p>
        <h1 className="mt-2 text-center font-heading text-2xl font-black uppercase tracking-wide">Panel de {storeName}</h1>
        <p className="mt-2 text-center text-sm text-white/55">Escribe tu contraseña para editar la tienda</p>

        <div className="relative mt-7">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg" aria-hidden>
            🔒
          </span>
          <input
            ref={inputRef}
            required
            type={show ? 'text' : 'password'}
            inputMode={show ? 'text' : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="Contraseña"
            aria-label="Contraseña"
            className="w-full rounded-2xl border border-white/15 bg-white/[0.06] py-4 pl-12 pr-20 text-lg font-bold tracking-[0.2em] text-white placeholder:text-sm placeholder:font-semibold placeholder:tracking-normal placeholder:text-white/35 focus:border-primary focus:bg-white/[0.09] focus:outline-none focus:ring-4 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-primary-light hover:bg-white/10"
          >
            {show ? 'Ocultar' : 'Ver'}
          </button>
        </div>

        {error && <p className="mt-3 rounded-xl bg-urgent/15 px-4 py-2.5 text-center text-sm font-semibold text-[#ff8a7a]">{error}</p>}
        {!isFirebaseReady() && !error && (
          <p className="mt-3 rounded-xl bg-white/5 px-4 py-2.5 text-center text-xs text-white/60">
            El panel aún no está conectado a Firebase. Configúralo en Vercel para poder entrar (ver README).
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="btn-primary btn-shine mt-5 w-full py-4 text-base disabled:opacity-50"
        >
          {loading ? 'Entrando…' : 'Entrar al panel →'}
        </button>

        <Link href="/" className="mt-6 block text-center text-xs font-bold text-white/45 transition-colors hover:text-primary-light">
          ← Volver a la tienda
        </Link>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
