'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { OrderForm } from '@/components/checkout/OrderForm';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, hydrated } = useCart();

  useEffect(() => {
    if (hydrated && items.length === 0) {
      router.replace('/');
    }
  }, [hydrated, items.length, router]);

  if (!hydrated) {
    return (
      <main className="px-4 pt-5 pb-[120px]">
        <div className="skeleton h-20 w-full rounded-2xl" />
      </main>
    );
  }

  return (
    <main className="px-4 pt-5 pb-[120px]">
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

      <OrderForm />
    </main>
  );
}
