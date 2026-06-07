import { bot } from '../bot';
import { supabase } from '../lib/supabase';

type OrderRow = {
  order_number: string;
  user_tg_id: number;
};

type SettingRow = { key: string; value: string };

const STATUS_MESSAGES: Record<string, (num: string, phone: string) => string> = {
  accepted: (num) =>
    `✅ Заказ ${num} принят!\n\nМы уже занимаемся комплектацией вашего заказа.\nКак только заказ будет передан — сообщим вам.`,

  on_way: (num, phone) =>
    `🚚 Ваш заказ ${num} в пути!\n\nОжидайте доставку в течение 24 часов.\n\nПо вопросам доставки: ${phone}`,

  completed: (num) =>
    `📦 Заказ ${num} доставлен!\n\nСпасибо что выбрали HomeFood 🏠\nПриятного аппетита!`,
};

export async function sendStatusNotification(orderId: number, status: string): Promise<void> {
  try {
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('order_number, user_tg_id')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      console.error('[statusChanged] fetch order error:', orderErr);
      return;
    }

    const o = order as OrderRow;
    if (!o.user_tg_id) return;

    const { data: settingsData, error: settingsErr } = await supabase
      .from('settings')
      .select('key, value')
      .eq('key', 'delivery_phone');

    if (settingsErr) {
      console.error('[statusChanged] fetch settings error:', settingsErr);
    }

    const settings: Record<string, string> = {};
    (settingsData ?? []).forEach((row: SettingRow) => {
      settings[row.key] = row.value;
    });

    const messageFn = STATUS_MESSAGES[status];
    if (!messageFn) {
      console.warn('[statusChanged] unknown status:', status);
      return;
    }

    const text = messageFn(o.order_number, settings.delivery_phone ?? '');
    await bot.telegram.sendMessage(o.user_tg_id, text);
  } catch (err) {
    console.error('[statusChanged] unexpected error:', err);
  }
}
