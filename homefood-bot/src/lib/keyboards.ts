import type { InlineKeyboardMarkup } from 'telegraf/types';

export function reviewKeyboard(orderId: number): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [1, 2, 3, 4, 5].map((n) => ({
        text: `${n} ${'⭐'.repeat(n > 3 ? 1 : 1)}`,
        callback_data: `review_${orderId}_${n}`,
      })),
    ],
  };
}
