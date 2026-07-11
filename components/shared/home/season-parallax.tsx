'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

export function SeasonParallax() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const image = imageRef.current;
    if (!container || !image) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) return;

    let frame: number | null = null;

    const update = () => {
      frame = null;
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      if (rect.bottom < 0 || rect.top > viewportHeight) return;

      const progress = Math.min(
        1,
        Math.max(0, (viewportHeight - rect.top) / (viewportHeight + rect.height)),
      );
      const offset = (progress - 0.5) * rect.height * 0.22;
      image.style.setProperty('--season-parallax-y', `${offset.toFixed(2)}px`);
    };

    const requestUpdate = () => {
      if (frame === null) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      data-reveal="scale"
      className="relative min-h-[280px] w-screen overflow-hidden md:min-h-[390px]"
      style={{ marginLeft: 'calc(50% - 50vw)' }}
    >
      <Image
        ref={imageRef}
        src="/home/season-collage.png"
        alt="Коллаж сезона RITM"
        fill
        sizes="100vw"
        className="season-parallax-image object-cover"
      />
      <div className="absolute bottom-7 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/35 bg-ink/72 px-4 py-2 text-white shadow-xl backdrop-blur-md">
        <span className="font-mono text-[10px] font-bold tracking-[.18em]">RITM / SS26</span>
        <span className="h-1 w-1 rounded-full bg-accent" />
        <span className="hidden text-[11px] text-white/72 sm:inline">Лимитированная коллекция</span>
      </div>
    </div>
  );
}
