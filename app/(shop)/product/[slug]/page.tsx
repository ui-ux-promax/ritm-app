import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma-client';
import { getProductBySlug } from '@/lib/get-product';
import { absoluteUrl, buildBreadcrumbListJsonLd, buildProductJsonLd, defaultOgImage, siteName } from '@/lib/seo';
import { productCardInclude, buildProductCardData } from '@/lib/product-summary';
import { normalizeSize } from '@/lib/format';
import { NEW_PRODUCT_WINDOW_DAYS, LOW_STOCK_THRESHOLD } from '@/constants/config';
import { isNewByDate } from '@/lib/product-badges';
import { ProductCard } from '@/components/shared/product-card';
import { Breadcrumbs } from '@/components/shared/product/breadcrumbs';
import { ProductGallery } from '@/components/shared/product/product-gallery';
import { PurchasePanel } from '@/components/shared/product/purchase-panel';
import { SpecsTable } from '@/components/shared/product/specs-table';
import { auth } from '@/auth';
import { getReviewEligibility } from '@/lib/review';
import { getWishlistProductIds } from '@/lib/wishlist';
import { wishlistCookieName } from '@/lib/wishlist-cookie';
import { RatingStars } from '@/components/shared/product/rating-stars';
import { ReviewsSection } from '@/components/shared/product/reviews-section';
import type { ReviewItem } from '@/components/shared/product/review-list';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }>; searchParams: Promise<{ color?: string }> };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    select: {
      name: true,
      description: true,
      colorways: {
        orderBy: [{ isDefault: 'desc' }, { sortOrder: 'asc' }],
        take: 1,
        select: {
          images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true, alt: true } },
        },
      },
    },
  });
  if (!product) return { title: 'Товар не найден', robots: { index: false, follow: false } };
  const description = product.description ?? undefined;
  const primaryImage = product.colorways[0]?.images[0];
  const image = absoluteUrl(primaryImage?.url ?? defaultOgImage);
  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${slug}` },
    openGraph: { title: product.name, description, url: `/product/${slug}`, siteName, type: 'website', images: [{ url: image, alt: primaryImage?.alt ?? product.name }] },
    twitter: { card: 'summary_large_image', title: product.name, description, images: [image] },
  };
}

export default async function ProductPage({ params, searchParams }: Params) {
  const { slug } = await params;
  const { color } = await searchParams;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const active = product.colorways.find((c) => c.slug === color) ?? product.colorways.find((c) => c.isDefault) ?? product.colorways[0];
  if (!active) notFound();

  const now = new Date();
  const relatedRaw = await prisma.product.findMany({
    where: { active: true, categoryId: product.categoryId, NOT: { id: product.id } },
    take: 4, orderBy: { sortOrder: 'asc' }, include: productCardInclude,
  });
  const related = relatedRaw.map((p) => buildProductCardData(p, now, { newWindowDays: NEW_PRODUCT_WINDOW_DAYS, lowStock: LOW_STOCK_THRESHOLD }));

  const [agg, reviewRows, session] = await Promise.all([
    prisma.review.aggregate({ where: { productId: product.id }, _avg: { rating: true }, _count: true }),
    prisma.review.findMany({
      where: { productId: product.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, rating: true, body: true, createdAt: true, user: { select: { name: true } } },
    }),
    auth(),
  ]);
  const reviews: ReviewItem[] = reviewRows.map((r) => ({
    id: r.id, rating: r.rating, body: r.body, createdAt: r.createdAt,
    authorName: r.user.name?.trim() ? r.user.name : 'Покупатель',
  }));
  const avg = agg._avg.rating ?? 0;
  const count = agg._count;
  const reviewState: 'eligible' | 'guest' | 'not-purchased' | 'already-reviewed' =
    session?.user?.id ? await getReviewEligibility(session.user.id, product.id) : 'guest';

  const wlStore = await cookies();
  const wishlistedIds = await getWishlistProductIds(session, wlStore.get(wishlistCookieName)?.value);

  const galleryImages = active.images.map((im) => ({ url: im.url, alt: im.alt ?? product.name }));
  const soldOut = !active.variants.some((v) => v.active && v.stock > 0);
  const galleryIsNew = !soldOut && isNewByDate(product.createdAt, now, NEW_PRODUCT_WINDOW_DAYS);
  const panelColorways = product.colorways.map((cw) => ({ slug: cw.slug, name: cw.name, thumbUrl: cw.images[0]?.url ?? null }));
  const panelVariants = active.variants.map((v) => ({
    id: v.id, size: v.size, stock: v.stock, active: v.active,
    price: v.price, compareAtPrice: v.compareAtPrice,
  }));
  const specs = (product.specs ?? null) as Record<string, string> | null;
  const productUrl = `/product/${product.slug}${active.slug ? `?color=${active.slug}` : ''}`;
  const productJsonLd = buildProductJsonLd({
    name: product.name,
    description: product.description,
    images: galleryImages.map((g) => g.url),
    variants: product.colorways.flatMap((colorway) => colorway.variants),
    url: productUrl,
    rating: count > 0 ? { value: avg, count } : null,
  });
  const breadcrumbItems = [
    { name: 'Главная', url: '/' },
    { name: 'Каталог', url: '/catalog' },
    { name: product.category.name, url: `/catalog?category=${product.category.slug}` },
    { name: product.name, url: `/product/${product.slug}` },
  ];
  const breadcrumbJsonLd = buildBreadcrumbListJsonLd(breadcrumbItems);

  return (
    <div className="mx-auto max-w-[1200px] px-6 pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="mt-[26px]">
        <Breadcrumbs items={[
          { label: 'Главная', href: '/' },
          { label: 'Каталог', href: '/catalog' },
          { label: product.category.name, href: `/catalog?category=${product.category.slug}` },
          { label: product.name },
        ]} />
      </div>

      {/* 2-column: left = gallery + info card, right = thumbnails + sticky buy + reviews */}
      <div className="grid lg:grid-cols-[1.08fr_1fr] gap-[30px] mt-5 items-start">
        {/* LEFT COLUMN */}
        <div className="grid gap-[22px] content-start">
          {/* Main image */}
          <ProductGallery
            key={active.slug}
            images={galleryImages}
            productName={product.name}
            isNew={galleryIsNew}
            discountPct={null}
          />

          {/* Info card: title, rating, color, size, accordions */}
          <PurchasePanel
            key={active.slug}
            productName={product.name}
            productSlug={product.slug}
            colorways={panelColorways}
            activeColorwaySlug={active.slug}
            activeColorwayName={active.name}
            variants={panelVariants}
            fitNote={product.fitNote}
            description={product.description}
            ratingAvg={count > 0 ? avg : null}
            ratingCount={count}
          />
        </div>

        {/* RIGHT COLUMN */}
        <div className="grid gap-[22px] content-start">
          {/* Sticky buy bar */}
          <div className="lg:sticky lg:top-[140px] grid gap-[22px] z-5">
            <div className="flex items-center justify-between gap-4 border border-line rounded-[18px] bg-surface p-3.5">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-bold text-[30px] text-accent leading-none tnum">
                    {panelVariants.filter(v => v.active && v.stock > 0).length
                      ? Math.min(...panelVariants.filter(v => v.active && v.stock > 0).map(v => v.price)).toLocaleString('ru-RU')
                      : '—'}
                  </span>
                  <span className="text-[18px] text-accent font-display font-bold">₽</span>
                </div>
              </div>
              <a href="#buy" className="inline-flex items-center gap-2.5 min-h-[52px] px-6 rounded-full bg-primary text-primary-foreground text-[15px] font-bold whitespace-nowrap hover:bg-footer transition-colors">
                Купить
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </a>
            </div>

            {/* Specs */}
            <SpecsTable specs={specs} />
          </div>

          {/* Reviews */}
          <div id="reviews">
            <ReviewsSection
              productId={product.id}
              avg={avg}
              count={count}
              reviews={reviews}
              state={reviewState}
            />
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
    </div>
  );
}