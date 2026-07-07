import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import Image from 'next/image';
import { prisma } from '@/lib/prisma-client';
import { getProductBySlug } from '@/lib/get-product';
import { absoluteUrl, buildBreadcrumbListJsonLd, buildProductJsonLd, defaultOgImage, siteName } from '@/lib/seo';
import { productCardInclude, buildProductCardData } from '@/lib/product-summary';
import { NEW_PRODUCT_WINDOW_DAYS, LOW_STOCK_THRESHOLD } from '@/constants/config';
import { isNewByDate } from '@/lib/product-badges';
import { Breadcrumbs } from '@/components/shared/product/breadcrumbs';
import { WishlistHeart } from '@/components/shared/wishlist/wishlist-heart';
import { SpecsTable } from '@/components/shared/product/specs-table';
import { auth } from '@/auth';
import { getWishlistProductIds } from '@/lib/wishlist';
import { wishlistCookieName } from '@/lib/wishlist-cookie';
import { ProductCard } from '@/components/shared/product-card';
import type { ReviewItem } from '@/components/shared/product/review-list';

// Import our updated high-fidelity components
import { InteractiveProductLayout } from './interactive-layout';

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
    openGraph: {
      title: product.name,
      description,
      url: `/product/${slug}`,
      siteName,
      type: 'website',
      images: [{ url: image, alt: primaryImage?.alt ?? product.name }],
    },
    twitter: { card: 'summary_large_image', title: product.name, description, images: [image] },
  };
}

export default async function ProductPage({ params, searchParams }: Params) {
  const { slug } = await params;
  const { color } = await searchParams;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const activeColorway = product.colorways.find((c) => c.slug === color) ?? product.colorways.find((c) => c.isDefault) ?? product.colorways[0];
  if (!activeColorway) notFound();

  const now = new Date();
  const relatedRaw = await prisma.product.findMany({
    where: { active: true, categoryId: product.categoryId, NOT: { id: product.id } },
    take: 4,
    orderBy: { sortOrder: 'asc' },
    include: productCardInclude,
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
    id: r.id,
    rating: r.rating,
    body: r.body,
    createdAt: r.createdAt,
    authorName: r.user.name?.trim() ? r.user.name : 'Покупатель',
  }));
  const avgRating = agg._avg.rating ?? 0;
  const countRating = agg._count;

  const wlStore = await cookies();
  const wishlistedIds = await getWishlistProductIds(session, wlStore.get(wishlistCookieName)?.value);

  const galleryImages = activeColorway.images.map((im) => ({ url: im.url, alt: im.alt ?? product.name }));
  const panelColorways = product.colorways.map((cw) => ({ slug: cw.slug, name: cw.name, thumbUrl: cw.images[0]?.url ?? null }));
  const panelVariants = activeColorway.variants.map((v) => ({
    id: v.id, size: v.size, stock: v.stock, active: v.active, price: v.price, compareAtPrice: v.compareAtPrice,
  }));

  const specs = (product.specs ?? null) as Record<string, string> | null;
  const productUrl = `/product/${product.slug}${activeColorway.slug ? `?color=${activeColorway.slug}` : ''}`;

  const productJsonLd = buildProductJsonLd({
    name: product.name,
    description: product.description,
    images: galleryImages.map((g) => g.url),
    variants: product.colorways.flatMap((cw) => cw.variants),
    url: productUrl,
    rating: countRating > 0 ? { value: avgRating, count: countRating } : null,
  });

  const breadcrumbItems = [
    { name: 'Главная', url: '/' },
    { name: 'Каталог', url: '/catalog' },
    { name: product.category.name, url: `/catalog?category=${product.category.slug}` },
    { name: product.name, url: `/product/${product.slug}` },
  ];
  const breadcrumbJsonLd = buildBreadcrumbListJsonLd(breadcrumbItems);

  return (
    <div className="mx-auto max-w-[1240px] px-4 sm:px-6 pb-16">
      {/* Target Prototype Breadcrumbs Component Styling */}
      <div className="mt-[26px]">
        <Breadcrumbs
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Каталог', href: '/catalog' },
            { label: product.category.name, href: `/catalog?category=${product.category.slug}` },
            { label: product.name },
          ]}
        />
      </div>

      {/* Target Prototype Two-Column Core View Matrix Grid */}
      <InteractiveProductLayout
        product={product}
        galleryImages={galleryImages}
        panelColorways={panelColorways}
        activeColorway={activeColorway}
        panelVariants={panelVariants}
        ratingAvg={avgRating}
        ratingCount={countRating}
        reviews={reviews}
        wishlisted={wishlistedIds.has(product.id)}
        specs={specs}
        related={related}
        wishlistedIds={wishlistedIds}
      />

      {/* Structured SEO Engine Layer */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </div>
  );
}