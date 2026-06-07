import { bot } from '../bot';
import { supabase } from '../lib/supabase';
import { reviewKeyboard } from '../lib/keyboards';

type OrderRow = { order_number: string };

export async function sendReviewRequest(orderId: number, userTgId: number): Promise<void> {
  try {
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('order_number')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      console.error('[reviewRequest] fetch order error:', orderErr);
      return;
    }

    const { order_number } = order as OrderRow;

    await bot.telegram.sendMessage(
      userTgId,
      `Как вам заказ ${order_number}? ⭐\nВаша оценка очень важна для нас 😊`,
      { reply_markup: reviewKeyboard(orderId) },
    );

    const { error: updateErr } = await supabase
      .from('reviews')
      .update({ requested_at: new Date().toISOString() })
      .eq('order_id', orderId);

    if (updateErr) {
      console.error('[reviewRequest] update requested_at error:', updateErr);
    }
  } catch (err) {
    console.error('[reviewRequest] unexpected error:', err);
  }
}

export async function sendReviewReminder(orderId: number, userTgId: number): Promise<void> {
  try {
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('order_number')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      console.error('[reviewReminder] fetch order error:', orderErr);
      return;
    }

    const { order_number } = order as OrderRow;

    await bot.telegram.sendMessage(
      userTgId,
      `Вы ещё не оценили заказ ${order_number} 😊\nНам важно ваше мнение — это займёт 5 секунд!`,
      { reply_markup: reviewKeyboard(orderId) },
    );

    const { error: updateErr } = await supabase
      .from('reviews')
      .update({ reminded_at: new Date().toISOString() })
      .eq('order_id', orderId);

    if (updateErr) {
      console.error('[reviewReminder] update reminded_at error:', updateErr);
    }
  } catch (err) {
    console.error('[reviewReminder] unexpected error:', err);
  }
}
