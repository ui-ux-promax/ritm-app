import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — RITM',
  description: 'Часто задаваемые вопросы о заказах, доставке и возврате RITM.',
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-4 sm:px-6 py-24">
      <div className="text-center">
        <h1 className="font-display font-bold text-[32px] sm:text-[44px]">FAQ</h1>
        <p className="text-ink-muted mt-4 text-lg">Раздел заполняется. Если есть вопросы — напишите нам.</p>
      </div>
    </div>
  );
}