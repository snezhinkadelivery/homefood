'use client';

import Image from 'next/image';
import type { CartItem as TCartItem } from '@/types';
import { getMenuImageUrl } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';

type Props = {
  item: TCartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
};

export function CartItem({ item, onIncrement, onDecrement, onRemove }: Props) {
  const imageUrl = getMenuImageUrl(item.image_url);
  const frozenLayout = item.image_url?.startsWith('frozen/');

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
      <div
        className={`relative shrink-0 overflow-hidden bg-slate-100 ${
          frozenLayout ? 'h-[76px] w-[112px] rounded-xl ring-1 ring-slate-100' : 'h-16 w-16 rounded-full'
        }`}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            sizes={frozenLayout ? '112px' : '64px'}
            className={frozenLayout ? 'object-contain' : 'object-cover'}
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">🍽️</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-bold text-slate-900">{item.name}</h4>
        <p className="text-sm font-extrabold text-[#2563EB]">{formatPrice(item.price)}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDecrement}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-lg font-bold active:scale-95"
          aria-label="Уменьшить"
        >
          −
        </button>
        <span className="min-w-[20px] text-center text-sm font-extrabold">{item.quantity}</span>
        <button
          type="button"
          onClick={onIncrement}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#16A34A] text-white text-lg font-bold active:scale-95"
          aria-label="Увеличить"
        >
          +
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 text-slate-400 active:scale-95"
          aria-label="Удалить"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
