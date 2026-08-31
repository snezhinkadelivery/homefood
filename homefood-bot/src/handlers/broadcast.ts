import type { Context } from 'telegraf';
import { supabase } from '../lib/supabase';

type BroadcastUser = { tg_id: number };

const pendingMessages = new Set<number>();
const pendingConfirmations = new Map<number, string>();
const BROADCAST_BUTTON_TEXT = 'Заказать за 30 000 ₩';

function broadcastMarkup() {
  const tmaUrl = process.env.TMA_URL?.trim();
  return tmaUrl
    ? { inline_keyboard: [[{ text: BROADCAST_BUTTON_TEXT, web_app: { url: tmaUrl } }]] }
    : undefined;
}

function formatBroadcastText(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/gs, '*$1*');
}

function getBroadcastAdminIds(): number[] {
  return (process.env.BROADCAST_ADMIN_TG_IDS ?? '')
    .split(',')
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isSafeInteger(id) && id > 0);
}

export function isBroadcastAdmin(tgId: number): boolean {
  return getBroadcastAdminIds().includes(tgId);
}

export async function broadcastCommand(ctx: Context): Promise<void> {
  const tgId = ctx.from?.id;
  if (!tgId || !isBroadcastAdmin(tgId)) return;

  pendingMessages.add(tgId);
  pendingConfirmations.delete(tgId);
  await ctx.reply(
    '📣 Рассылка всем зарегистрированным пользователям\n\n' +
      'Пришлите следующим сообщением текст рассылки. Для отмены отправьте /broadcast_cancel.',
  );
}

export async function broadcastCancelCommand(ctx: Context): Promise<void> {
  const tgId = ctx.from?.id;
  if (!tgId || !isBroadcastAdmin(tgId)) return;

  pendingMessages.delete(tgId);
  pendingConfirmations.delete(tgId);
  await ctx.reply('Рассылка отменена.');
}

export async function broadcastTextHandler(ctx: Context): Promise<void> {
  const tgId = ctx.from?.id;
  if (!tgId || !isBroadcastAdmin(tgId) || !pendingMessages.has(tgId)) return;
  if (!ctx.message || !('text' in ctx.message)) return;

  const text = ctx.message.text.trim();
  if (!text || text.startsWith('/')) return;

  pendingMessages.delete(tgId);
  const formattedText = formatBroadcastText(text);
  pendingConfirmations.set(tgId, formattedText);

  const { count, error } = await supabase
    .from('users')
    .select('tg_id', { count: 'exact', head: true });

  if (error) {
    pendingConfirmations.delete(tgId);
    console.error('[broadcast] count users error:', error);
    await ctx.reply('❌ Не удалось определить количество получателей. Рассылка отменена.');
    return;
  }

  await ctx.reply(
    `Проверьте текст рассылки. Получателей: ${count ?? 0}\n\n` +
      formattedText,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '✅ Запустить', callback_data: 'broadcast_confirm' },
          { text: '❌ Отмена', callback_data: 'broadcast_cancel_confirm' },
        ]],
      },
    },
  );
}

export async function broadcastConfirmHandler(ctx: Context): Promise<void> {
  const tgId = ctx.from?.id;
  if (!tgId || !isBroadcastAdmin(tgId)) return;

  const text = pendingConfirmations.get(tgId);
  if (!text) {
    await ctx.answerCbQuery('Нет рассылки для запуска');
    return;
  }

  pendingConfirmations.delete(tgId);
  await ctx.answerCbQuery('Рассылка запущена');
  try { await ctx.editMessageReplyMarkup(undefined); } catch {}

  const { data, error } = await supabase
    .from('users')
    .select('tg_id');

  if (error) {
    await ctx.reply('❌ Не удалось загрузить получателей.');
    console.error('[broadcast] fetch users error:', error);
    return;
  }

  const users = (data ?? []) as BroadcastUser[];
  let sent = 0;
  let failed = 0;

  for (const user of users) {
    try {
      await ctx.telegram.sendMessage(user.tg_id, text, {
        parse_mode: 'Markdown',
        reply_markup: broadcastMarkup(),
      });
      sent += 1;
    } catch (sendError) {
      failed += 1;
      console.error(`[broadcast] send error tg_id=${user.tg_id}:`, sendError);
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  await ctx.reply(`📊 Рассылка завершена\nОтправлено: ${sent}\nОшибок: ${failed}`);
}

export async function broadcastCancelConfirmHandler(ctx: Context): Promise<void> {
  const tgId = ctx.from?.id;
  if (!tgId || !isBroadcastAdmin(tgId)) return;

  pendingConfirmations.delete(tgId);
  await ctx.answerCbQuery('Отменено');
  try { await ctx.editMessageReplyMarkup(undefined); } catch {}
}
