import Link from 'next/link';
import Image from 'next/image';

export function Hero() {
  return (
    <section className="mx-auto max-w-[1240px] px-4 sm:px-6 pt-6">
      <div className="rounded-[28px] overflow-hidden relative" style={{ background: 'linear-gradient(120deg, hsl(var(--color-accent) / 0.45), hsl(var(--color-surface-soft)))' }}>
        <div className="grid md:grid-cols-2 items-center">
          <div className="order-2 md:order-1 p-8 sm:p-12 min-w-0">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-primary text-primary-foreground">
              Новая коллекция
            </span>
            <h1 className="font-display font-bold text-[44px] sm:text-[64px] lg:text-[80px] leading-[0.92] mt-4">Одежда на<br />каждый день</h1>
            <p className="text-ink/70 max-w-sm mt-4">Футболки, худи и легкие слои RITM для города. Мягкие ткани, спокойные цвета и свободная посадка без лишнего шума.</p>
            <div className="flex flex-wrap gap-2.5 mt-6">
              <Link href="/catalog" className="btn btn-lg btn-dark">Смотреть каталог</Link>
              <Link href="/catalog?sort=new" className="btn btn-lg btn-secondary">Новинки</Link>
            </div>
          </div>
          <div className="order-1 md:order-2 relative h-64 sm:h-80 md:h-[480px]">
            <Image src="/products/product-white-tee.png" alt="RITM — одежда новой коллекции" fill className="object-contain p-6 md:p-8 drop-shadow-2xl" priority />
          </div>
        </div>
      </div>
    </section>
  );
}