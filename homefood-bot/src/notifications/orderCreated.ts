import { bot } from '../bot';
import { supabase } from '../lib/supabase';

type OrderItemJson = {
  id: number;
  name: string;
  price: number;
  qty: number;
};

type Order = {
  id: number;
  order_number: string;
  user_tg_id: number;
  customer_name: string;
  address_text: string | null;
  address_photo_url: string | null;
  items_json: OrderItemJson[];
  subtotal: number;
  delivery_fee: number;
  total: number;
};

type SettingRow = { key: string; value: string };

function formatPrice(n: number): string {
  return n.toLocaleString('ru-RU') + ' ₩';
}

export async function sendOrderCreatedNotification(orderId: number): Promise<void> {
  try {
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      console.error('[orderCreated] fetch order error:', orderErr);
      return;
    }

    const o = order as Order;
    if (!o.user_tg_id) return;

    const { data: settingsData, error: settingsErr } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['bank_name', 'bank_account', 'bank_holder']);

    if (settingsErr) {
      console.error('[orderCreated] fetch settings error:', settingsErr);
      return;
    }

    const settings: Record<string, string> = {};
    (settingsData ?? []).forEach((row: SettingRow) => {
      settings[row.key] = row.value;
    });

    const itemsList = (o.items_json ?? [])
      .map((item) => `• ${item.name} × ${item.qty} — ${formatPrice(item.price * item.qty)}`)
      .join('\n');

    const addressLine = o.address_text ? o.address_text : 'фото прикреплено ниже';
    const deliveryLine = o.delivery_fee === 0 ? 'Бесплатно' : formatPrice(o.delivery_fee);

    const text =
      `✅ Заказ ${o.order_number} принят!\n\n` +
      `Мы уже занимаемся комплектацией вашего заказа.\n` +
      `Как только заказ будет передан — сообщим вам.\n\n` +
      `🛒 Ваш заказ:\n${itemsList}\n\n` +
      `📍 Адрес: ${addressLine}\n` +
      `💰 Сумма товаров: ${formatPrice(o.subtotal)}\n` +
      `🚚 Доставка: ${deliveryLine}\n` +
      `💳 Итого: ${formatPrice(o.total)}\n\n` +
      `💳 Оплата переводом:\n` +
      `${settings.bank_name ?? ''}\n` +
      `${settings.bank_account ?? ''} (${settings.bank_holder ?? ''})`;

    // Уведомление покупателю
    await bot.telegram.sendMessage(o.user_tg_id, text, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📋 Скопировать номер счёта', callback_data: `copy_account_${settings.bank_account ?? ''}` }],
        ],
      },
    });

    if (o.address_photo_url) {
      try {
        await bot.telegram.sendPhoto(o.user_tg_id, o.address_photo_url, {
          caption: '📍 Фото адреса доставки',
        });
      } catch (photoErr) {
        console.error('[orderCreated] send photo error:', photoErr);
      }
    }

    // Уведомление администраторам
    const rawAdminIds = process.env.ADMIN_TG_IDS ?? '';
    const adminIds = rawAdminIds.split(',').map((id) => Number(id.trim())).filter(Boolean);
    if (adminIds.length > 0) {
      const adminText =
        `🔔 Новый заказ ${o.order_number}\n\n` +
        `👤 ${o.customer_name} (tg: ${o.user_tg_id})\n` +
        `🛒 ${(o.items_json ?? []).map((i) => `${i.name} × ${i.qty}`).join(', ')}\n` +
        `💳 Итого: ${formatPrice(o.total)}\n` +
        `📍 Адрес: ${o.address_text ?? 'фото'}`;

      for (const adminId of adminIds) {
        try {
          await bot.telegram.sendMessage(adminId, adminText);
          if (o.address_photo_url) {
            await bot.telegram.sendPhoto(adminId, o.address_photo_url, {
              caption: '📍 Фото адреса доставки',
            });
          }
        } catch (adminErr) {
          console.error(`[orderCreated] send to admin ${adminId} error:`, adminErr);
        }
      }
    }
  } catch (err) {
    console.error('[orderCreated] unexpected error:', err);
  }
}
