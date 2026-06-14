import 'dotenv/config';
import { Telegraf } from 'telegraf';
import { supabase } from './lib/supabase';
import { startHandler } from './handlers/start';
import { adminHandler } from './handlers/admin';
import { myOrdersHandler } from './handlers/myorders';

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
    const { error } = await supabase
      .from('reviews')
      .update({
        rating,
        submitted_at: new Date().toISOString(),
      })
      .eq('order_id', orderId);

    if (error) {
      console.error('[review callback] update error:', error);
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
