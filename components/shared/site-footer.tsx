import Link from 'next/link';
import Image from 'next/image';
import { NewsletterForm } from './newsletter-form';

type FooterLinkItem = { label: string; href: string };

const columns: { title: string; links: FooterLinkItem[] }[] = [
  {
    title: 'Магазин',
    links: [
      { label: 'Новинки', href: '/catalog?sort=new' },
      { label: 'Женщинам', href: '/catalog' },
      { label: 'Мужчинам', href: '/catalog' },
      { label: 'Sale', href: '/catalog?filter=sale' },
    ],
  },
  {
    title: 'Помощь',
    links: [
      { label: 'Доставка', href: '/legal/delivery' },
      { label: 'Возврат', href: '/legal/refund' },
      { label: 'Таблица размеров', href: '#' },
      { label: 'Контакты', href: '#' },
    ],
  },
  {
    title: 'Бренд',
    links: [
      { label: 'О Ritm', href: '#' },
      { label: 'Магазины', href: '#' },
      { label: 'Карьера', href: '#' },
      { label: 'Блог', href: '/blog' },
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
    <footer className="mt-[70px] bg-footer text-white">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="grid md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-8 pt-[52px] pb-9">
          {/* Brand + newsletter */}
          <div>
            <Image src="/ritm-logo-light.svg" alt="Ritm" width={112} height={32} className="w-[112px] h-auto" />
            <p className="text-white/60 text-sm mt-2.5 max-w-[320px]">Подписка на новые капсулы, restock размеров и закрытые скидки.</p>
            <NewsletterForm />
          </div>
          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold mb-2">{col.title}</h4>
              {col.links.map((l) => (
                <FooterLink key={l.label} href={l.href} className="block py-[5px] text-sm text-white/60 hover:text-white transition-colors">
                  {l.label}
                </FooterLink>
              ))}
            </div>
          ))}
        </div>
        {/* Bottom bar */}
        <div className="border-t border-white/[0.12] py-[18px] flex flex-wrap justify-between gap-4 text-xs text-white/45">
          <span>© 2026 Ritm</span>
          <span>Fashion ecommerce prototype · RU</span>
        </div>
      </div>
    </footer>
  );
}