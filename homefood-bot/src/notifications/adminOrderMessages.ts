import { supabase } from '../lib/supabase';

type OrderStatus = 'accepted' | 'on_way' | 'completed';

type AdminKeyboard = {
  inline_keyboard: { text: string; callback_data: string }[][];
};

type TelegramApi = {
  editMessageReplyMarkup: (
    chatId: number,
    messageId: number,
    inlineMessageId: undefined,
    replyMarkup?: AdminKeyboard,
  ) => Promise<unknown>;
};

type AdminOrderMessageRow = {
  admin_tg_id: number;
  message_id: number;
};

export function getAdminStatusKeyboard(orderId: number, status: OrderStatus): AdminKeyboard | undefined {
  if (status === 'accepted') {
    return {
      inline_keyboard: [
        [{ text: '🚚 В пути', callback_data: `status_${orderId}_on_way` }],
      ],
    };
  }

  if (status === 'on_way') {
    return {
      inline_keyboard: [
        [{ text: '📦 Доставлен', callback_data: `status_${orderId}_completed` }],
      ],
    };
  }

  return undefined;
}

export async function storeAdminOrderMessage(
  orderId: number,
  adminTgId: number,
  messageId: number,
): Promise<void> {
  const { error } = await supabase
    .from('admin_order_messages')
    .upsert(
      {
        order_id: orderId,
        admin_tg_id: adminTgId,
        message_id: messageId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'order_id,admin_tg_id' },
    );

  if (error) {
    console.error('[adminOrderMessages] store error:', error);
  }
}

export async function syncAdminOrderMessages(
  orderId: number,
  status: OrderStatus,
  telegram: TelegramApi,
  skip?: { chatId: number; messageId: number },
): Promise<void> {
  const { data, error } = await supabase
    .from('admin_order_messages')
    .select('admin_tg_id, message_id')
    .eq('order_id', orderId);

  if (error) {
    console.error('[adminOrderMessages] fetch error:', error);
    return;
  }

  const replyMarkup = getAdminStatusKeyboard(orderId, status);
  for (const row of (data ?? []) as AdminOrderMessageRow[]) {
    if (skip && row.admin_tg_id === skip.chatId && row.message_id === skip.messageId) {
      continue;
    }

    try {
      await telegram.editMessageReplyMarkup(
        row.admin_tg_id,
        row.message_id,
        undefined,
        replyMarkup,
      );
    } catch (err) {
      console.error(
        `[adminOrderMessages] edit error admin=${row.admin_tg_id} order=${orderId}:`,
        err,
      );
    }
  }
}
