'use client';

import Image from 'next/image';
import type { MenuItem } from '@/types';
import { getMenuImageUrl } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';

export function MenuItemCard({ item, priority = false }: { item: MenuItem; priority?: boolean }) {
  const { items, addItem, updateQuantity } = useCart();
  const inCart = items.find((c) => c.id === item.id);
  const qty = inCart?.quantity ?? 0;
  const imageUrl = getMenuImageUrl(item.image_url);

  return (
    <div className="flex shrink-0 flex-col items-center" style={{ width: 155 }}>
      {/* Круг с фото */}
      <div
        className="relative overflow-hidden rounded-full"
        style={{
          width: 155,
          height: 155,
          boxShadow: '0 4px 16px rgba(37, 99, 235, 0.15)',
        }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            sizes="155px"
            className="object-cover"
            unoptimized
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-4xl">
            🍽️
          </div>
        )}
      </div>

      {/* Pill под кругом */}
      {qty === 0 ? (
        <div
          className="mt-2.5 flex h-9 w-full items-center justify-between rounded-full bg-white px-3"
          style={{ boxShadow: '0 2px 10px rgba(37, 99, 235, 0.12)' }}
        >
          <span className="text-[13px] font-extrabold text-[#2563EB]">
            {formatPrice(item.price)}
          </span>
          <button
            type="button"
            onClick={() => addItem(item)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#16A34A] transition active:scale-90"
            style={{ boxShadow: '0 2px 8px rgba(22, 163, 74, 0.4)' }}
            aria-label="Добавить в корзину"
          >
            <CartIcon />
          </button>
        </div>
      ) : (
        <div
          className="mt-2.5 flex h-9 w-full items-center justify-center gap-2 rounded-full bg-white px-3"
          style={{ boxShadow: '0 2px 10px rgba(37, 99, 235, 0.12)' }}
        >
          <button
            type="button"
            onClick={() => updateQuantity(item.id, qty - 1)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-base font-bold text-white active:scale-90"
            aria-label="Уменьшить"
          >
            −
          </button>
          <span className="min-w-[20px] text-center text-sm font-extrabold text-[#1E293B]">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => updateQuantity(item.id, qty + 1)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-base font-bold text-white active:scale-90"
            aria-label="Увеличить"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}

function CartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 6h15l-1.5 9h-12L6 6Zm0 0L5 3H2m6 17a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm11 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
