import { Suspense } from 'react';
import { LoginForm } from '@/components/shared/auth/login-form';
import { GoogleButton } from '@/components/shared/auth/google-button';

export const metadata = { title: 'Вход — Ritm' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
}) {
  return (
    <div className="w-full max-w-[420px]">
      {/* Head */}
      <div className="mb-6">
        <h1 className="font-display font-bold text-[26px] sm:text-[32px] leading-[1.05] tracking-tight">С возвращением</h1>
        <p className="mt-2 text-ink-muted text-sm">Войдите в аккаунт Ritm, чтобы продолжить покупки.</p>
      </div>

      {/* Social */}
      <div className="grid grid-cols-2 gap-2.5">
        <Suspense fallback={null}>
          <GoogleButton />
        </Suspense>
        <button type="button" className="inline-flex items-center justify-center gap-2 h-[46px] border border-line rounded-full bg-surface text-[13.5px] font-bold hover:border-ink/30 hover:bg-surface-soft/50 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.15-2.8.85-3.5.85-.7 0-1.85-.83-3-.8-1.55.02-2.98.9-3.78 2.29-1.6 2.8-.41 6.95 1.15 9.23.76 1.11 1.67 2.36 2.86 2.31 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.23-.02 2.01-1.13 2.76-2.25.87-1.29 1.23-2.54 1.25-2.6-.03-.01-2.4-.92-2.42-3.65ZM15.3 5.8c.63-.77 1.06-1.83.94-2.9-.91.04-2.01.61-2.66 1.37-.58.68-1.09 1.76-.95 2.8 1.02.08 2.05-.51 2.67-1.27Z"/></svg>
          Apple
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3.5 my-[22px] text-ink-muted text-xs font-semibold">
        <span className="h-px flex-1 bg-line" />
        или по e-mail
        <span className="h-px flex-1 bg-line" />
      </div>

      {/* Login form */}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>

      {/* Foot */}
      <p className="mt-[22px] text-center text-ink-muted text-[13.5px]">
        Ещё нет аккаунта?{' '}
        <a href="/register" className="text-ink font-bold underline underline-offset-2">Зарегистрироваться</a>
      </p>
    </div>
  );
}