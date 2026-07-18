'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useCartStore } from '@/store';
import type { ProductCardData } from '@/lib/product-summary';

export function CartRelatedGrid({ items }: { items: ProductCardData[] }) {
  const addCartItem = useCartStore((s) => s.addCartItem);
  const [addingSlugs, setAddingSlugs] = useState<ReadonlySet<string>>(() => new Set());

  const handleAddToCart = async (product: ProductCardData) => {
    const variant = product.sizes.find((size) => size.inStock);
    if (!variant?.variantId) return;

    setAddingSlugs((current) => new Set(current).add(product.slug));
    try {
      await addCartItem({ productVariantId: variant.variantId });
    } catch {
      /* store sets error */
    } finally {
      setAddingSlugs((current) => {
        const next = new Set(current);
        next.delete(product.slug);
        return next;
      });
    }
  };

  if (items.length === 0) return null;

  return (
    <section className="mt-14">
      <h2 className="font-display font-bold text-[22px] sm:text-[30px] tracking-tight">Добавить к заказу</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {items.map((p) => {
          const adding = addingSlugs.has(p.slug);
          return (
          <article
            key={p.slug}
            className="border border-line rounded-[18px] bg-surface p-2.5 transition-all hover:border-ink/20 hover:-translate-y-[3px] hover:shadow-[0_16px_36px_hsl(220_12%_10%_/_0.07)]"
          >
            {/* Media */}
            <div className="relative aspect-[1/1.04] rounded-[13px] overflow-hidden bg-surface-soft">
              {p.imageUrl && (
                <Link href={`/product/${p.slug}`} className="absolute inset-0">
                  <Image
                    src={p.imageUrl}
                    alt={p.imageAlt}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-400 hover:scale-105"
                  />
                </Link>
              )}
            </div>
            {/* Body */}
            <div className="flex items-center justify-between gap-2.5 pt-3 pb-1 px-1.5">
              <div className="min-w-0">
                <h3 className="font-display font-bold text-[14px] tracking-tight truncate">{p.name}</h3>
                <span className="text-accent font-bold text-[13px] tnum">{p.minPrice.toLocaleString('ru-RU')} ₽</span>
              </div>
              <button
                type="button"
                aria-label={adding ? 'Добавляем в корзину' : `Добавить ${p.name}`}
                aria-busy={adding || undefined}
                disabled={adding}
                onClick={() => handleAddToCart(p)}
                className="w-[34px] h-[34px] shrink-0 grid place-items-center rounded-full border border-line bg-surface text-ink transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? <Loader2 className="h-4 w-4 animate-spin" role="status" aria-label="Добавляем в корзину" /> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>}
              </button>
            </div>
          </article>
          );
        })}
      </div>
    </section>
  );
}
