'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PurchasePanel } from './purchase-panel';
import { WishlistHeart } from '@/components/shared/wishlist/wishlist-heart';
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
  wishlisted: boolean;
  productId: string;
}

export function ProductView({
  product, galleryImages, isNew, panelColorways, activeColorwaySlug,
  activeColorwayName, panelVariants, ratingAvg, ratingCount,
  reviews, reviewState, related, wishlistedIds, wishlisted, productId,
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
      <div className="mt-5 grid min-w-0 grid-cols-[minmax(0,1fr)] items-start gap-[30px] lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]">
        {/* LEFT COLUMN — main image + info card */}
        <div className="grid min-w-0 gap-[22px]">
          {/* Main image (pp-main) */}
          <div className="relative aspect-[1/1.04] rounded-[24px] border border-line bg-surface-soft overflow-hidden">
            {/* Fav button top-left */}
            <div className="absolute left-4 top-4 z-10">
              <WishlistHeart productId={productId} initialActive={wishlisted} variant="pdp" />
            </div>
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
        <div className="grid min-w-0 gap-[22px] self-stretch content-start">
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
            <div className="flex flex-col items-stretch justify-between gap-3 rounded-[18px] border border-line bg-surface p-3.5 min-[420px]:flex-row min-[420px]:items-center min-[420px]:gap-4">
              <div className="flex items-baseline gap-1 font-display font-bold tracking-tight">
                <span className="text-[18px] text-accent leading-none">₽</span>
                <span className="text-[30px] text-accent leading-none tnum">{minPrice.toLocaleString('ru-RU')}</span>
              </div>
              <button type="button" className="inline-flex min-h-[52px] items-center justify-center gap-2.5 whitespace-nowrap rounded-full bg-primary px-6 text-[15px] font-bold text-primary-foreground transition-colors hover:bg-footer">
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
