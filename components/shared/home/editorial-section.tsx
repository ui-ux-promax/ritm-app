import Image from 'next/image';

export function EditorialSection() {
  return (
    <section className="mx-auto max-w-[1240px] px-4 sm:px-6 pb-14 md:pb-20">
      <div className="grid md:grid-cols-[1.18fr_0.82fr] gap-5">
        {/* Image card */}
        <figure className="rounded-[16px] overflow-hidden bg-surface-soft">
          <div className="relative h-[280px] md:h-[450px]">
            <Image
              src="/home/collection-rail.png"
              alt="Рейл с пальто, куртками и сумками новой коллекции"
              fill
              sizes="(max-width: 768px) 100vw, 58vw"
              className="object-cover"
            />
          </div>
          <figcaption className="p-6 md:p-7 bg-surface-soft">
            <h3 className="font-display font-bold italic text-[22px] md:text-[31px] leading-tight">Откройте безлимитность</h3>
            <p className="mt-2 text-ink-muted text-sm">Переосмысление новых fashion-трендов</p>
          </figcaption>
        </figure>
        {/* Coming card */}
        <article className="rounded-[16px] bg-surface-soft overflow-hidden p-8 md:p-12 flex flex-col justify-between min-h-[420px] md:min-h-[575px]">
          <div>
            <h3 className="font-display font-bold italic text-[22px] md:text-[31px] leading-tight">Держитесь, новый продукт уже близко!</h3>
            <p className="mt-2 text-ink-muted text-sm">Приносим новую эру простых и выразительных вещей.</p>
          </div>
          <div className="self-center w-full max-w-[440px] mt-8 rounded-[22px] overflow-hidden bg-surface shadow-lg">
            <div className="relative h-[260px] md:h-[300px]">
              <Image
                src="/home/coming-card.png"
                alt="Превью новой одежды 2026 года"
                fill
                sizes="(max-width: 768px) 100vw, 42vw"
                className="object-cover"
              />
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}