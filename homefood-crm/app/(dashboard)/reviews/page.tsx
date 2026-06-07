import { supabaseAdmin } from '@/lib/supabase-admin';
import { ReviewsList, type ReviewItem } from '@/components/reviews/ReviewsList';
import { StarRating } from '@/components/reviews/StarRating';

export const dynamic = 'force-dynamic';

type ReviewWithOrder = {
  id: number;
  rating: number | null;
  submitted_at: string | null;
  created_at: string;
  orders: { order_number: string; customer_name: string } | null;
};

export default async function ReviewsPage() {
  const { data } = await supabaseAdmin
    .from('reviews')
    .select('id, rating, submitted_at, created_at, orders(order_number, customer_name)')
    .order('created_at', { ascending: false });

  const rows = (data ?? []) as unknown as ReviewWithOrder[];

  const reviews: ReviewItem[] = rows.map((r) => ({
    id: r.id,
    order_number: r.orders?.order_number ?? '—',
    customer_name: r.orders?.customer_name ?? '—',
    rating: r.rating,
    submitted_at: r.submitted_at,
    created_at: r.created_at,
  }));

  const submitted = reviews.filter((r) => r.rating !== null);
  const avg =
    submitted.length > 0
      ? submitted.reduce((s, r) => s + (r.rating ?? 0), 0) / submitted.length
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Отзывы</h1>
        <p className="text-sm text-[#64748B]">Оценки клиентов</p>
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
        <p className="text-xs uppercase tracking-wide text-[#64748B]">Средняя оценка</p>
        <div className="mt-2 flex items-center gap-3">
          <StarRating rating={Math.round(avg)} size={22} />
          <span className="text-2xl font-bold text-[#1E293B]">{avg.toFixed(1)}</span>
          <span className="text-sm text-[#64748B]">из {submitted.length} отзывов</span>
        </div>
      </div>

      <ReviewsList reviews={reviews} />
    </div>
  );
}
