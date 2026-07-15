'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Badge } from '@/components/ui';
import { useCartStore } from '@/store';
import { WishlistHeart } from '@/components/shared/wishlist/wishlist-heart';
import type { ProductCardData, CardColorway, CardSize } from '@/lib/product-summary';

const BEIGE_BLUR =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='8'%20height='8'%3E%3Crect%20width='8'%20height='8'%20fill='%23f1ece1'/%3E%3C/svg%3E";

// Color name → HSL for swatch background
const COLOR_MAP: Record<string, string> = {
  'Черный': 'hsl(220 9% 7%)',
  'Молочный': 'hsl(42 18% 88%)',
  'Шалфей': 'hsl(151 28% 30%)',
  'Хаки': 'hsl(55 15% 56%)',
  'Розовый': 'hsl(345 42% 82%)',
  'Светло-серый': 'hsl(0 0% 72%)',
  'Серый': 'hsl(220 6% 62%)',
};

function colorToHsl(name: string): string {
  return COLOR_MAP[name] ?? 'hsl(0 0% 50%)';
}

export function CatalogProductCard({ data, wishlisted = false }: { data: ProductCardData; wishlisted?: boolean }) {
  const href = `/product/${data.slug}`;
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [added, setAdded] = useState(false);
  const addCartItem = useCartStore((s) => s.addCartItem);

  const handleAddToCart = async () => {
    if (selectedSize === null) return;
    const size = data.sizes[selectedSize];
    if (!size || !size.variantId) return;
    try {
      await addCartItem({ productVariantId: size.variantId });
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
    } catch {
      /* store sets error */
    }
  };

  return (
    <article className="flex flex-col border border-line bg-surface rounded-[24px] p-[18px] shadow-[0_18px_44px_hsl(220_12%_10%_/_0.04)] transition-transform duration-200 hover:-translate-y-[3px] hover:border-ink/22 hover:shadow-[0_18px_40px_hsl(220_12%_10%_/_0.07)]">
      {/* Media */}
      <div className="relative aspect-[1.08/1] overflow-hidden rounded-[18px] border border-line bg-surface-soft">
        {data.badges[0] && (
          <span className="absolute left-3 top-3 z-10">
            <Badge tone={data.badges[0].tone}>{data.badges[0].label}</Badge>
          </span>
        )}
        <Link href={href} aria-label={data.name} className="absolute inset-0">
          {data.imageUrl ? (
            <Image
              src={data.imageUrl}
              alt={data.imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              placeholder="blur"
              blurDataURL={BEIGE_BLUR}
              className={`object-cover transition-transform duration-500 group-hover:scale-[1.045] ${data.soldOut ? 'opacity-50 grayscale' : ''}`}
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-ink-muted text-xs">нет фото</div>
          )}
        </Link>
      </div>

      {/* Head: title + price */}
      <div className="flex items-baseline justify-between gap-3 pt-3.5">
        <h3 className="font-display font-bold text-[26px] leading-[0.95] tracking-tight">
          <Link href={href} className="hover:underline underline-offset-2">{data.name}</Link>
        </h3>
        <span className="text-accent font-bold text-[15px] whitespace-nowrap tnum">
          {data.minPrice.toLocaleString('ru-RU')} ₽
        </span>
      </div>

      {/* Color selection */}
      {data.colorways.length > 0 && (
        <div className="mt-auto pt-3.5 grid gap-2.5">
          <div className="flex items-center justify-between">
            <strong className="text-xs font-bold uppercase tracking-tight">Цвет</strong>
          </div>
          <div className="grid grid-cols-4 gap-3 items-end">
            {data.colorways.map((cw, i) => (
              <button
                key={cw.id}
                type="button"
                aria-label={cw.name}
                aria-pressed={selectedColor === i}
                onClick={() => setSelectedColor(i)}
                className={`relative h-6 border rounded-[5px] transition-colors ${selectedColor === i ? 'border-ink' : 'border-line hover:border-ink/30'}`}
                style={{ background: cw.swatchHex ?? 'hsl(0 0% 50%)' }}
              >
                {selectedColor === i && (
                  <span className="absolute left-0 right-0 -bottom-[7px] h-[3px] rounded-full bg-ink" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size selection */}
      {data.sizes.length > 0 && (
        <div className="pt-3.5 grid gap-2.5">
          <div className="flex items-center justify-between">
            <strong className="text-xs font-bold uppercase tracking-tight">Размер</strong>
            <Link href={href} className="text-ink-muted text-xs hover:text-ink">Таблица размеров</Link>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {data.sizes.map((s, i) => (
              <button
                key={s.size}
                type="button"
                aria-pressed={selectedSize === i}
                onClick={() => setSelectedSize(i)}
                disabled={!s.inStock}
                className={`h-11 rounded-[13px] text-sm font-semibold transition-colors ${
                  selectedSize === i
                    ? 'bg-primary text-primary-foreground border border-primary'
                    : 'bg-surface-soft/60 border border-transparent hover:border-ink/18'
                } ${!s.inStock ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {s.size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions: add to cart + heart */}
      <div className="grid grid-cols-[1fr_46px] gap-2.5 pt-3.5">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={selectedSize === null}
          className={`min-h-[46px] rounded-full font-semibold text-sm transition-colors ${
            added
              ? 'bg-accent text-accent-foreground'
              : selectedSize === null
                ? 'bg-ink/20 text-surface cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-footer'
          }`}
        >
          {added ? 'Добавлено ✓' : 'Добавить в корзину'}
        </button>
        <WishlistHeart productId={data.id} initialActive={wishlisted} variant="catalog" />
      </div>
    </article>
  );
}
