'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { OrderForm } from '@/components/checkout/OrderForm';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, hydrated } = useCart();
  const [ordered, setOrdered] = useState(false);

  useEffect(() => {
    // Не редиректим если заказ уже оформлен — иначе экран успеха сразу закрывается
    if (hydrated && items.length === 0 && !ordered) {
      router.replace('/');
    }
  }, [hydrated, items.length, ordered, router]);

  if (!hydrated) {
    return (
      <main className="px-4 pt-5 pb-4">
        <div className="skeleton h-20 w-full rounded-2xl" />
      </main>
    );
  }

  return (
    <main className="px-4 pt-5 pb-4">
      {!ordered && (
        <header className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/cart')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
            aria-label="Назад"
          >
            ←
          </button>
          <h1 className="text-xl font-extrabold text-slate-900">Оформление</h1>
        </header>
      )}

      <OrderForm onOrdered={() => setOrdered(true)} />
    </main>
  );
}
