'use client';
import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import { FREE_SHIPPING_THRESHOLD } from '@/constants/config';

const SHIP_COST = 390;

export function OrderSummary({ totalAmount, count }: { totalAmount: number; count: number }) {
  const freeShipping = totalAmount >= FREE_SHIPPING_THRESHOLD;
  const shipping = freeShipping ? 0 : SHIP_COST;
  const total = totalAmount + shipping;

  return (
    <div className="lg:sticky lg:top-[140px] border border-line rounded-[24px] bg-surface p-[22px] grid gap-4">
        <h2 className="font-display font-bold text-[19px] tracking-tight">Сумма заказа</h2>

        {/* Promo */}
        <div className="flex gap-2">
          <input type="text" placeholder="Промокод" aria-label="Промокод" className="flex-1 min-w-0 h-[46px] px-3.5 border border-line rounded-[13px] bg-surface text-sm outline-none uppercase placeholder:normal-case placeholder:text-ink-muted/80 hover:border-ink/24 transition-colors" />
          <button type="button" className="h-[46px] px-5 border border-line rounded-[13px] bg-surface-soft font-bold text-[13.5px] whitespace-nowrap hover:border-ink/30 transition-colors">Применить</button>
        </div>

        {/* Summary rows */}
        <div className="grid gap-2.5 border-t border-line pt-4">
          <div className="flex items-center justify-between gap-3 text-sm text-ink-muted">
            <span>Подытог</span>
            <span className="text-ink font-semibold tnum">{formatPrice(totalAmount)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm text-ink-muted">
            <span>Доставка</span>
            <span className={freeShipping ? 'text-accent font-bold tnum' : 'text-ink font-semibold tnum'}>
              {freeShipping ? 'Бесплатно' : formatPrice(shipping)}
            </span>
          </div>
        </div>

        {/* Total */}
        <div className="flex items-baseline justify-between gap-3 border-t border-line pt-4">
          <span className="font-display font-bold text-[17px] tracking-tight">Итого</span>
          <span className="font-display font-bold text-[26px] tnum tracking-tight">{formatPrice(total)}</span>
        </div>

        {/* Checkout button */}
        <Link href="/checkout" className="h-[54px] rounded-full bg-primary text-primary-foreground text-[15px] font-bold inline-flex items-center justify-center gap-2.5 hover:bg-footer transition-colors">
          Оформить заказ
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </Link>

        {/* Note */}
        <div className="flex items-center justify-center gap-2 text-ink-muted text-xs">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="10.5" width="16" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>
          Безопасная оплата · возврат 14 дней
        </div>

        {/* Pay icons */}
        <div className="flex items-center justify-center gap-2 opacity-70">
          <span className="text-[11px] font-bold text-ink-muted tracking-wider px-2 py-0.5 border border-line rounded-md">VISA</span>
          <span className="text-[11px] font-bold text-ink-muted tracking-wider px-2 py-0.5 border border-line rounded-md">MC</span>
          <span className="text-[11px] font-bold text-ink-muted tracking-wider px-2 py-0.5 border border-line rounded-md">МИР</span>
          <span className="text-[11px] font-bold text-ink-muted tracking-wider px-2 py-0.5 border border-line rounded-md">SBP</span>
        </div>
      </div>
  );
}