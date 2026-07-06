import Link from 'next/link';
import { cookies } from 'next/headers';
import { auth, signOut } from '@/auth';
import { cartCookieName } from '@/lib/cart-cookie';
import { wishlistCookieName } from '@/lib/wishlist-cookie';
import { LogoutButton } from './logout-button';

// Server-компонент: читает сессию (JWT, без БД-I/O) и показывает вход или профиль+выход.
// Гость → иконка-ссылка на /login; залогинен → профиль + кнопка выхода (signOut server action).
export async function AuthNav() {
  const session = await auth();

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="w-[34px] h-[34px] grid place-items-center rounded-full border border-line/72 bg-surface shadow-sm hover:border-ink/35 transition-colors"
        aria-label="Войти"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="8.25"/>
          <circle cx="12" cy="10.35" r="2.35"/>
          <path d="M7.95 16.35a5 5 0 0 1 8.1 0"/>
        </svg>
      </Link>
    );
  }

  return (
    <div className="flex items-center">
      <Link
        href="/profile"
        className="w-[34px] h-[34px] grid place-items-center rounded-full border border-line/72 bg-surface shadow-sm hover:border-ink/35 transition-colors"
        aria-label="Профиль"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="8.25"/>
          <circle cx="12" cy="10.35" r="2.35"/>
          <path d="M7.95 16.35a5 5 0 0 1 8.1 0"/>
        </svg>
      </Link>
      <form
        action={async () => {
          'use server';
          // Чистим гостевые токены корзины/избранного: иначе следующий гость/юзер на этом
          // браузере увидит корзину/избранное предыдущего по несброшенной cookie (#leak).
          // ВАЖНО: cookies/имена импортированы статически. Динамический `await import()` здесь
          // терял request-scope → `cookies()` бросал "called outside a request scope" и логаут падал.
          const store = await cookies();
          store.delete(cartCookieName);
          store.delete(wishlistCookieName);
          await signOut({ redirectTo: '/' });
        }}
      >
        <LogoutButton />
      </form>
    </div>
  );
}
