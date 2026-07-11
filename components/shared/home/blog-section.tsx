import Image from 'next/image';

const posts = [
  { img: '/home/blog-arrival.png', tag: 'Тренды', title: 'Новый сезон: как носить многослойность', date: '02.07.2026' },
  { img: '/home/blog-chic.png', tag: 'Гардероб', title: 'Капсула на неделю: 5 вещей, 10 образов', date: '28.06.2026' },
  { img: '/home/blog-wardrobe.png', tag: 'Гайд', title: 'Уход за хлопком: просто и надолго', date: '20.06.2026' },
];

export function BlogSection() {
  return (
    <section className="mx-auto max-w-[1240px] px-4 sm:px-6 pt-16 md:pt-[78px] pb-16 md:pb-20">
      <div data-reveal="up" className="text-center max-w-[760px] mx-auto mb-10">
        <h2 className="font-display font-bold text-[28px] md:text-[42px] leading-[1.05]">Журнал RITM</h2>
        <p className="mt-3 text-ink-muted text-[15px] leading-[1.6]">
          Истории о стиле, уходе и новой одежде. Читайте, выбирайте, собирайте свой гардероб осознанно.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <div key={post.title} data-reveal="up" data-reveal-delay={index + 1}>
            <article className="rounded-[16px] overflow-hidden bg-surface border border-line transition-[transform,box-shadow] duration-200 [transition-timing-function:cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 hover:shadow-[0_18px_45px_hsl(220_12%_10%_/.08)] motion-reduce:transform-none">
              <div className="relative h-[220px] md:h-[260px]">
                <Image src={post.img} alt={post.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
              </div>
              <div className="p-5">
                <span className="inline-block text-[11px] font-semibold uppercase tracking-wide text-accent">{post.tag}</span>
                <h3 className="font-display font-bold text-[18px] mt-1.5 leading-tight">{post.title}</h3>
                <p className="text-xs text-ink-muted mt-2 tnum">{post.date}</p>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
