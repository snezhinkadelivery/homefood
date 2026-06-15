import cron from 'node-cron';
import { supabase } from '../lib/supabase';
import { sendReviewRequest, sendReviewReminder } from '../notifications/reviewRequest';

type OrderForRequest = {
  id: number;
  user_tg_id: number;
  reviews: Array<{ id: number; requested_at: string | null; submitted_at: string | null }>;
};

type ReviewForReminder = {
  order_id: number;
  orders: { user_tg_id: number } | { user_tg_id: number }[];
};

async function processReviewRequests(): Promise<void> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('orders')
    .select('id, user_tg_id, updated_at, reviews!inner(id, requested_at, submitted_at)')
    .eq('status', 'completed')
    .is('reviews.requested_at', null)
    .is('reviews.submitted_at', null)
    .lt('updated_at', cutoff);

  if (error) {
    console.error('[reviewCron] requests query error:', error);
    return;
  }

  const orders = (data ?? []) as OrderForRequest[];
  console.log(`[reviewCron] pending first requests: ${orders.length}`);

  for (const order of orders) {
    if (!order.user_tg_id) continue;
    await sendReviewRequest(order.id, order.user_tg_id);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

async function processReviewReminders(): Promise<void> {
  const cutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('reviews')
    .select('order_id, orders!inner(user_tg_id)')
    .not('requested_at', 'is', null)
    .is('reminded_at', null)
    .is('submitted_at', null)
    .lt('requested_at', cutoff);

  if (error) {
    console.error('[reviewCron] reminders query error:', error);
    return;
  }

  const reviews = (data ?? []) as ReviewForReminder[];
  console.log(`[reviewCron] pending reminders: ${reviews.length}`);

  for (const review of reviews) {
    const orders = Array.isArray(review.orders) ? review.orders[0] : review.orders;
    const userTgId = orders?.user_tg_id;
    if (!userTgId) continue;
    await sendReviewReminder(review.order_id, userTgId);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

export function startReviewCron(): void {
  cron.schedule('*/30 * * * *', async () => {
    console.log('[reviewCron] tick', new Date().toISOString());
    try {
      await processReviewRequests();
      await processReviewReminders();
    } catch (err) {
      console.error('[reviewCron] tick error:', err);
    }
  });
  console.log('[reviewCron] scheduled every 30 minutes');
}
