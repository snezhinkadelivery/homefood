import { bot } from '../bot';
import { supabase } from '../lib/supabase';
import { reviewKeyboard } from '../lib/keyboards';

type OrderRow = { order_number: string };

export async function sendReviewRequest(orderId: number, userTgId: number): Promise<void> {
  try {
    // ШАГ 1: атомарно занять слот — обновить requested_at только если NULL
    const { data, error: updateError } = await supabase
      .from('reviews')
      .update({ requested_at: new Date().toISOString() })
      .eq('order_id', orderId)
      .is('requested_at', null)
      .select();

    if (updateError) {
      console.error('[reviewRequest] update requested_at error:', updateError);
      return;
    }

    // ШАГ 2: если ничего не обновилось — запрос уже отправлен ранее
    if (!data || data.length === 0) {
      console.log(`[reviewRequest] already sent for order ${orderId}, skip`);
      return;
    }

    // ШАГ 3: получаем номер заказа и отправляем сообщение
    const { data: orderData, error: orderErr } = await supabase
      .from('orders')
      .select('order_number')
      .eq('id', orderId)
      .single();

    if (orderErr || !orderData) {
      console.error('[reviewRequest] fetch order error:', orderErr);
      return;
    }

    const { order_number } = orderData as OrderRow;

    await bot.telegram.sendMessage(
      userTgId,
      `Как вам заказ ${order_number}? ⭐\nВаша оценка очень важна для нас 😊`,
      { reply_markup: reviewKeyboard(orderId) },
    );

    console.log(`[reviewRequest] sent for order ${orderId}`);
  } catch (err) {
    console.error('[reviewRequest] unexpected error:', err);
  }
}

export async function sendReviewReminder(orderId: number, userTgId: number): Promise<void> {
  try {
    // ШАГ 1: атомарно занять слот
    const { data, error: updateError } = await supabase
      .from('reviews')
      .update({ reminded_at: new Date().toISOString() })
      .eq('order_id', orderId)
      .is('reminded_at', null)
      .is('submitted_at', null)
      .select();

    if (updateError) {
      console.error('[reviewReminder] update reminded_at error:', updateError);
      return;
    }

    if (!data || data.length === 0) {
      console.log(`[reviewReminder] already sent or submitted for order ${orderId}, skip`);
      return;
    }

    const { data: orderData, error: orderErr } = await supabase
      .from('orders')
      .select('order_number')
      .eq('id', orderId)
      .single();

    if (orderErr || !orderData) {
      console.error('[reviewReminder] fetch order error:', orderErr);
      return;
    }

    const { order_number } = orderData as OrderRow;

    await bot.telegram.sendMessage(
      userTgId,
      `Вы ещё не оценили заказ ${order_number} 😊\nНам важно ваше мнение — это займёт 5 секунд!`,
      { reply_markup: reviewKeyboard(orderId) },
    );

    console.log(`[reviewReminder] sent for order ${orderId}`);
  } catch (err) {
    console.error('[reviewReminder] unexpected error:', err);
  }
}
