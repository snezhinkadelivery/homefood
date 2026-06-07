import type { Context } from 'telegraf';
import { randomUUID } from 'crypto';
import { supabase } from '../lib/supabase';

export async function adminHandler(ctx: Context): Promise<void> {
  const from = ctx.from;
  if (!from) return;

  const rawIds = process.env.ADMIN_TG_IDS ?? '';
  const adminIds = rawIds.split(',').map((id) => Number(id.trim())).filter(Boolean);

  if (!adminIds.includes(from.id)) return;

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  try {
    const { error } = await supabase.from('admin_tokens').insert({
      token,
      expires_at: expiresAt,
      used: false,
    });
    if (error) throw error;
  } catch (err) {
    console.error('[admin] insert token error:', err);
    await ctx.reply('❌ Не удалось создать токен. Попробуйте ещё раз.');
    return;
  }

  const crmUrl = process.env.CRM_URL ?? '';
  const link = `${crmUrl}/login?token=${token}`;

  await ctx.reply('🔐 Ссылка для входа в CRM\nДействует 1 час:', {
    reply_markup: {
      inline_keyboard: [[{ text: 'Открыть CRM →', url: link }]],
    },
  });
}
