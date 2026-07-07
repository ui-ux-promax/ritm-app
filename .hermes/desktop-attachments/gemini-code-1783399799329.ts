'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { WishlistHeart } from '@/components/shared/wishlist/wishlist-heart';
import { ProductGallery } from '@/components/shared/product/product-gallery';
import { PurchasePanel } from '@/components/shared/product/purchase-panel';
import { ReviewsSection } from '@/components/shared/product/reviews-section';
import { SpecsTable } from '@/components/shared/product/specs-table';
import { ProductCard } from '@/components/shared/product-card';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';

export function InteractiveProductLayout({
  product,
  galleryImages,
  panelColorways,
  activeColorway,
  panelVariants,
  ratingAvg,
  ratingCount,
  reviews,
  wishlisted,
  specs,
  related,
  wishlistedIds
}: any) {
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [stickyState, setStickyState] = useState<any>({
    price: 0,
    comparePrice: null,
    btn: { disabled: true, loading: false, added: false, cooldown: 0, onClick: () => {}, hasSelectedSize: false }
  });

  const mainImage = galleryImages[galleryIdx] || galleryImages[0];

  return (
    <div>
      <div className="grid lg:grid-cols-[1.08fr_1fr] gap-[30px] mt-6 items-start">
        {/* Left Column (pp-col) */}
        <div className="space-y-6">
          {/* Main Display Image Container Box Frame */}
          <div className="relative aspect-[1/1.04] rounded-[24px] border border-line bg-surface-soft overflow-hidden">
            {mainImage && (
              <Image
                src={mainImage.url}
                alt={mainImage.alt || product.name}
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 600px, 100vw"
              />
            )}

            {/* Prototype Badge Component Context Pin - Top Right */}
            <span className="absolute right-4 top-4 px-4 py-2 rounded-full bg-surface/90 backdrop-blur-[8px] font-bold text-[13px] text-ink z-10">
              {product.category.name}
            </span>

            {/* Prototype Favorites Container Frame - Top Left */}
            <div className="absolute left-4 top-4 z-10 w-[42px] h-[42px] rounded-full bg-surface/90 backdrop-blur-[8px] flex items-center justify-center border-0 shadow-sm">
              <WishlistHeart productId={product.id} initialActive={wishlisted} variant="pdp" />
            </div>
          </div>

          {/* Configuration and Variant Parameters Selection Box Card */}
          <PurchasePanel
            productName={product.name}
            colorways={panelColorways}
            activeColorwaySlug={activeColorway.slug}
            activeColorwayName={activeColorway.name}
            variants={panelVariants}
            fitNote={product.fitNote}
            productSlug={product.slug}
            description={product.description}
            ratingAvg={ratingAvg}
            ratingCount={ratingCount}
            onStickyStateChange={(price, comparePrice, btn) => setStickyState({ price, comparePrice, btn })}
          />
        </div>

        {/* Right Column (pp-col) */}
        <div className="space-y-6 lg:pt-0">
          {/* Linked High-fidelity Multithumbnail System */}
          <ProductGallery
            images={galleryImages}
            productName={product.name}
            activeIdx={galleryIdx}
            onSelectIndex={(idx) => setGalleryIdx(idx)}
          />

          {/* Fixed-Position Right Context Action Block Panel */}
          <div className="lg:sticky lg:top-[128px] grid gap-[22px] z-20">
            {/* Dynamic Interactive Horizontal Bar Block */}
            <div className="flex items-center justify-between gap-4 border border-line rounded-[18px] bg-surface p-3.5 sm:p-4 shadow-sm">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="font-display font-extrabold text-[30px] text-accent leading-none tnum">
                    {formatPrice(stickyState.price).replace(' ₽', '')}
                    <span className="text-[18px] font-normal text-ink ml-0.5">₽</span>
                  </span>
                </div>
                {stickyState.comparePrice && stickyState.comparePrice > stickyState.price && (
                  <span className="text-[13px] text-ink-muted line-through tnum mt-1">
                    {formatPrice(stickyState.comparePrice)}
                  </span>
                )}
              </div>

              <button
                type="button"
                className={cn(
                  'min-h-[52px] px-6 sm:px-8 rounded-full font-bold text-[15px] transition-all flex items-center justify-center gap-2 text-white shadow-sm shrink-0',
                  stickyState.btn.added ? 'bg-emerald-600' : 'bg-neutral-900 hover:bg-neutral-800',
                  stickyState.btn.disabled && 'opacity-50 cursor-not-allowed'
                )}
                disabled={stickyState.btn.disabled}
                onClick={stickyState.btn.onClick}
              >
                <span>
                  {stickyState.btn.added
                    ? 'Добавлено ✓'
                    : stickyState.btn.cooldown > 0
                    ? `Подождите ${stickyState.btn.cooldown} с`
                    : !stickyState.btn.hasSelectedSize
                    ? 'Выберите размер'
                    : 'В корзину'}
                </span>
                {!stickyState.btn.added && stickyState.btn.hasSelectedSize && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>

            {/* Inline Specs Attribute Matrix Block */}
            <SpecsTable specs={specs} />

            {/* High-Fidelity Snapshot Reviews Block */}
            <ReviewsSection reviews={reviews} count={ratingCount} />
          </div>
        </div>
      </div>

      {/* full-width cross-sell matrix layout below columns */}
      {related.length > 0 && (
        <section className="mt-20 pt-10 border-t border-line">
          <h2 className="font-display font-extrabold text-center text-[26px] sm:text-[40px] tracking-tight mb-8">
            С этим смотрят
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[18px]">
            {related.map((p: any) => (
              <ProductCard key={p.slug} data={p} wishlisted={wishlistedIds.has(p.id)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}