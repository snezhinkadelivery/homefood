import type { Context } from 'telegraf';
import { supabase } from '../lib/supabase';

type OrderRow = {
  order_number: string;
  status: string;
  total: number;
  created_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  accepted: '✅ Принят',
  on_way: '🚚 В пути',
  completed: '📦 Доставлен',
};

function formatPrice(n: number): string {
  return n.toLocaleString('ru-RU') + ' ₩';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export async function myOrdersHandler(ctx: Context): Promise<void> {
  const from = ctx.from;
  if (!from) return;

  const { data, error } = await supabase
    .from('orders')
    .select('order_number, status, total, created_at')
    .eq('user_tg_id', from.id)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('[myorders] fetch error:', error);
    await ctx.reply('❌ Не удалось загрузить заказы. Попробуйте позже.');
    return;
  }

  const orders = (data ?? []) as OrderRow[];

  if (orders.length === 0) {
    await ctx.reply('У вас пока нет заказов.\n\nОткройте меню и закажите что-нибудь вкусное! 🍽️');
    return;
  }

  const lines = orders.map((o) => {
    const status = STATUS_LABELS[o.status] ?? o.status;
    return `${o.order_number} — ${formatPrice(o.total)}\n${status} · ${formatDate(o.created_at)}`;
  });

  await ctx.reply(`📋 Ваши последние заказы:\n\n${lines.join('\n\n')}`);
}
