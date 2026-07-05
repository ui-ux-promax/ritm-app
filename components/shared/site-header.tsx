import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MainNav, MainNavFallback } from './main-nav';
import { MobileNav } from './mobile-nav';
import { HeaderSearch } from './header-search';
import { CartBadge } from './cart-badge';
import { WishlistBadge } from './wishlist/wishlist-badge';
import { AuthNav } from './auth/auth-nav';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 glass-header">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        {/* Row 1: nav-primary */}
        <div className="relative flex items-center gap-3 h-16">
          <Suspense fallback={<div className="md:hidden w-10 h-10 -ml-2" aria-hidden />}>
            <MobileNav />
          </Suspense>
          <Link href="/" className="flex items-center" aria-label="RITM — на главную">
            <Image src="/ritm-logo.svg" alt="RITM" width={98} height={28} priority className="h-7 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-5 ml-4" aria-label="Разделы сайта">
            <Link href="/blog" className="text-sm font-medium text-ink/80 hover:text-ink transition-colors">Блог</Link>
            <Link href="/faq" className="text-sm font-medium text-ink/80 hover:text-ink transition-colors">FAQ</Link>
          </nav>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Suspense fallback={<MainNavFallback />}>
              <MainNav />
            </Suspense>
            <HeaderSearch />
            <AuthNav />
            <WishlistBadge />
            <CartBadge />
          </div>
        </div>
        {/* Row 2: nav-secondary — hidden on mobile, visible md+ */}
        <div className="hidden md:flex items-center gap-3 pb-3 -mt-1">
          <div className="flex items-center gap-2">
            <Link href="/catalog?sort=new" className="chip pill-button is-active text-xs font-semibold px-3 py-1.5 rounded-full bg-primary text-primary-foreground">Новинки</Link>
            <Link href="/catalog?filter=sale" className="chip pill-button text-xs font-semibold px-3 py-1.5 rounded-full border border-line bg-surface text-ink hover:border-ink transition-colors">Sale</Link>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <span className="chip text-xs font-medium px-3 py-1.5 rounded-full border border-line bg-surface text-ink-muted hover:text-ink transition-colors cursor-default">Мужчины</span>
            <span className="chip text-xs font-medium px-3 py-1.5 rounded-full border border-line bg-surface text-ink-muted hover:text-ink transition-colors cursor-default">Женщины</span>
            <span className="chip text-xs font-medium px-3 py-1.5 rounded-full border border-line bg-surface text-ink-muted hover:text-ink transition-colors cursor-default">Дети</span>
            <span className="chip text-xs font-medium px-3 py-1.5 rounded-full border border-line bg-surface text-ink-muted hover:text-ink transition-colors cursor-default">Бренд</span>
          </div>
        </div>
      </div>
    </header>
  );
}