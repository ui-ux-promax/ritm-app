'use client';

import { ChevronDown, Truck, CreditCard, ShieldCheck } from 'lucide-react';

interface ProductAccordionsProps {
  description: string | null;
}

export function ProductAccordions({ description }: ProductAccordionsProps) {
  return (
    <div className="mt-4 space-y-0">
      {description && (
        <details className="group border-top border-line" open>
          <summary className="flex items-center justify-between list-none py-[18px] px-[2px] font-extrabold text-base cursor-pointer select-none">
            <span>Описание</span>
            <ChevronDown className="w-4 h-4 transition-transform duration-300 group-open:rotate-180" />
          </summary>
          <div className="pb-4 px-[2px] text-ink-muted text-sm leading-[1.65] text-wrap-pretty">
            <p>{description}</p>
          </div>
        </details>
      )}

      <details className="group border-t border-line">
        <summary className="flex items-center justify-between list-none py-[18px] px-[2px] font-extrabold text-base cursor-pointer select-none">
          <span>Доставка и оплата</span>
          <ChevronDown className="w-4 h-4 transition-transform duration-300 group-open:rotate-180" />
        </summary>
        <div className="pb-4 px-[2px] text-ink-muted text-sm leading-[1.65] space-y-3">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-ink shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-ink">Доставка курьером или в пункты выдачи</p>
              <p>Бесплатная доставка при оплате онлайн для заказов от 5 000 ₽.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-ink shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-ink">Удобные способы оплаты</p>
              <p>Картой на сайте, СБП, долями или наличными/картой при получении.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-ink shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-ink">Простой возврат</p>
              <p>Вы можете вернуть любой товар в течение 14 дней с момента получения.</p>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}