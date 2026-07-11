import Image from 'next/image';
import { ArrowUpRight, Heart, Search, ShoppingBag, UserRound, X } from 'lucide-react';

const menu = [
  ['Новинки', '/catalog?sort=new'],
  ['Футболки', '/catalog?category=tees'],
  ['Худи', '/catalog?category=hoodies'],
  ['Верхняя одежда', '/catalog?category=outerwear'],
] as const;

const categories = [
  { label: 'Новинки', href: '/catalog?sort=new', image: '/home/hero-slide-3.png' },
  { label: 'Футболки', href: '/catalog?category=tees', image: '/products/product-white-tee.png' },
  { label: 'Худи', href: '/catalog?category=hoodies', image: '/products/product-soft-hoodie.png' },
  { label: 'Верхняя одежда', href: '/catalog?category=outerwear', image: '/home/coming-card.png' },
] as const;

function Device({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid justify-items-center gap-3">
      <h2 className="text-sm font-bold tracking-[.08em] text-ink-muted">{title}</h2>
      <div className="w-[360px] overflow-hidden rounded-[32px] border-[7px] border-ink bg-surface shadow-[0_24px_72px_hsl(220_12%_10%_/_0.18)]">
        <div className="flex h-7 items-center justify-center bg-ink"><span className="h-1.5 w-16 rounded-full bg-white/70" /></div>
        <div className="relative h-[710px]">{children}</div>
      </div>
    </section>
  );
}

function TopBar({ dark = false }: { dark?: boolean }) {
  const color = dark ? 'text-white' : 'text-ink';
  const ring = dark ? 'border-white/20 bg-white/10' : 'border-line bg-surface';
  return (
    <div className="flex items-center justify-between px-5 pt-5">
      <span className={`font-display text-[29px] font-bold tracking-[-.08em] ${color}`}>Ritm</span>
      <div className="flex items-center gap-2">
        <span className={`grid h-9 w-9 place-items-center rounded-full border ${ring}`}><Heart className={`h-[17px] w-[17px] ${color}`} /></span>
        <span className={`grid h-9 w-9 place-items-center rounded-full border ${ring}`}><ShoppingBag className={`h-[17px] w-[17px] ${color}`} /></span>
      </div>
    </div>
  );
}

function EditorialIndex() {
  return (
    <Device title="01 / EDITORIAL INDEX">
      <div className="h-full bg-[hsl(42_30%_97%)] text-ink">
        <TopBar />
        <div className="mx-5 mt-7 border-y border-line py-3 text-[11px] font-bold tracking-[.16em] text-ink-muted">МЕНЮ / RITM</div>
        <nav className="px-5" aria-label="Прототип editorial index">
          {menu.map(([label, href], index) => (
            <a key={href} href={href} className="group flex items-center justify-between border-b border-line py-5">
              <span className="flex items-baseline gap-3"><b className="font-mono text-xs text-ink-muted">0{index + 1}</b><span className="font-display text-[27px] font-bold tracking-[-.05em]">{label}</span></span>
              <ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          ))}
        </nav>
        <a href="/catalog" className="absolute inset-x-5 bottom-5 overflow-hidden rounded-[18px] bg-ink text-white">
          <Image src="/home/hero-slide-2.png" alt="Коллекция Ritm" fill sizes="320px" className="object-cover opacity-55" />
          <span className="relative flex min-h-[115px] items-end justify-between p-4 font-display text-xl font-bold">Смотреть каталог <ArrowUpRight className="h-5 w-5" /></span>
        </a>
      </div>
    </Device>
  );
}

