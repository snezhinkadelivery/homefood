'use client';

import type { CartItem as TCartItem } from '@/types';
import { formatPrice } from '@/lib/utils';

type Props = {
  item: TCartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
};

export function CartItem({ item, onIncrement, onDecrement, onRemove }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <div className="min-w-0 flex-1">
        <h4 className="line-clamp-2 text-[15px] font-extrabold leading-5 text-slate-900">
          {item.name}
        </h4>
        <p className="mt-1 text-[15px] font-extrabold text-[#2563EB]">
          {formatPrice(item.price)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onDecrement}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-700 active:scale-95"
          aria-label="Уменьшить"
        >
          −
        </button>
        <span className="min-w-[20px] text-center text-sm font-extrabold text-slate-900">
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#16A34A] text-lg font-bold text-white active:scale-95"
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
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
