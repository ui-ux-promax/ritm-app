import Image from 'next/image';

export function SeasonSection() {
  return (
    <section className="py-16 md:py-[78px] overflow-hidden">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 mb-10">
        <div data-reveal="up" className="text-center max-w-[720px] mx-auto">
          <h2 className="font-display font-bold text-[32px] md:text-[50px] leading-[1.05]">Сезон в деталях</h2>
          <p className="mt-3 text-ink-muted text-[15px] leading-[1.6]">
            Каждая вещь собрана из тканей, которые носятся легко и долго. Спокойная палитра, чистый силуэт, ничего лишнего.
          </p>
        </div>
      </div>
      <div data-reveal="scale" className="relative min-h-[280px] md:min-h-[390px] w-screen overflow-hidden" style={{ marginLeft: 'calc(50% - 50vw)' }}>
        <Image
          src="/home/season-collage.png"
          alt="Коллаж сезона RITM"
          fill
          sizes="100vw"
          className="object-cover"
          data-landing-parallax
        />
        <div className="absolute bottom-7 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/35 bg-ink/72 px-4 py-2 text-white shadow-xl backdrop-blur-md">
          <span className="font-mono text-[10px] font-bold tracking-[.18em]">RITM / SS26</span>
          <span className="h-1 w-1 rounded-full bg-accent" />
          <span className="hidden text-[11px] text-white/72 sm:inline">Лимитированная коллекция</span>
        </div>
      </div>
    </section>
  );
}
