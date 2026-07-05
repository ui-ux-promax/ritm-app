'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useCartStore } from '@/store';

export function CartBadge() {
  const items = useCartStore((s) => s.items);
  const fetchCartItems = useCartStore((s) => s.fetchCartItems);
  useEffect(() => { fetchCartItems(); }, [fetchCartItems]);
  const count = items.length;
  return (
    <Link href="/cart" className="relative w-[34px] h-[34px] grid place-items-center rounded-full border border-line/72 bg-surface shadow-sm hover:border-ink/35 transition-colors" aria-label={count ? `Корзина, ${count} товара` : 'Корзина пуста'}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3.8 5.2h2.35l1.55 9.45a2 2 0 0 0 1.98 1.68h7.7a2 2 0 0 0 1.93-1.47l1.2-4.45H7.15"/>
        <circle cx="9.45" cy="19.25" r="1.05"/>
        <circle cx="17.25" cy="19.25" r="1.05"/>
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 grid place-items-center text-[10px] font-bold rounded-full bg-primary text-primary-foreground tnum">{count}</span>
      )}
    </Link>
  );
}
