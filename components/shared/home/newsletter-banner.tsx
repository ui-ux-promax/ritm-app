'use client';
import { useEffect, useRef, useState } from 'react';

export function NewsletterBanner() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [discount, setDiscount] = useState(50);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const banner = bannerRef.current;
    if (!banner || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      setDiscount(0);
      const startedAt = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / 1100, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDiscount(Math.round(50 * eased));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.25 });

    observer.observe(banner);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) {
      setStatus('Введите корректный email, чтобы получить доступ к скидке.');
      return;
    }
    setStatus('Готово. Скидка 50% закреплена за этим email.');
    setEmail('');
  };

  return (
    <section className="mx-auto my-8 max-w-[1200px] px-4 sm:px-6 md:my-[52px]">
      <div
        ref={bannerRef}
        data-reveal="up"
        className="grid min-w-0 grid-cols-[minmax(0,1fr)] items-end gap-6 rounded-[22px] p-5 text-white sm:p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] md:gap-11 md:p-12"
        style={{
          background:
            'radial-gradient(circle at 12% 10%, hsl(0 0% 100% / 0.1), transparent 28%), linear-gradient(135deg, hsl(220 12% 10%), hsl(220 12% 10% / 0.78))',
        }}
      >
        <div className="min-w-0">
          <h2 className="font-display font-bold text-[28px] md:text-[45px] leading-[1.05] max-w-[540px]">
            <span className="sr-only">Скидка 50% на все аутфиты. Присоединяйтесь сейчас.</span>
            <span aria-hidden="true">Скидка <span className="tnum" data-testid="discount-counter">{discount}%</span> на все аутфиты. Присоединяйтесь сейчас.</span>
          </h2>
          <form onSubmit={onSubmit} noValidate className="mt-7 grid w-full max-w-[420px] grid-cols-1 gap-1.5 rounded-[18px] bg-surface p-1.5 transition-shadow focus-within:shadow-[0_0_0_2px_hsl(var(--color-surface)),0_0_0_4px_hsl(var(--color-primary))] min-[420px]:grid-cols-[minmax(0,1fr)_auto] min-[420px]:rounded-full">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите ваш email..."
              aria-label="Email для подписки"
              required
              className="min-w-0 border-0 outline-none bg-transparent px-4 text-[13px] text-ink focus-visible:!shadow-none"
            />
            <button
              type="submit"
              className="min-h-[40px] rounded-[14px] bg-primary px-4 text-xs font-bold text-primary-foreground transition-transform duration-200 active:scale-95 motion-reduce:transform-none min-[420px]:min-h-[34px] min-[420px]:rounded-full"
            >
              Подписаться
            </button>
          </form>
          {status && (
            <p className="mt-2.5 text-xs font-semibold text-white/82" aria-live="polite">
              {status}
            </p>
          )}
        </div>
        <p className="text-white/76 text-[13px] leading-[1.7] max-w-[440px]">
          Получите эксклюзивный доступ к ограниченной распродаже: скидка 50% на все аутфиты после регистрации сегодня. Откройте curated collection трендовых и универсальных стилей для любого случая.
        </p>
      </div>
    </section>
  );
}
