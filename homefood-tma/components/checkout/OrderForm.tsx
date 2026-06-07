'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/hooks/useCart';
import { useTelegram } from '@/hooks/useTelegram';
import { formatPrice, generateOrderNumber } from '@/lib/utils';
import { AddressInput } from './AddressInput';
import { DeliveryProgressBar } from '@/components/cart/DeliveryProgressBar';
import { CartSummary } from '@/components/cart/CartSummary';
import type { OrderItemJson } from '@/types';

type BankSettings = {
  bank_name: string;
  bank_account: string;
  bank_holder: string;
};

type SuccessState = {
  orderNumber: string;
  total: number;
};

type Props = {
  onOrdered?: () => void;
};

export function OrderForm({ onOrdered }: Props) {
  const { user } = useTelegram();
  const { items, subtotal, deliveryFee, total, clearCart } = useCart();

  const [customerName, setCustomerName] = useState(user?.first_name ?? '');
  const [phone, setPhone] = useState('');
  const [addressText, setAddressText] = useState('');
  const [addressPhotoUrl, setAddressPhotoUrl] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessState | null>(null);

  // Банковские реквизиты для экрана успеха
  const [bankSettings, setBankSettings] = useState<BankSettings | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!success) return;
    supabase
      .from('settings')
      .select('key, value')
      .in('key', ['bank_name', 'bank_account', 'bank_holder'])
      .then(({ data }) => {
        const map: Record<string, string> = {};
        (data ?? []).forEach((r: { key: string; value: string }) => {
          map[r.key] = r.value;
        });
        setBankSettings({
          bank_name: map.bank_name ?? '',
          bank_account: map.bank_account ?? '',
          bank_holder: map.bank_holder ?? '',
        });
      });
  }, [success]);

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

      // Очищаем корзину и показываем экран успеха без навигации
      clearCart();
      setSuccess({ orderNumber, total });
      onOrdered?.();

      // Уведомить бота — некритично
      const botUrl = process.env.NEXT_PUBLIC_BOT_URL;
      const botSecret = process.env.NEXT_PUBLIC_BOT_SECRET;
      if (botUrl && tgId) {
        supabase
          .from('orders')
          .select('id')
          .eq('order_number', orderNumber)
          .single()
          .then(({ data: orderData }) => {
            if (orderData?.id) {
              const headers: Record<string, string> = { 'Content-Type': 'application/json' };
              if (botSecret) headers['x-bot-secret'] = botSecret;
              fetch(`${botUrl}/api/new-order`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ order_id: orderData.id, tg_id: tgId }),
              }).catch(() => {});
            }
          }, () => {});
      }
    } catch (err) {
      console.error('[OrderForm] submit error:', JSON.stringify(err));
      const msg =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message ?? JSON.stringify(err);
      setError(msg);
      setSubmitting(false);
    }
  }

  async function copyAccount() {
    if (!bankSettings) return;
    try {
      await navigator.clipboard.writeText(bankSettings.bank_account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  }

  // ── Экран успеха (без router.push) ──────────────────────────────────────
  if (success) {
    return (
      <div className="px-0 pt-6 pb-[120px]">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#16A34A]">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="mt-5 text-2xl font-extrabold text-slate-900">Заказ принят!</h1>
          <p className="mt-1 text-base font-bold text-[#2563EB]">№ {success.orderNumber}</p>
          <p className="mt-1 text-base font-extrabold text-slate-900">
            {formatPrice(success.total)}
          </p>
          <p className="mt-4 max-w-[300px] text-sm text-slate-600">
            Уведомления о статусе придут в Telegram
          </p>
        </div>

        <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm font-bold text-slate-900">💳 Оплата переводом</p>
          {bankSettings ? (
            <div className="mt-3 space-y-1">
              <p className="text-sm font-semibold text-slate-700">{bankSettings.bank_name}</p>
              <p className="text-base font-extrabold text-slate-900">{bankSettings.bank_account}</p>
              <p className="text-sm text-slate-500">{bankSettings.bank_holder}</p>
              <button
                type="button"
                onClick={copyAccount}
                className="mt-3 flex h-11 w-full items-center justify-center rounded-xl bg-[#EAB308] text-sm font-extrabold text-white shadow-sm active:scale-[0.98]"
              >
                {copied ? '✅ Скопировано!' : '📋 Скопировать номер счёта'}
              </button>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
              <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
            </div>
          )}
        </div>

        <Link
          href="/"
          className="fixed bottom-4 left-1/2 z-10 flex h-14 w-[calc(100%-2rem)] max-w-[398px] -translate-x-1/2 items-center justify-center rounded-2xl bg-[#2563EB] text-base font-extrabold text-white shadow-lg shadow-blue-200 active:scale-[0.98]"
        >
          ← Вернуться в меню
        </Link>
      </div>
    );
  }

  // ── Форма оформления ────────────────────────────────────────────────────
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
        <label className="block text-sm font-bold text-slate-700">Пожелания к заказу</label>
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
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
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
