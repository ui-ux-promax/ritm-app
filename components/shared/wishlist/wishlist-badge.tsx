'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useWishlistStore } from '@/store';

// Клиентский бейдж: счётчик живёт в zustand-сторе (паттерн CartBadge), мутации сердечка
// апдейтят стор инкрементом/декрементом — счётчик меняется мгновенно, без навигации.
// Рефетч на смену маршрута сверяет с авторитетным значением сервера (guest→login merge, cross-tab).
export function WishlistBadge() {
  const pathname = usePathname();
  const count = useWishlistStore((s) => s.count);
  const fetchCount = useWishlistStore((s) => s.fetchCount);

  useEffect(() => {
    fetchCount();
  }, [pathname, fetchCount]);

  return (
    <Link
      href="/wishlist"
      className="relative w-[34px] h-[34px] grid place-items-center rounded-full border border-line/72 bg-surface shadow-sm hover:border-ink/35 transition-colors"
      aria-label={count ? `Избранное, ${count}` : 'Избранное пусто'}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 grid place-items-center text-[10px] font-bold rounded-full bg-primary text-primary-foreground tnum">{count}</span>
      )}
    </Link>
  );
}
