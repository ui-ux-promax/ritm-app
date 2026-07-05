'use client';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useState } from 'react';

export function HeaderSearch() {
  const router = useRouter();
  const [q, setQ] = useState('');
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); router.push(q.trim() ? `/catalog?q=${encodeURIComponent(q.trim())}` : '/catalog'); }}
      className="hidden sm:flex items-center gap-2 rounded-full border border-line bg-surface px-3 h-10 w-44 lg:w-56"
    >
      <Search className="w-4 h-4 text-ink-muted" aria-hidden />
      <label className="sr-only" htmlFor="hsearch">Поиск одежды</label>
      <input id="hsearch" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск одежды" className="bg-transparent text-sm outline-none w-full" />
    </form>
  );
}
