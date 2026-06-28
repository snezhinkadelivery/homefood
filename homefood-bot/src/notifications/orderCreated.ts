import { bot } from '../bot';
import { supabase } from '../lib/supabase';
import { getAdminStatusKeyboard, storeAdminOrderMessage } from './adminOrderMessages';

type OrderItemJson = {
  id: number;
  name: string;
  price: number;
  qty: number;
};

type Order = {
  id: number;
  order_number: string;
  user_tg_id: number | null;
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
  console.log(`[orderCreated] start for order_id=${orderId}`);
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
    console.log(`[orderCreated] order=${o.order_number} user_tg_id=${o.user_tg_id}`);

    // Резервируем запись в reviews — чтобы cron мог атомарно её обновлять
    const { error: reviewInsertErr } = await supabase
      .from('reviews')
      .insert({
        order_id: o.id,
        user_tg_id: o.user_tg_id,
        requested_at: null,
        reminded_at: null,
        submitted_at: null,
        rating: null,
      });
    if (reviewInsertErr) {
      console.error('[orderCreated] reserve review row error:', reviewInsertErr);
    }

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

    // Получаем signed URL для фото (бакет приватный)
    let photoSignedUrl: string | null = null;
    if (o.address_photo_url) {
      const { data: signedData } = await supabase.storage
        .from('address-photos')
        .createSignedUrl(o.address_photo_url, 3600); // 1 час
      photoSignedUrl = signedData?.signedUrl ?? null;
      console.log(`[orderCreated] photo signed url: ${photoSignedUrl ? 'ok' : 'failed'}`);
    }

    // Уведомление покупателю (только если есть tg_id)
    if (o.user_tg_id) {
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

      try {
        await bot.telegram.sendMessage(o.user_tg_id, text, {
          reply_markup: {
            inline_keyboard: [
              [{ text: '📋 Скопировать номер счёта', callback_data: `copy_account_${settings.bank_account ?? ''}` }],
            ],
          },
        });
        console.log(`[orderCreated] sent to customer ${o.user_tg_id}`);
      } catch (customerErr) {
        console.error('[orderCreated] send to customer error:', customerErr);
      }

      if (photoSignedUrl) {
        try {
          await bot.telegram.sendPhoto(o.user_tg_id, photoSignedUrl, {
            caption: '📍 Фото адреса доставки',
          });
        } catch (photoErr) {
          console.error('[orderCreated] send photo to customer error:', photoErr);
        }
      }
    }

    // Уведомление администраторам (всегда, независимо от наличия user_tg_id)
    const rawAdminIds = process.env.ADMIN_TG_IDS ?? '';
    console.log(`[orderCreated] ADMIN_TG_IDS="${rawAdminIds}"`);
    const adminIds = rawAdminIds.split(',').map((id) => Number(id.trim())).filter(Boolean);
    console.log(`[orderCreated] adminIds=${JSON.stringify(adminIds)}`);

    if (adminIds.length > 0) {
      const adminText =
        `🔔 Новый заказ ${o.order_number}\n\n` +
        `👤 ${o.customer_name} (tg: ${o.user_tg_id ?? 'нет'})\n` +
        `🛒 ${(o.items_json ?? []).map((i) => `${i.name} × ${i.qty}`).join(', ')}\n` +
        `💳 Итого: ${formatPrice(o.total)}\n` +
        `📍 Адрес: ${o.address_text ?? 'фото прикреплено ниже'}`;

      for (const adminId of adminIds) {
        try {
          const sent = await bot.telegram.sendMessage(adminId, adminText, {
            reply_markup: getAdminStatusKeyboard(o.id, 'accepted'),
          });
          await storeAdminOrderMessage(o.id, adminId, sent.message_id);
          console.log(`[orderCreated] sent to admin ${adminId}`);
          if (photoSignedUrl) {
            await bot.telegram.sendPhoto(adminId, photoSignedUrl, {
              caption: '📍 Фото адреса доставки',
            });
          }
        } catch (adminErr) {
          console.error(`[orderCreated] send to admin ${adminId} error:`, adminErr);
        }
      }
    } else {
      console.warn('[orderCreated] no admin IDs configured');
    }
  } catch (err) {
    console.error('[orderCreated] unexpected error:', err);
  }
}
