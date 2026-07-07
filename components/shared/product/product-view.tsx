'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PurchasePanel } from './purchase-panel';
import { ReviewsSection } from './reviews-section';
import { Breadcrumbs } from './breadcrumbs';
import { ProductCard } from '@/components/shared/product-card';
import type { ReviewItem } from './review-list';
import type { PanelColorway, PanelVariant } from './purchase-panel';
import type { ProductCardData } from '@/lib/product-summary';
import { cn } from '@/lib/utils';

interface GalleryImage { url: string; alt: string }

interface Props {
  product: {
    id: string;
    name: string;
    slug: string;
    fitNote: string | null;
    description: string | null;
    category: { name: string; slug: string };
  };
  galleryImages: GalleryImage[];
  isNew: boolean;
  panelColorways: PanelColorway[];
  activeColorwaySlug: string;
  activeColorwayName: string;
  panelVariants: PanelVariant[];
  ratingAvg: number | null;
  ratingCount: number;
  reviews: ReviewItem[];
  reviewState: 'eligible' | 'guest' | 'not-purchased' | 'already-reviewed';
  related: ProductCardData[];
  wishlistedIds: Set<string>;
}

export function ProductView({
  product, galleryImages, isNew, panelColorways, activeColorwaySlug,
  activeColorwayName, panelVariants, ratingAvg, ratingCount,
  reviews, reviewState, related, wishlistedIds,
}: Props) {
  const [activeIdx, setActiveIdx] = useState(0);

  // All images are thumbnails in right column. First one is also main image in left column.
  const main = galleryImages[activeIdx] ?? galleryImages[0];

  // Bento grid: 2 top (square) + 1 wide bottom. If >3 images, extras fill normally.
  const minPrice = panelVariants.filter(v => v.active && v.stock > 0).length
    ? Math.min(...panelVariants.filter(v => v.active && v.stock > 0).map(v => v.price))
    : 0;

  return (
    <>
      <div className="mt-[26px]">
        <Breadcrumbs items={[
          { label: 'Главная', href: '/' },
          { label: 'Каталог', href: '/catalog' },
          { label: product.category.name, href: `/catalog?category=${product.category.slug}` },
          { label: product.name },
        ]} />
      </div>

      {/* Product: 2-column grid like prototype */}
      <div className="grid lg:grid-cols-[1.08fr_1fr] gap-[30px] mt-5 items-start">
        {/* LEFT COLUMN — main image + info card */}
        <div className="grid gap-[22px] content-start">
          {/* Main image (pp-main) */}
          <div className="relative aspect-[1/1.04] rounded-[24px] border border-line bg-surface-soft overflow-hidden">
            {/* Fav button top-left */}
            <button type="button" aria-label="В избранное" className="absolute left-4 top-4 z-10 w-[42px] h-[42px] rounded-full bg-surface/90 backdrop-blur grid place-items-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20.5s-7.25-4.45-7.25-10.2A4.35 4.35 0 0 1 12 7.25a4.35 4.35 0 0 1 7.25 3.05C19.25 16.05 12 20.5 12 20.5Z"/></svg>
            </button>
            {/* Badge top-right */}
            <span className="absolute right-4 top-4 z-10 px-4 py-2 rounded-full bg-surface/90 backdrop-blur text-[13px] font-bold">
              {product.category.name}
            </span>
            {main && (
              <Image src={main.url} alt={main.alt} fill priority sizes="(min-width: 1024px) 600px, 100vw" className="object-cover" />
            )}
          </div>

          {/* Info card (pp-card) */}
          <PurchasePanel
            key={activeColorwaySlug}
            productName={product.name}
            productSlug={product.slug}
            colorways={panelColorways}
            activeColorwaySlug={activeColorwaySlug}
            activeColorwayName={activeColorwayName}
            variants={panelVariants}
            fitNote={product.fitNote}
            description={product.description}
            ratingAvg={ratingAvg}
            ratingCount={ratingCount}
          />
        </div>

        {/* RIGHT COLUMN — thumbnails + sticky (buy bar + reviews) */}
        <div className="grid gap-[22px] content-start">
          {/* Thumbnail gallery (pp-gallery) — 2 top + 1 wide bottom */}
          <div className="grid grid-cols-2 gap-3">
            {galleryImages.map((img, i) => {
              // 3rd image (index 2) is wide
              const isWide = i === 2;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  aria-label={`Фото ${i + 1}`}
                  aria-current={activeIdx === i}
                  className={cn(
                    'group relative overflow-hidden rounded-[18px] border bg-surface-soft transition-all duration-300',
                    isWide ? 'col-span-2 aspect-[1.74/1]' : 'aspect-[1/1.08]',
                    activeIdx === i ? 'border-ink shadow-[0_0_0_1px_hsl(var(--color-text))]' : 'border-line hover:border-ink/30'
                  )}
                >
                  <Image src={img.url} alt={img.alt} fill sizes="(min-width: 1024px) 300px, 50vw" className="object-cover transition-transform duration-400 group-hover:scale-105" />
                </button>
              );
            })}
          </div>

          {/* Sticky panel (pp-sticky-panel) — buy bar + reviews together */}
          <div className="lg:sticky lg:top-[128px] grid gap-[22px] self-start z-5">
            {/* Buy bar (pp-buy) */}
            <div className="flex items-center justify-between gap-4 border border-line rounded-[18px] bg-surface p-3.5">
              <div className="flex items-baseline gap-1 font-display font-bold tracking-tight">
                <span className="text-[18px] text-accent">₽</span>
                <span className="text-[30px] text-accent leading-none tnum">{minPrice.toLocaleString('ru-RU')}</span>
              </div>
              <button type="button" className="inline-flex items-center gap-2.5 min-h-[52px] px-6 rounded-full bg-primary text-primary-foreground text-[15px] font-bold whitespace-nowrap hover:bg-footer transition-colors">
                Купить сейчас
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </button>
            </div>

            {/* Reviews (reviews) — inside sticky, scrolls with buy bar */}
            <ReviewsSection
              productId={product.id}
              avg={ratingAvg ?? 0}
              count={ratingCount}
              reviews={reviews}
              state={reviewState}
            />
          </div>
        </div>
      </div>

      {/* Related — full width below */}
      {related.length > 0 && (
        <section className="mt-[70px]">
          <h2 className="text-center font-display font-bold text-[26px] sm:text-[40px] tracking-tight mb-7">Вам также подойдёт</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[18px]">
            {related.map((p) => <ProductCard key={p.slug} data={p} wishlisted={wishlistedIds.has(p.id)} />)}
          </div>
        </section>
      )}
    </>
  );
}