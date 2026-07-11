'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export function LandingMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion || !('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      root.classList.add('motion-ready');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    items.forEach((item) => {
      if (item.getBoundingClientRect().top < window.innerHeight * 0.92) item.classList.add('is-visible');
      else observer.observe(item);
    });
    root.classList.add('motion-ready');

    return () => observer.disconnect();
  }, []);

  return <div ref={rootRef} className="landing-motion" data-testid="landing-motion">{children}</div>;
}
