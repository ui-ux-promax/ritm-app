import { FlowingMenu, type FlowingMenuItem } from './flowing-menu';

const journalItems: FlowingMenuItem[] = [
  { link: '/blog', text: 'Новая капсула', image: '/home/blog-arrival.png' },
  { link: '/blog', text: 'Формула многослойности', image: '/home/blog-chic.png' },
  { link: '/blog', text: '5 вещей — 10 образов', image: '/home/collection-rail.png' },
  { link: '/blog', text: 'Материалы и уход', image: '/home/blog-wardrobe.png' },
];

export function EditorialSection() {
  return (
    <section className="pb-14 md:pb-20">
      <div data-reveal="up" className="mx-auto mb-8 max-w-[1240px] px-4 sm:px-6 md:mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Журнал RITM</p>
        <div className="mt-3 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <h2 className="max-w-[720px] font-display text-[32px] font-bold leading-[1.02] md:text-[50px]">
            Одежда в движении
          </h2>
          <p className="max-w-[420px] text-sm leading-relaxed text-ink-muted md:text-right">
            Капсулы, сочетания и уход за вещами — коротко и по делу.
          </p>
        </div>
      </div>

      <div data-reveal="up" data-reveal-delay="1" className="h-[400px] w-full md:h-[520px]">
        <FlowingMenu items={journalItems} speed={15} />
      </div>
    </section>
  );
}
