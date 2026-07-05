import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Блог — RITM',
  description: 'Скоро здесь будут статьи о стиле, новинках и коллекциях RITM.',
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-4 sm:px-6 py-24">
      <div className="text-center">
        <h1 className="font-display font-bold text-[32px] sm:text-[44px]">Блог</h1>
        <p className="text-ink-muted mt-4 text-lg">Скоро будет интересно. Следите за обновлениями.</p>
      </div>
    </div>
  );
}