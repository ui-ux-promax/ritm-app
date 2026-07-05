import Link from 'next/link';
import Image from 'next/image';
import { NewsletterForm } from './newsletter-form';

type FooterLinkItem = { label: string; href: string };

const columns: { title: string; links: FooterLinkItem[] }[] = [
  {
    title: 'Магазин',
    links: [
      { label: 'Новинки', href: '/catalog?sort=new' },
      { label: 'Футболки', href: '/catalog?category=tees' },
      { label: 'Худи', href: '/catalog?category=hoodies' },
      { label: 'Верхняя одежда', href: '/catalog?category=outerwear' },
    ],
  },
  {
    title: 'Помощь',
    links: [
      { label: 'Доставка', href: '/legal/delivery' },
      { label: 'Возврат', href: '/legal/refund' },
      { label: 'Размерная сетка', href: '#' },
      { label: 'Контакты', href: '#' },
    ],
  },
  {
    title: 'Мы рядом',
    links: [
      { label: 'Telegram', href: '#' },
      { label: 'VK', href: '#' },
      { label: 'YouTube', href: '#' },
    ],
  },
];

function FooterLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  if (href.startsWith('/')) {
    return <Link href={href} className={className}>{children}</Link>;
  }
  return <a href={href} className={className}>{children}</a>;
}

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-[1240px] px-4 sm:px-6 pt-16 sm:pt-20 pb-8">
      <div className="rounded-[28px] overflow-hidden text-white bg-footer">
        <div className="p-8 sm:p-12">
          <div className="grid md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-8">
            <div>
              <Image src="/ritm-logo-light.svg" alt="RITM" width={98} height={28} className="h-7 w-auto" />
              <p className="text-white/70 text-sm max-w-xs leading-relaxed mt-3">Подпишись на дропы и забирай новые вещи первым. Без спама.</p>
              <NewsletterForm />
            </div>
            {columns.map((col) => (
              <div key={col.title}>
                <p className="font-semibold text-sm mb-3">{col.title}</p>
                <ul className="space-y-2 text-sm text-white/70">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <FooterLink href={l.href} className="hover:text-white">{l.label}</FooterLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 mt-8 pt-5 flex flex-col sm:flex-row gap-2 justify-between text-xs text-white/70">
            <p>© 2026 RITM. Все цены в рублях.</p>
            <div className="flex gap-4">
              <Link href="/legal/privacy" className="hover:text-white">Политика конфиденциальности</Link>
              <Link href="/legal/terms" className="hover:text-white">Условия</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}