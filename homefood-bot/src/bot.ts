import 'dotenv/config';
import { Telegraf } from 'telegraf';
import { supabase } from './lib/supabase';
import { startHandler } from './handlers/start';
import { adminHandler } from './handlers/admin';
import { myOrdersHandler } from './handlers/myorders';
import { getAdminStatusKeyboard, syncAdminOrderMessages } from './notifications/adminOrderMessages';

const token = process.env.BOT_TOKEN;
if (!token) throw new Error('BOT_TOKEN is required');

export const bot = new Telegraf(token);

// /start
bot.command('start', startHandler);

// /admin
bot.command('admin', adminHandler);

// /myorders
bot.command('myorders', myOrdersHandler);

// Оценка отзыва: review_ORDERID_RATING
bot.action(/^review_(\d+)_([1-5])$/, async (ctx) => {
  const match = ctx.match;
  const orderId = Number(match[1]);
  const rating = Number(match[2]);

  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        rating,
        submitted_at: new Date().toISOString(),
      })
      .eq('order_id', orderId)
      .is('submitted_at', null)
      .select();

    if (error) {
      console.error('[review callback] update error:', error);
      await ctx.answerCbQuery('Ошибка сохранения');
      return;
    }

    if (!data || data.length === 0) {
      await ctx.answerCbQuery('Вы уже оценили этот заказ');
      try { await ctx.editMessageReplyMarkup(undefined); } catch {}
      return;
    }
  } catch (err) {
    console.error('[review callback] unexpected error:', err);
  }

  try {
    await ctx.answerCbQuery('Оценка сохранена!');
    await ctx.editMessageReplyMarkup(undefined);
    await ctx.reply('Спасибо за оценку! 🙏');
  } catch (err) {
    console.error('[review callback] reply error:', err);
  }
});

// Смена статуса заказа из уведомления: status_ORDERID_NEWSTATUS
bot.action(/^status_(\d+)_(.+)$/, async (ctx) => {
  const orderId = Number(ctx.match[1]);
  const newStatus = ctx.match[2] as 'on_way' | 'completed';
  const callbackMessage =
    ctx.callbackQuery && 'message' in ctx.callbackQuery ? ctx.callbackQuery.message : undefined;
  const currentAdminMessage = callbackMessage
    ? { chatId: callbackMessage.chat.id, messageId: callbackMessage.message_id }
    : undefined;

  async function editCurrentAdminKeyboard(status: 'accepted' | 'on_way' | 'completed'): Promise<void> {
    try {
      await ctx.editMessageReplyMarkup(getAdminStatusKeyboard(orderId, status));
    } catch (err) {
      console.error('[status callback] current message edit error:', err);
    }
  }

  try {
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      console.error('[status callback] fetch order error:', orderErr);
      await ctx.answerCbQuery('Заказ не найден');
      return;
    }

    const currentStatus = order.status as 'accepted' | 'on_way' | 'completed';
    const isAllowedTransition =
      (currentStatus === 'accepted' && newStatus === 'on_way') ||
      (currentStatus === 'on_way' && newStatus === 'completed');

    if (currentStatus === newStatus || !isAllowedTransition) {
      await editCurrentAdminKeyboard(currentStatus);
      await syncAdminOrderMessages(orderId, currentStatus, bot.telegram, currentAdminMessage);
      await ctx.answerCbQuery('Статус уже изменён');
      return;
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      console.error('[status callback] update error:', error);
      await ctx.answerCbQuery('Ошибка обновления статуса');
      return;
    }

    await supabase
      .from('order_status_history')
      .insert({ order_id: orderId, status: newStatus })
      .then(() => {}, (e) => console.error('[status callback] history insert error:', e));

    const { sendStatusNotification } = await import('./notifications/statusChanged');
    await sendStatusNotification(orderId, newStatus);
    await editCurrentAdminKeyboard(newStatus);
    await syncAdminOrderMessages(orderId, newStatus, bot.telegram, currentAdminMessage);

    if (newStatus === 'on_way') {
      await ctx.answerCbQuery('Статус: В пути');
    } else if (newStatus === 'completed') {
      await ctx.answerCbQuery('Статус: Доставлен');
    } else {
      await ctx.answerCbQuery('Статус обновлён');
    }
  } catch (err) {
    console.error('[status callback] unexpected error:', err);
    try { await ctx.answerCbQuery('Ошибка'); } catch {}
  }
});

// Копирование номера счёта: copy_account_НОМЕР
bot.action(/^copy_account_(.+)$/, async (ctx) => {
  const account = ctx.match[1];
  try {
    await ctx.answerCbQuery(account, { show_alert: false });
  } catch (err) {
    console.error('[copy_account callback] error:', err);
  }
});

// Глобальный обработчик ошибок
bot.catch((err, ctx) => {
  console.error(`[bot] error for ${ctx.updateType}:`, err);
});

export default bot;
