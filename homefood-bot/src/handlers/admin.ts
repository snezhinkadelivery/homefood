import type { Context } from 'telegraf';
import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';

export async function adminHandler(ctx: Context): Promise<void> {
  const from = ctx.from;
  if (!from) return;

  const rawIds = process.env.ADMIN_TG_IDS ?? '';
  const adminIds = rawIds.split(',').map((id) => Number(id.trim())).filter(Boolean);
  if (!adminIds.includes(from.id)) return;

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('[admin] JWT_SECRET not set');
    await ctx.reply('❌ Сервер не настроен. Свяжитесь с админом.');
    return;
  }

  const hash = createHash('sha256').update(secret).digest('hex').slice(0, 12);
  console.log(`[admin] signing JWT, secret length=${secret.length} sha256[:12]=${hash} for tg_id=${from.id}`);

  const token = jwt.sign(
    { tg_id: from.id, name: from.first_name ?? '' },
    secret,
    { expiresIn: '30d' },
  );

  const crmUrl = process.env.CRM_URL ?? '';
  const link = `${crmUrl}/login?token=${token}`;

  await ctx.reply('🔐 Ссылка для входа в CRM\nДействует 30 дней:', {
    reply_markup: {
      inline_keyboard: [[{ text: 'Открыть CRM →', url: link }]],
    },
  });
}
