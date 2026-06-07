import cron from 'node-cron';
import { supabase } from '../lib/supabase';
import { sendReviewRequest, sendReviewReminder } from '../notifications/reviewRequest';

type PendingReview = { id: number; user_tg_id: number };

async function runReviewRequests(): Promise<void> {
  try {
    // Заказы завершены, отзыв ещё не запрашивался, прошло 24 часа
    const { data, error } = await supabase
      .from('orders')
      .select('id, user_tg_id, reviews!left(id, requested_at, submitted_at)')
      .eq('status', 'completed')
      .lt('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('[reviewCron] requests query error:', error);
      return;
    }

    type OrderWithReview = {
      id: number;
      user_tg_id: number;
      reviews: Array<{ id: number; requested_at: string | null; submitted_at: string | null }>;
    };

    const orders = (data ?? []) as OrderWithReview[];
    const pending: PendingReview[] = orders.filter((o) => {
      const review = o.reviews?.[0];
      return !review || (!review.requested_at && !review.submitted_at);
    });

    console.log(`[reviewCron] pending first requests: ${pending.length}`);

    for (const order of pending) {
      if (order.user_tg_id) {
        await sendReviewRequest(order.id, order.user_tg_id);
      }
    }
  } catch (err) {
    console.error('[reviewCron] runReviewRequests error:', err);
  }
}

async function runReviewReminders(): Promise<void> {
  try {
    // Запрос был отправлен, напоминание ещё нет, прошло 3 дня, отзыв не получен
    const { data, error } = await supabase
      .from('orders')
      .select('id, user_tg_id, reviews!inner(requested_at, reminded_at, submitted_at)')
      .eq('status', 'completed')
      .not('reviews.requested_at', 'is', null)
      .is('reviews.reminded_at', null)
      .is('reviews.submitted_at', null)
      .lt('reviews.requested_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('[reviewCron] reminders query error:', error);
      return;
    }

    const orders = (data ?? []) as PendingReview[];
    console.log(`[reviewCron] pending reminders: ${orders.length}`);

    for (const order of orders) {
      if (order.user_tg_id) {
        await sendReviewReminder(order.id, order.user_tg_id);
      }
    }
  } catch (err) {
    console.error('[reviewCron] runReviewReminders error:', err);
  }
}

export function startReviewCron(): void {
  cron.schedule('*/30 * * * *', async () => {
    console.log('[reviewCron] tick', new Date().toISOString());
    await runReviewRequests();
    await runReviewReminders();
  });
  console.log('[reviewCron] scheduled every 30 minutes');
}
