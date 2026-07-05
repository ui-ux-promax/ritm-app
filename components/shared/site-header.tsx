import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MobileNav } from './mobile-nav';
import { HeaderSearch } from './header-search';
import { CartBadge } from './cart-badge';
import { WishlistBadge } from './wishlist/wishlist-badge';
import { AuthNav } from './auth/auth-nav';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md border-b border-line" style={{ background: 'hsl(var(--color-bg) / 0.94)' }}>
      <div className="mx-auto max-w-[1200px] px-6">
        {/* Row 1: nav-primary — grid 1fr auto 1fr for centered logo */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 min-h-[56px]">
          {/* Left: menu + (nav links on desktop) */}
          <div className="flex items-center gap-4">
            <Suspense fallback={<div className="md:hidden w-[34px] h-[34px]" aria-hidden />}>
              <MobileNav />
            </Suspense>
            <nav className="hidden md:flex items-center gap-6 text-[13px] font-semibold" aria-label="Разделы сайта">
              <Link href="/blog" className="text-ink hover:text-ink-muted transition-colors">Блог</Link>
              <Link href="/faq" className="text-ink hover:text-ink-muted transition-colors">FAQ</Link>
            </nav>
          </div>

          {/* Center: logo */}
          <Link href="/" className="justify-self-center flex items-center" aria-label="Ritm">
            <Image src="/ritm-logo.svg" alt="Ritm" width={98} height={28} priority className="h-auto w-[98px]" />
          </Link>

          {/* Right: icon row */}
          <div className="justify-self-end flex items-center gap-2">
            {/* Bell icon — visual only, no backend */}
            <button type="button" aria-label="Уведомления" className="hidden md:grid w-[34px] h-[34px] place-items-center rounded-full border border-line/72 bg-surface shadow-sm hover:border-ink/35 transition-colors">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8.9 19a3.1 3.1 0 0 0 6.2 0"/>
                <path d="M6.2 10.2a5.8 5.8 0 0 1 11.6 0c0 2.7.58 4.2 1.75 5.55.43.5.08 1.25-.58 1.25H5.03c-.66 0-1.01-.75-.58-1.25C5.62 14.4 6.2 12.9 6.2 10.2Z"/>
              </svg>
            </button>
            <WishlistBadge />
            <CartBadge />
            <Suspense fallback={<div className="w-[34px] h-[34px]" aria-hidden />}>
              <AuthNav />
            </Suspense>
          </div>
        </div>

        {/* Row 2: nav-secondary — grid 182px 1fr auto */}
        <div className="hidden md:grid grid-cols-[182px_1fr_auto] gap-3.5 items-center pb-3.5">
          {/* Category select */}
          <button type="button" className="h-[42px] flex items-center justify-between px-4 rounded-full border border-line bg-surface text-ink-muted text-[13px] font-semibold">
            <span>Одежда</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
          </button>

          {/* Quick chips + search */}
          <div className="flex items-center gap-2.5 overflow-x-auto">
            <Link href="/catalog?sort=new" className="h-[38px] px-4 inline-flex items-center rounded-full border border-line bg-surface text-[13px] font-semibold hover:border-ink/35 transition-colors bg-primary text-primary-foreground border-primary">Новинки</Link>
            <Link href="/catalog?filter=sale" className="h-[38px] px-4 inline-flex items-center rounded-full border border-line bg-surface text-[13px] font-semibold hover:border-ink/35 transition-colors">Sale</Link>
            <HeaderSearch />
          </div>

          {/* Audience chips */}
          <div className="flex items-center gap-2.5">
            <span className="h-[38px] px-4 inline-flex items-center rounded-full border border-line bg-surface text-[13px] font-semibold text-ink-muted hover:border-ink/35 transition-colors cursor-default">Мужчины</span>
            <span className="h-[38px] px-4 inline-flex items-center rounded-full border border-line bg-surface text-[13px] font-semibold text-ink-muted hover:border-ink/35 transition-colors cursor-default">Женщины</span>
            <span className="h-[38px] px-4 inline-flex items-center rounded-full border border-line bg-surface text-[13px] font-semibold text-ink-muted hover:border-ink/35 transition-colors cursor-default">Дети</span>
            <span className="h-[38px] px-4 inline-flex items-center rounded-full border border-line bg-surface text-[13px] font-semibold text-ink-muted hover:border-ink/35 transition-colors cursor-default">Бренд</span>
          </div>
        </div>
      </div>
    </header>
  );
}