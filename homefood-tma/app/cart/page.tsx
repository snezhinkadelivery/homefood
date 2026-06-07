'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { DeliveryProgressBar } from '@/components/cart/DeliveryProgressBar';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const router = useRouter();
  const { items, hydrated, subtotal, deliveryFee, total, updateQuantity, removeItem } = useCart();

  if (!hydrated) {
    return (
      <main className="px-4 pt-5 pb-[120px]">
        <div className="skeleton h-20 w-full rounded-2xl" />
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl">🛒</div>
        <h1 className="mt-4 text-xl font-extrabold text-slate-900">Корзина пуста</h1>
        <p className="mt-2 text-sm text-slate-500">Выберите блюда из меню</p>
        <Link
          href="/"
          className="mt-6 flex h-12 items-center justify-center rounded-2xl bg-[#2563EB] px-6 text-sm font-extrabold text-white shadow-md"
        >
          ← В меню
        </Link>
      </main>
    );
  }

  return (
    <main className="px-4 pt-5 pb-[120px]">
      <header className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
          aria-label="Назад"
        >
          ←
        </button>
        <h1 className="text-xl font-extrabold text-slate-900">Корзина</h1>
      </header>

      <DeliveryProgressBar subtotal={subtotal} />

      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
            onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
            onRemove={() => removeItem(item.id)}
          />
        ))}
      </div>

      <div className="mt-3">
        <CartSummary subtotal={subtotal} deliveryFee={deliveryFee} total={total} />
      </div>

      <Link
        href="/checkout"
        className="fixed bottom-4 left-1/2 z-10 flex h-14 w-[calc(100%-2rem)] max-w-[398px] -translate-x-1/2 items-center justify-center gap-2 rounded-2xl bg-[#2563EB] text-base font-extrabold text-white shadow-lg shadow-blue-200 active:scale-[0.98]"
      >
        Оформить заказ · {formatPrice(total)} →
      </Link>
    </main>
  );
}
