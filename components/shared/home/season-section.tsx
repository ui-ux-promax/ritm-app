import Image from 'next/image';

export function SeasonSection() {
  return (
    <section className="py-16 md:py-[78px] overflow-hidden">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 mb-10">
        <div className="text-center max-w-[720px] mx-auto">
          <h2 className="font-display font-bold text-[32px] md:text-[50px] leading-[1.05]">Сезон в деталях</h2>
          <p className="mt-3 text-ink-muted text-[15px] leading-[1.6]">
            Каждая вещь собрана из тканей, которые носятся легко и долго. Спокойная палитра, чистый силуэт, ничего лишнего.
          </p>
        </div>
      </div>
      <div className="relative min-h-[280px] md:min-h-[390px] w-screen" style={{ marginLeft: 'calc(50% - 50vw)' }}>
        <Image
          src="/home/season-collage.png"
          alt="Коллаж сезона RITM"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute left-1/2 bottom-8 -translate-x-1/2 w-[116px] h-[116px] rounded-full grid place-items-center text-center bg-surface/92 border-2 border-surface shadow-lg">
          <span className="font-mono text-[11px] leading-[1.2] font-bold text-ink">RITM<br />SS26<br />COLLECTION</span>
        </div>
      </div>
    </section>
  );
}