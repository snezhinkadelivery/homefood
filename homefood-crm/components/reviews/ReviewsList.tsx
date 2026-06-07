'use client';

import { useMemo, useState } from 'react';
import { StarRating } from './StarRating';
import { formatDate } from '@/lib/utils';

export type ReviewItem = {
  id: number;
  order_number: string;
  customer_name: string;
  rating: number | null;
  submitted_at: string | null;
  created_at: string;
};

const FILTERS: { value: 'all' | 1 | 2 | 3 | 4 | 5; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 5, label: '5 ⭐' },
  { value: 4, label: '4 ⭐' },
  { value: 3, label: '3 ⭐' },
  { value: 2, label: '2 ⭐' },
  { value: 1, label: '1 ⭐' },
];

export function ReviewsList({ reviews }: { reviews: ReviewItem[] }) {
  const [filter, setFilter] = useState<'all' | 1 | 2 | 3 | 4 | 5>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return reviews;
    return reviews.filter((r) => r.rating === filter);
  }, [reviews, filter]);

  return (
    <div className="space-y-4">
      <div className="inline-flex flex-wrap rounded-lg border border-[#E2E8F0] bg-white p-1">
        {FILTERS.map((f) => (
          <button
            key={String(f.value)}
            type="button"
            onClick={() => setFilter(f.value)}
            className={
              'rounded-md px-3 py-1 text-sm font-medium transition ' +
              (filter === f.value
                ? 'bg-[#2563EB] text-white'
                : 'text-[#64748B] hover:text-[#1E293B]')
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => (
          <div key={r.id} className="rounded-xl border border-[#E2E8F0] bg-white p-4">
            <div className="flex items-center justify-between">
              {r.rating ? (
                <StarRating rating={r.rating} />
              ) : (
                <span className="text-xs font-medium text-[#94A3B8]">Ожидает оценки</span>
              )}
              <span className="text-xs font-semibold text-[#2563EB]">{r.order_number}</span>
            </div>
            <p className="mt-3 text-sm font-medium text-[#1E293B]">{r.customer_name}</p>
            <p className="mt-1 text-xs text-[#64748B]">
              {r.submitted_at ? formatDate(r.submitted_at) : formatDate(r.created_at)}
            </p>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border border-[#E2E8F0] bg-white p-8 text-center text-sm text-[#64748B]">
            Отзывов нет
          </div>
        )}
      </div>
    </div>
  );
}
