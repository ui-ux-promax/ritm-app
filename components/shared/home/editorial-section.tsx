import { FlowingMenu, type FlowingMenuItem } from './flowing-menu';

const journalItems: FlowingMenuItem[] = [
  { link: '/blog', text: 'Капсула на каждый день', image: '/home/blog-arrival.png' },
  { link: '/blog', text: 'Как носить многослойность', image: '/home/blog-chic.png' },
  { link: '/blog', text: 'Пропорции и силуэт', image: '/home/collection-rail.png' },
  { link: '/blog', text: 'Уход за материалами', image: '/home/blog-wardrobe.png' },
];

export function EditorialSection() {
  return (
    <section className="mx-auto max-w-[1240px] px-4 pb-14 sm:px-6 md:pb-20">
      <div data-reveal="up" className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Журнал RITM</p>
          <h2 className="mt-2 font-display text-[28px] font-bold leading-none md:text-[38px]">Читайте в RITM</h2>
        </div>
        <p className="max-w-[430px] text-sm leading-relaxed text-ink-muted md:text-right">
          Практичные заметки о сочетаниях, пропорциях и уходе за одеждой.
        </p>
      </div>

      <div
        data-reveal="up"
        data-reveal-delay="1"
        className="h-[280px] overflow-hidden rounded-[16px] border border-ink/10 md:h-[340px]"
      >
        <FlowingMenu items={journalItems} speed={14} />
      </div>
    </section>
  );
}
