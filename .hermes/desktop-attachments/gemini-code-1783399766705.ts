'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface GalleryImage {
  url: string;
  alt: string;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  productName: string;
  activeIdx: number;
  onSelectIndex: (idx: number) => void;
}

export function ProductGallery({ images, productName, activeIdx, onSelectIndex }: ProductGalleryProps) {
  if (!images.length) return null;

  return (
    <div className="grid grid-cols-2 gap-3" role="list" aria-label="Фотографии модели">
      {images.map((img, i) => {
        // Layout requirement: the last image spans full width if odd, or an explicitly designated wide frame slot.
        const isWide = i === images.length - 1 && i % 2 === 0;

        return (
          <button
            key={i}
            type="button"
            className={cn(
              'group relative overflow-hidden rounded-[18px] border border-line bg-surface-soft transition-all duration-300',
              isWide ? 'col-span-2 aspect-[1.74/1]' : 'aspect-[1/1.08]',
              i === activeIdx ? 'border-neutral-900 shadow-[0_0_0_1px_#111827]' : 'hover:border-neutral-900/30'
            )}
            onClick={() => onSelectIndex(i)}
            aria-current={i === activeIdx}
            aria-label={`Фото ${i + 1}`}
          >
            <Image
              src={img.url}
              alt={img.alt || `${productName} - фото ${i + 1}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(min-width: 1024px) 300px, 50vw"
            />
          </button>
        );
      })}
    </div>
  );
}