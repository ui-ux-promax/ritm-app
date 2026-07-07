'use client';
import Image from 'next/image';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store';
import type { CartStateItem } from '@/services/dto/cart.dto';

export function CartLineItem({ item }: { item: CartStateItem }) {
  const updateItemQuantity = useCartStore((s) => s.updateItemQuantity);
  const removeCartItem = useCartStore((s) => s.removeCartItem);

  const dec = () => item.quantity > 1 && updateItemQuantity(item.id, item.quantity - 1);
  const inc = () => item.quantity < 99 && updateItemQuantity(item.id, item.quantity + 1);

  return (
    <article className={cn(
      'grid grid-cols-[104px_minmax(0,1fr)_auto] gap-4 border border-line rounded-[24px] bg-surface p-3.5 transition-opacity duration-250 hover:border-ink/16',
      (item.disabled || !item.available) && 'opacity-60'
    )}>
      {/* Media */}
      <div className="w-[104px] h-[116px] rounded-[14px] overflow-hidden bg-surface-soft border border-line">
        {item.imageUrl && (
          <Image src={item.imageUrl} alt={item.name} width={104} height={116} className="w-full h-full object-cover" />
        )}
      </div>

      {/* Body */}
      <div className="min-w-0 flex flex-col gap-2">
        {/* Title + brand */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-display font-bold text-[18px] tracking-tight leading-tight">{item.name}</div>
            <div className="text-ink-muted text-xs mt-0.5">{item.colorwayName} · Размер: {item.size}</div>
          </div>
        </div>

        {/* Attributes */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-soft/70 border border-line text-xs">{item.colorwayName}</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-soft/70 border border-line text-xs">Размер: {item.size}</span>
        </div>

        {/* Stepper + price */}
        <div className="mt-auto flex items-center justify-between gap-3">
          {/* Stepper */}
          <div className="inline-flex items-center border border-line rounded-full bg-surface h-10">
            <button type="button" onClick={dec} disabled={item.quantity <= 1 || item.disabled} aria-label="Меньше" className="w-[38px] h-full grid place-items-center rounded-full hover:bg-surface-soft disabled:opacity-35 disabled:cursor-not-allowed">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14"/></svg>
            </button>
            <span className="min-w-[30px] text-center font-bold tnum text-sm">{item.quantity}</span>
            <button type="button" onClick={inc} disabled={item.disabled} aria-label="Больше" className="w-[38px] h-full grid place-items-center rounded-full hover:bg-surface-soft disabled:opacity-35 disabled:cursor-not-allowed">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <div className="font-display font-bold text-[17px] text-accent tnum tracking-tight">{formatPrice(item.lineTotal)}</div>
            <div className="text-ink-muted text-[11.5px] tnum mt-0.5">{formatPrice(item.unitPrice)} / шт</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button type="button" aria-label="В избранное" className="w-[34px] h-[34px] grid place-items-center rounded-full border border-transparent text-ink-muted hover:text-ink hover:bg-surface-soft transition-colors">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20.5s-7.25-4.45-7.25-10.2A4.35 4.35 0 0 1 12 7.25a4.35 4.35 0 0 1 7.25 3.05C19.25 16.05 12 20.5 12 20.5Z"/></svg>
        </button>
        <button type="button" aria-label="Удалить" onClick={() => removeCartItem(item.id)} className="w-[34px] h-[34px] grid place-items-center rounded-full border border-transparent text-ink-muted hover:text-danger hover:border-danger/40 transition-colors">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/></svg>
        </button>
      </div>
    </article>
  );
}