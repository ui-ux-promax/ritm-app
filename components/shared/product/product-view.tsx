'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PurchasePanel } from './purchase-panel';
import { ReviewsSection } from './reviews-section';
import { SpecsTable } from './specs-table';
import { Breadcrumbs } from './breadcrumbs';
import { ProductCard } from '@/components/shared/product-card';
import type { ReviewItem } from './review-list';
import type { PanelColorway, PanelVariant } from './purchase-panel';
import type { ProductCardData } from '@/lib/product-summary';

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
  specs: Record<string, string> | null;
  ratingAvg: number | null;
  ratingCount: number;
  reviews: ReviewItem[];
  reviewState: 'eligible' | 'guest' | 'not-purchased' | 'already-reviewed';
  related: ProductCardData[];
  wishlistedIds: Set<string>;
  wishlisted: boolean;
}

export function ProductView({
  product, galleryImages, isNew, panelColorways, activeColorwaySlug,
  activeColorwayName, panelVariants, specs, ratingAvg, ratingCount,
  reviews, reviewState, related, wishlistedIds, wishlisted,
}: Props) {
  const [mainIdx, setMainIdx] = useState(0);
  const main = galleryImages[mainIdx] ?? galleryImages[0];
  const thumbs = galleryImages.slice(1, 4); // up to 3 thumbnails

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

      <div className="grid lg:grid-cols-[1.08fr_1fr] gap-[30px] mt-5 items-start">
        {/* LEFT — main image + info card */}
        <div className="grid gap-[22px]">
          {/* Main image */}
          <div className="relative aspect-[1/1.04] rounded-[24px] border border-line bg-surface-soft overflow-hidden">
            {isNew && (
              <span className="absolute top-4 left-4 z-10 inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full bg-primary text-primary-foreground">
                Новинка
              </span>
            )}
            {main && (
              <Image
                src={main.url}
                alt={main.alt}
                fill
                priority
                sizes="(min-width: 1024px) 600px, 100vw"
                className="object-cover"
              />
            )}
          </div>

          {/* Info card */}
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

        {/* RIGHT — thumbnails + sticky (buy bar + reviews together) */}
        <div className="grid gap-[22px]">
          {/* Thumbnails: 2 top + 1 wide bottom */}
          <div className="grid grid-cols-2 gap-3">
            {thumbs.slice(0, 2).map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setMainIdx(i + 1)}
                aria-label={`Фото ${i + 2}`}
                aria-current={mainIdx === i + 1}
                className={`relative aspect-[1/1.08] rounded-[18px] overflow-hidden border transition-all ${
                  mainIdx === i + 1
                    ? 'border-ink shadow-[0_0_0_1px_hsl(var(--color-text))]'
                    : 'border-line hover:border-ink/30'
                }`}
              >
                <Image src={img.url} alt={img.alt} fill sizes="(min-width: 1024px) 300px, 50vw" className="object-cover" />
              </button>
            ))}
            {thumbs[2] && (
              <button
                type="button"
                onClick={() => setMainIdx(3)}
                aria-label="Фото 4"
                aria-current={mainIdx === 3}
                className={`col-span-2 relative aspect-[1.74/1] rounded-[18px] overflow-hidden border transition-all ${
                  mainIdx === 3
                    ? 'border-ink shadow-[0_0_0_1px_hsl(var(--color-text))]'
                    : 'border-line hover:border-ink/30'
                }`}
              >
                <Image src={thumbs[2].url} alt={thumbs[2].alt} fill sizes="(min-width: 1024px) 600px, 100vw" className="object-cover" />
              </button>
            )}
          </div>

          {/* Sticky: buy bar + reviews together */}
          <div className="lg:sticky lg:top-[140px] grid gap-[22px] bg-bg pb-[22px]">
            {/* Buy bar */}
            <div className="flex items-center justify-between gap-4 border border-line rounded-[18px] bg-surface p-3.5">
              <div className="flex items-baseline gap-1">
                <span className="font-display font-bold text-[30px] text-accent leading-none tnum">
                  {panelVariants.filter(v => v.active && v.stock > 0).length
                    ? Math.min(...panelVariants.filter(v => v.active && v.stock > 0).map(v => v.price)).toLocaleString('ru-RU')
                    : '—'}
                </span>
                <span className="text-[18px] text-accent font-display font-bold">₽</span>
              </div>
              <a href="#buy" className="inline-flex items-center gap-2.5 min-h-[52px] px-6 rounded-full bg-primary text-primary-foreground text-[15px] font-bold whitespace-nowrap hover:bg-footer transition-colors">
                Купить
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </a>
            </div>

            {/* Reviews */}
            <div id="reviews">
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
      </div>

      {/* Related */}
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