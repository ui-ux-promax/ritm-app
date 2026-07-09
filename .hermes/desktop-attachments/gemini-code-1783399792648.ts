'use client';

import { RatingStars } from './rating-stars';
import type { ReviewItem } from './review-list';

interface ReviewsSectionProps {
  reviews: ReviewItem[];
  count: number;
}

export function ReviewsSection({ reviews, count }: ReviewsSectionProps) {
  return (
    <div className="border border-line rounded-[24px] bg-surface p-[22px]">
      <div className="flex items-center justify-between pb-4 border-b border-line">
        <h3 className="font-display font-extrabold text-xl text-ink">
          Отзывы <span className="text-ink-muted font-normal text-lg ml-0.5">({count})</span>
        </h3>
        <a href="#reviews-all" className="text-sm font-semibold text-ink underline decoration-line underline-offset-4 hover:text-ink-muted transition-colors">
          Смотреть все
        </a>
      </div>

      {count === 0 ? (
        <p className="text-sm text-ink-muted py-6 text-center">У этого товара пока нет отзывов.</p>
      ) : (
        <div className="divide-y divide-line">
          {reviews.slice(0, 3).map((rev) => {
            // Generate deterministic soft background hashes for decorative profile frames
            const charCode = rev.authorName.charCodeAt(0) || 65;
            const bgHue = (charCode * 7) % 360;
            const avatarBg = `hsl(${bgHue} 45% 42%)`;

            return (
              <div key={rev.id} className="py-4 first:pt-3 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-white font-extrabold text-sm uppercase shrink-0"
                      style={{ backgroundColor: avatarBg }}
                    >
                      {rev.authorName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-ink text-sm leading-tight">{rev.authorName}</p>
                      <p className="text-xs text-ink-muted mt-0.5 tnum">
                        {new Date(rev.createdAt).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <RatingStars value={rev.rating} size={13} />
                  </div>
                </div>
                <p className="mt-3 text-[13.5px] text-ink-muted leading-[1.6] text-wrap-pretty">
                  {rev.body}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}