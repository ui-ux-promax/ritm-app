import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MobileNav } from './mobile-nav';
import { CartBadge } from './cart-badge';
import { WishlistBadge } from './wishlist/wishlist-badge';
import { AuthNav } from './auth/auth-nav';
import { CatalogHeaderNav } from './catalog-header-nav';
import { HeaderTopLinks } from './header-top-links';

export function SiteHeader() {
  return (
    <header className="glass-header sticky top-0 z-50">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="grid min-h-[56px] grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex items-center gap-4">
            <Suspense fallback={<div className="h-[34px] w-[34px] md:hidden" aria-hidden />}>
              <MobileNav />
            </Suspense>
            <HeaderTopLinks />
          </div>

          <Link href="/" className="flex items-center justify-self-center" aria-label="Ritm">
            <Image src="/ritm-logo.svg" alt="Ritm" width={98} height={28} priority className="h-auto w-[98px]" />
          </Link>

          <div className="flex items-center justify-self-end gap-2">
            <WishlistBadge />
            <CartBadge />
            <Suspense fallback={<div className="h-[34px] w-[34px]" aria-hidden />}>
              <AuthNav />
            </Suspense>
          </div>
        </div>

        <Suspense fallback={<div className="hidden h-[56px] md:block" aria-hidden />}>
          <div className="hidden grid-cols-[182px_1fr_auto] items-center gap-3.5 pb-3.5 md:grid">
            <CatalogHeaderNav />
          </div>
        </Suspense>
      </div>
    </header>
  );
}
