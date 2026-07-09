'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui';
import { useCartStore } from '@/store';
import { useCountdown } from '@/hooks/use-countdown';
import { ProductAccordions } from './product-accordions';
import { RatingStars } from './rating-stars';
import { cn } from '@/lib/utils';

export interface PanelColorway {
  slug: string;
  name: string;
  thumbUrl: string | null;
  hexValue?: string; // Optional hex fallback
}

export interface PanelVariant {
  id: string;
  size: string;
  stock: number;
  active: boolean;
  price: number;
  compareAtPrice: number | null;
}

interface PurchasePanelProps {
  productName: string;
  colorways: PanelColorway[];
  activeColorwaySlug: string;
  activeColorwayName: string;
  variants: PanelVariant[];
  fitNote: string | null;
  productSlug: string;
  description: string | null;
  ratingAvg: number;
  ratingCount: number;
  onStickyStateChange: (price: number, comparePrice: number | null, buttonProps: any) => void;
}

export function PurchasePanel({
  productName,
  colorways,
  activeColorwaySlug,
  activeColorwayName,
  variants,
  fitNote,
  productSlug,
  description,
  ratingAvg,
  ratingCount,
  onStickyStateChange
}: PurchasePanelProps) {
  const pathname = usePathname();
  const [sizeId, setSizeId] = useState<string | null>(null);
  const addCartItem = useCartStore((s) => s.addCartItem);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { seconds: cooldown, start: startCooldown } = useCountdown();

  const selectedVariant = variants.find((v) => v.id === sizeId) ?? null;
  const availableVariants = variants.filter((v) => v.active && v.stock > 0);
  const minPrice = availableVariants.length ? Math.min(...availableVariants.map((v) => v.price)) : (variants[0]?.price ?? 0);
  
  const currentPrice = selectedVariant?.price ?? minPrice;
  const currentComparePrice = selectedVariant?.compareAtPrice ?? null;
  const isSoldOut = availableVariants.length === 0;

  const onAdd = async () => {
    if (!selectedVariant || cooldown > 0) return;
    setAdding(true);
    try {
      await addCartItem({ productVariantId: selectedVariant.id });
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 429) {
        startCooldown(Number(e.response.data?.retryAfterSec) || 0);
      }
    } finally {
      setAdding(false);
    }
  };

  // Broadcast layout state upstream to synchronize the isolated runtime sticky panel
  useEffect(() => {
    onStickyStateChange(currentPrice, currentComparePrice, {
      disabled: !selectedVariant || isSoldOut || cooldown > 0,
      loading: adding,
      added,
      cooldown,
      onClick: onAdd,
      hasSelectedSize: !!selectedVariant
    });
  }, [currentPrice, currentComparePrice, sizeId, adding, added, cooldown, isSoldOut]);

  return (
    <div className="border border-line rounded-[24px] bg-surface p-[22px] grid gap-2">
      {/* Title & Metadata Header Block */}
      <h1 className="font-display font-extrabold text-[28px] sm:text-[38px] leading-none tracking-[-0.04em] text-ink">
        {productName}
      </h1>

      {/* Ratings Indicator row */}
      {ratingCount > 0 && (
        <div className="flex items-center gap-1.5 mt-1">
          <RatingStars value={ratingAvg} size={17} />
          <span className="text-sm font-bold text-ink ml-1">{ratingAvg.toFixed(1)}</span>
          <span className="text-sm text-ink-muted">({ratingCount})</span>
        </div>
      )}

      {/* Colors Swatches Matrix Section */}
      <div className="mt-4">
        <p className="text-[12px] font-extrabold uppercase tracking-wider text-ink">
          Цвет: <span className="text-ink-muted font-normal normal-case ml-1">{activeColorwayName}</span>
        </p>
        <div className="flex flex-wrap gap-2.5 mt-2">
          {colorways.map((cw) => {
            const isActive = cw.slug === activeColorwaySlug;
            // Adaptive inline design system background pattern matcher
            const backgroundStyle = cw.slug.includes('green') || cw.slug.includes('зелен')
              ? 'hsl(151 28% 30%)'
              : cw.slug.includes('black') || cw.slug.includes('черн')
              ? 'hsl(220 9% 7%)'
              : cw.slug.includes('white') || cw.slug.includes('бел') || cw.slug.includes('молоч')
              ? 'hsl(42 20% 96%)'
              : cw.slug.includes('grey') || cw.slug.includes('сер')
              ? 'hsl(0 0% 72%)'
              : cw.slug.includes('brown') || cw.slug.includes('корич')
              ? 'hsl(28 32% 48%)'
              : cw.slug.includes('pink') || cw.slug.includes('роз')
              ? 'hsl(345 42% 82%)'
              : 'hsl(42 20% 94%)';

            return (
              <Link
                key={cw.slug}
                href={`${pathname}?color=${cw.slug}`}
                scroll={false}
                aria-current={isActive ? 'true' : undefined}
                aria-label={`Выбрать цвет ${cw.name}`}
                className={cn(
                  'w-10 h-10 rounded-full border border-line transition-all duration-150 relative block shrink-0 shadow-[inset_0_0_0_4px_hsl(var(--color-surface))]',
                  isActive && 'outline outline-2 outline-neutral-900 outline-offset-3'
                )}
                style={{ backgroundColor: backgroundStyle }}
              />
            );
          })}
        </div>
      </div>

      {/* Sizes Selection Group */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-[12px] font-extrabold uppercase tracking-wider text-ink">
          <span>Размер <span className="text-ink-muted font-normal normal-case ml-0.5">EU</span></span>
          <a href="#" className="text-ink-muted hover:text-ink transition-colors normal-case font-normal underline decoration-line underline-offset-2">
            Таблица размеров
          </a>
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 mt-2" role="radiogroup" aria-label="Выбор размера">
          {variants.map((v) => {
            const disabled = !v.active || v.stock <= 0;
            const isSelected = v.id === sizeId;
            return (
              <button
                key={v.id}
                type="button"
                className={cn(
                  'min-width-[52px] h-48 rounded-[14px] border border-line bg-surface-soft/55 font-bold text-[15px] transition-all tnum flex items-center justify-center',
                  isSelected && 'bg-neutral-900 border-neutral-900 text-white font-extrabold',
                  disabled && 'line-through opacity-50 cursor-not-allowed text-ink-muted'
                )}
                disabled={disabled}
                aria-checked={isSelected}
                onClick={() => setSizeId(v.id)}
              >
                {v.size}
              </button>
            );
          })}
        </div>
        {fitNote && <p className="text-xs text-ink-muted mt-2 italic">{fitNote}</p>}
      </div>

      {/* Accordions injected into the primary parameters context stack */}
      <ProductAccordions description={description} />
    </div>
  );
}