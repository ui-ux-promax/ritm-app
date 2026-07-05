import Link from 'next/link';
import Image from 'next/image';

export function Hero() {
  return (
    <section className="mx-auto max-w-[1240px] px-4 sm:px-6 pt-3.5">
      <div
        className="relative rounded-[22px] overflow-hidden min-h-[380px] md:min-h-[604px] flex items-center"
        style={{ isolation: 'isolate' }}
      >
        {/* Background image */}
        <Image
          src="/home/hero-photo.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          aria-hidden
        />
        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, hsl(220 12% 10% / 0.8), hsl(220 12% 10% / 0.28) 48%, hsl(220 12% 10% / 0.1))',
          }}
          aria-hidden
        />
        {/* Content */}
        <div className="relative z-10 w-[70%] max-w-[680px] px-6 md:px-16 text-white">
          <h1 className="font-display font-bold text-[42px] md:text-[64px] leading-[1.05] text-white">Ritm.</h1>
          <p className="mt-4 max-w-[560px] text-[15px] leading-[1.6] font-medium text-white/88">
            Откройте широкий выбор актуальных вещей для повседневного гардероба. Подберите любимый комплект, который отражает ваш стиль и настроение.
          </p>
        </div>
        {/* Arrows — top right */}
        <div className="absolute right-7 top-12 z-10 hidden md:flex gap-2" aria-label="Переключение промо">
          <button type="button" aria-label="Предыдущее промо" className="w-[34px] h-[34px] rounded-full border-0 grid place-items-center text-white" style={{ background: 'hsl(0 0% 100% / 0.22)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button type="button" aria-label="Следующее промо" className="w-[34px] h-[34px] rounded-full border-0 grid place-items-center bg-surface text-ink">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
        {/* CTA — centered bottom */}
        <div className="absolute left-1/2 bottom-12 md:bottom-20 -translate-x-1/2 z-10 grid gap-3 justify-items-center">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-3 rounded-full bg-surface text-ink font-bold pl-7 pr-4 py-3 shadow-[0_18px_45px_hsl(220_12%_10%_/_0.25)] hover:-translate-y-0.5 transition-transform"
          >
            Начать покупки
            <span className="w-[38px] h-[38px] rounded-full bg-primary text-primary-foreground grid place-items-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1"><path d="M7 17 17 7M9 7h8v8"/></svg>
            </span>
          </Link>
          <span className="text-white/72 text-[13px] font-semibold">Топ коллекция</span>
        </div>
      </div>
    </section>
  );
}