function CapsuleTiles() {
  return (
    <Device title="02 / CAPSULE TILES">
      <div className="h-full bg-surface text-ink">
        <TopBar />
        <div className="mx-5 mt-6 flex items-center justify-between">
          <h3 className="font-display text-[30px] font-bold leading-[.95] tracking-[-.06em]">Выберите<br />настроение</h3>
          <span className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface-soft"><Search className="h-[18px] w-[18px]" /></span>
        </div>
        <nav className="grid grid-cols-2 gap-3 px-5 pt-6" aria-label="Прототип capsule tiles">
          {categories.map((category, index) => (
            <a key={category.href} href={category.href} className={`group relative overflow-hidden rounded-[20px] bg-surface-soft ${index === 0 ? 'col-span-2 h-[180px]' : 'h-[205px]'}`}>
              <Image src={category.image} alt={category.label} fill sizes={index === 0 ? '320px' : '155px'} className="object-cover transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/5 to-transparent" />
              <span className="absolute inset-x-3 bottom-3 flex items-center justify-between text-[19px] font-bold text-white"><span>{category.label}</span><ArrowUpRight className="h-5 w-5" /></span>
            </a>
          ))}
        </nav>
        <div className="absolute inset-x-5 bottom-5 flex items-center justify-between rounded-full border border-line bg-surface px-4 py-3 text-sm font-semibold">
          <span>Все модели и фильтры</span><ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
    </Device>
  );
}

function CampaignPanel() {
  return (
    <Device title="03 / CAMPAIGN PANEL">
      <div className="relative h-full overflow-hidden bg-footer text-white">
        <Image src="/home/hero-slide-4.png" alt="Коллекция Ritm" fill sizes="360px" className="object-cover opacity-45" />
        <span className="absolute inset-0 bg-[linear-gradient(180deg,hsl(220_16%_9%/0.18),hsl(220_16%_9%/0.9)_54%,hsl(220_16%_9%))]" />
        <div className="relative h-full">
          <TopBar dark />
          <div className="mx-5 mt-9 flex items-center justify-between border-y border-white/25 py-3 text-[11px] font-bold tracking-[.14em] text-white/70"><span>RITM / SS26</span><X className="h-4 w-4" /></div>
          <nav className="mt-5 px-5" aria-label="Прототип campaign panel">
            {menu.map(([label, href]) => (
              <a key={href} href={href} className="flex items-center justify-between border-b border-white/18 py-[15px] font-display text-[25px] font-bold tracking-[-.05em]">
                {label}<ArrowUpRight className="h-5 w-5" />
              </a>
            ))}
          </nav>
          <div className="absolute inset-x-5 bottom-6">
            <p className="max-w-[25ch] text-sm leading-[1.55] text-white/75">Капсула на каждый день. Свободный силуэт, спокойная палитра, вещи для долгой носки.</p>
            <a href="/catalog" className="mt-4 flex items-center justify-between rounded-full bg-white px-5 py-4 text-sm font-bold text-ink">Открыть каталог <ArrowUpRight className="h-5 w-5" /></a>
            <a href="/profile" className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-white/78"><UserRound className="h-4 w-4" />Профиль</a>
          </div>
        </div>
      </div>
    </Device>
  );
}

export default function MobileMenuPrototypesPage() {
  return (
    <main className="min-h-screen bg-[hsl(42_20%_94%)] px-5 py-12 text-ink">
      <div className="mx-auto max-w-[1180px]">
        <p className="text-xs font-bold tracking-[.16em] text-ink-muted">RITM / MOBILE MENU STUDY</p>
        <h1 className="mt-3 max-w-[15ch] font-display text-[40px] font-bold leading-[.95] tracking-[-.06em] sm:text-[56px]">Три новых входа в каталог.</h1>
        <p className="mt-5 max-w-[58ch] text-sm leading-[1.65] text-ink-muted">Прототипы используют реальные разделы и визуальные материалы RITM. Страница нужна только для выбора направления.</p>
        <div className="mt-12 grid gap-12 lg:grid-cols-3 lg:gap-7">
          <EditorialIndex />
          <CapsuleTiles />
          <CampaignPanel />
        </div>
      </div>
    </main>
  );
}
