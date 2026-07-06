'use client';

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toggleWishlist } from '@/app/actions/wishlist';
import { useWishlistStore } from '@/store';
import { cn } from '@/lib/utils';

type Props = {
  productId: string;
  initialActive: boolean;
  variant?: 'card' | 'pdp';
};

export function WishlistHeart({ productId, initialActive, variant = 'card' }: Props) {
  const router = useRouter();
  const increment = useWishlistStore((s) => s.increment);
  const decrement = useWishlistStore((s) => s.decrement);
  const fetchCount = useWishlistStore((s) => s.fetchCount);
  const [active, setActive] = useState(initialActive);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onClick = () => {
    if (pending) return;
    const next = !active;
    setActive(next); // оптимистично
    if (next) increment(); else decrement(); // бейдж обновляем мгновенно
    setError(null);
    startTransition(async () => {
      try {
        const res = await toggleWishlist({ productId });
        if (!res.ok) {
          setActive(!next); // откат
          if (next) decrement(); else increment(); // откат бейджа
          setError('Не удалось обновить избранное');
          return;
        }
        setActive(res.active);
        fetchCount(); // сверяем с авторитетным счётчиком сервера
        router.refresh(); // обновить список на /wishlist
      } catch {
        setActive(!next); // откат при сбое экшена (сеть/сервер)
        if (next) decrement(); else increment(); // откат бейджа
        setError('Не удалось обновить избранное');
      }
    });
  };

  const label = active ? 'Убрать из избранного' : 'В избранное';

  if (variant === 'pdp') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        aria-label={label}
        className="btn btn-secondary btn-md inline-flex items-center gap-2"
      >
        <Heart className={cn('w-5 h-5', active && 'fill-current text-[#e23b4e]')} aria-hidden />
        <span>{active ? 'В избранном' : 'В избранное'}</span>
        <span className="sr-only" role="status" aria-live="polite">{error ?? ''}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className="w-[34px] h-[34px] rounded-full border border-line bg-surface text-ink grid place-items-center hover:border-ink transition-colors"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.9" aria-hidden="true" className={active ? 'text-[#e23b4e]' : ''}>
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>
      </svg>
      <span className="sr-only" role="status" aria-live="polite">{error ?? ''}</span>
    </button>
  );
}
