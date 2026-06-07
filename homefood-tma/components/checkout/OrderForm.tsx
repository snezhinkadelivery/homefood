'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/hooks/useCart';
import { useTelegram } from '@/hooks/useTelegram';
import { formatPrice, generateOrderNumber } from '@/lib/utils';
import { AddressInput } from './AddressInput';
import { DeliveryProgressBar } from '@/components/cart/DeliveryProgressBar';
import { CartSummary } from '@/components/cart/CartSummary';
import type { OrderItemJson } from '@/types';

export function OrderForm() {
  const router = useRouter();
  const { user } = useTelegram();
  const { items, subtotal, deliveryFee, total, clearCart } = useCart();

  const [customerName, setCustomerName] = useState(user?.first_name ?? '');
  const [phone, setPhone] = useState('');
  const [addressText, setAddressText] = useState('');
  const [addressPhotoUrl, setAddressPhotoUrl] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!customerName.trim()) return setError('Укажите имя');
    if (!phone.trim()) return setError('Укажите телефон');
    if (!addressText.trim() && !addressPhotoUrl) {
      return setError('Введите адрес текстом или прикрепите фото');
    }
    if (items.length === 0) return setError('Корзина пуста');

    setSubmitting(true);
    try {
      const orderNumber = generateOrderNumber();
      const tgId = user?.id ?? null;

      if (tgId) {
        const { error: userErr } = await supabase.from('users').upsert(
          {
            tg_id: tgId,
            first_name: user?.first_name ?? null,
            username: user?.username ?? null,
            phone,
            last_order_at: new Date().toISOString(),
          },
          { onConflict: 'tg_id' },
        );
        if (userErr) throw userErr;
      }

      const itemsJson: OrderItemJson[] = items.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        qty: i.quantity,
      }));

      const { error: orderErr } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_tg_id: tgId,
          customer_name: customerName.trim(),
          phone: phone.trim(),
          address_text: addressText.trim() || null,
          address_photo_url: addressPhotoUrl,
          comment: comment.trim() || null,
          items_json: itemsJson,
          subtotal,
          delivery_fee: deliveryFee,
          total,
          status: 'accepted',
        });

      if (orderErr) throw orderErr;

      // Уведомить бота — некритично, не блокируем успех
      const botUrl = process.env.NEXT_PUBLIC_BOT_URL;
      if (botUrl && tgId) {
        try {
          // Получаем id заказа по order_number
          const { data: orderData } = await supabase
            .from('orders')
            .select('id')
            .eq('order_number', orderNumber)
            .single();

          if (orderData?.id) {
            await fetch(`${botUrl}/api/new-order`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ order_id: orderData.id, tg_id: tgId }),
            });
          }
        } catch {
          // Уведомление бота не критично для оформления заказа.
        }
      }

      clearCart();
      router.push(`/success?order=${orderNumber}&total=${total}`);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message ?? JSON.stringify(err);
      setError(msg);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <DeliveryProgressBar subtotal={subtotal} />

      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-700">Имя *</label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Как к вам обращаться?"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-[#2563EB] focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-700">Телефон *</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+82 10 XXXX XXXX"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-[#2563EB] focus:outline-none"
        />
      </div>

      <AddressInput
        text={addressText}
        onTextChange={setAddressText}
        photoUrl={addressPhotoUrl}
        onPhotoChange={setAddressPhotoUrl}
      />

      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-700">
          Пожелания к заказу
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Комментарий к заказу..."
          rows={2}
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none"
        />
      </div>

      <CartSummary subtotal={subtotal} deliveryFee={deliveryFee} total={total} />

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="fixed bottom-4 left-1/2 z-10 flex h-14 w-[calc(100%-2rem)] max-w-[398px] -translate-x-1/2 items-center justify-center gap-2 rounded-2xl bg-[#2563EB] text-base font-extrabold text-white shadow-lg shadow-blue-200 active:scale-[0.98] disabled:opacity-60"
      >
        {submitting ? 'Оформляем…' : `Оформить заказ · ${formatPrice(total)}`}
      </button>
    </form>
  );
}
