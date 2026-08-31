import type { Context } from 'telegraf';
import { supabase } from '../lib/supabase';

export async function startHandler(ctx: Context): Promise<void> {
  const from = ctx.from;
  if (!from) return;

  try {
    await supabase.from('users').upsert(
      {
        tg_id: from.id,
        username: from.username ?? null,
        first_name: from.first_name ?? null,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: 'tg_id' },
    );
  } catch (err) {
    console.error('[start] upsert user error:', err);
  }

  const tmaUrl = process.env.TMA_URL || '';

  await ctx.reply(
    'Добро пожаловать в HomeFood! 🏠\n\nДомашняя еда с доставкой по Корее.\nСвежие блюда прямо к вашей двери 🚀',
    tmaUrl
      ? {
          reply_markup: {
            inline_keyboard: [[{ text: '🍽️ Открыть меню', web_app: { url: tmaUrl } }]],
          },
        }
      : undefined,
  );
}
