'use client';
import { useState } from 'react';

export function NewsletterBanner() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

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
    <section className="mx-auto max-w-[1200px] px-6 my-8 md:my-[52px]">
      <div
        className="rounded-[22px] text-white p-8 md:p-12 grid md:grid-cols-[1fr_0.9fr] gap-8 md:gap-11 items-end"
        style={{
          background:
            'radial-gradient(circle at 12% 10%, hsl(0 0% 100% / 0.1), transparent 28%), linear-gradient(135deg, hsl(220 12% 10%), hsl(220 12% 10% / 0.78))',
        }}
      >
        <div>
          <h2 className="font-display font-bold text-[28px] md:text-[45px] leading-[1.05] max-w-[540px]">
            Скидка 50% на все аутфиты. Присоединяйтесь сейчас.
          </h2>
          <form onSubmit={onSubmit} noValidate className="mt-7 w-full max-w-[420px] grid grid-cols-[1fr_auto] gap-1.5 bg-surface rounded-full p-1.5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите ваш email..."
              aria-label="Email для подписки"
              required
              className="min-w-0 border-0 outline-none bg-transparent px-4 text-[13px] text-ink"
            />
            <button
              type="submit"
              className="rounded-full bg-primary text-primary-foreground px-4 min-h-[34px] text-xs font-bold"
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