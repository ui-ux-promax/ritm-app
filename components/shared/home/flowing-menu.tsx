'use client';

import Link from 'next/link';
import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';

export type FlowingMenuItem = {
  link: string;
  text: string;
  image: string;
};

type FlowingMenuProps = {
  items: FlowingMenuItem[];
  speed?: number;
};

export function FlowingMenu({ items, speed = 15 }: FlowingMenuProps) {
  return (
    <nav aria-label="Материалы журнала RITM" className="flex h-full flex-col overflow-hidden bg-ink text-white">
      {items.map((item) => (
        <FlowingMenuRow key={item.text} item={item} speed={speed} />
      ))}
    </nav>
  );
}

function FlowingMenuRow({ item, speed }: { item: FlowingMenuItem; speed: number }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const setup = () => {
      const part = track.firstElementChild as HTMLElement | null;
      if (!part || part.offsetWidth === 0) return;

      tweenRef.current?.kill();
      gsap.set(track, { x: 0 });
      tweenRef.current = gsap.to(track, {
        x: -part.offsetWidth,
        duration: speed,
        ease: 'none',
        repeat: -1,
        paused: true,
      });
    };

    setup();
    const observer = new ResizeObserver(setup);
    observer.observe(track);

    return () => {
      observer.disconnect();
      tweenRef.current?.kill();
    };
  }, [speed]);

  const reveal = (edge: 'top' | 'bottom') => {
    const marquee = marqueeRef.current;
    const track = trackRef.current;
    if (!marquee || !track) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    tweenRef.current?.play();
    gsap
      .timeline({ defaults: { duration: reduced ? 0 : 0.62, ease: 'expo.out' } })
      .set(marquee, { yPercent: edge === 'top' ? -101 : 101 })
      .set(track, { yPercent: edge === 'top' ? 101 : -101 })
      .to([marquee, track], { yPercent: 0 }, 0);
  };

  const conceal = (edge: 'top' | 'bottom') => {
    const marquee = marqueeRef.current;
    const track = trackRef.current;
    if (!marquee || !track) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsap.to(marquee, {
      yPercent: edge === 'top' ? -101 : 101,
      duration: reduced ? 0 : 0.58,
      ease: 'expo.out',
    });
    gsap.to(track, {
      yPercent: edge === 'top' ? 101 : -101,
      duration: reduced ? 0 : 0.58,
      ease: 'expo.out',
      onComplete: () => tweenRef.current?.pause(),
    });
  };

  const closestEdge = (clientY: number) => {
    const rect = rowRef.current?.getBoundingClientRect();
    if (!rect) return 'bottom' as const;
    return clientY - rect.top < rect.height / 2 ? ('top' as const) : ('bottom' as const);
  };

  return (
    <div ref={rowRef} className="relative min-h-0 flex-1 overflow-hidden border-t border-white/20 first:border-t-0">
      <Link
        href={item.link}
        className="relative z-[1] flex h-full min-h-[64px] items-center justify-center px-5 text-center font-display text-[clamp(1rem,1.8vw,1.6rem)] font-semibold uppercase leading-none tracking-[-0.02em] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white md:min-h-[78px]"
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') reveal(closestEdge(event.clientY));
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === 'mouse') conceal(closestEdge(event.clientY));
        }}
        onFocus={() => reveal('bottom')}
        onBlur={() => conceal('bottom')}
      >
        {item.text}
      </Link>

      <div
        ref={marqueeRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] translate-y-[101%] overflow-hidden bg-surface text-ink"
      >
        <div ref={trackRef} className="flex h-full w-max items-center will-change-transform">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex shrink-0 items-center">
              <span className="whitespace-nowrap px-[1.5vw] font-display text-[clamp(1rem,1.8vw,1.6rem)] font-semibold uppercase leading-none tracking-[-0.02em]">
                {item.text}
              </span>
              <span
                className="mx-[1.2vw] h-[42px] w-[108px] shrink-0 rounded-full bg-cover bg-center md:h-[56px] md:w-[168px]"
                style={{ backgroundImage: `url(${item.image})` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
