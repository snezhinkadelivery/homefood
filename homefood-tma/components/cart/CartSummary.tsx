'use client';

import { formatPrice } from '@/lib/utils';

type Props = {
  subtotal: number;
  discountAmount?: number;
  deliveryFee: number;
  total: number;
};

export function CartSummary({ subtotal, discountAmount = 0, deliveryFee, total }: Props) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex justify-between text-sm text-slate-600">
        <span>Товары</span>
        <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
      </div>
      {discountAmount > 0 && (
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-[#16A34A]">Скидка</span>
          <span className="font-semibold text-[#16A34A]">−{formatPrice(discountAmount)}</span>
        </div>
      )}
      <div className="mt-2 flex justify-between text-sm text-slate-600">
        <span>Доставка</span>
        <span className="font-semibold text-slate-900">
          {deliveryFee === 0 ? (
            <span className="text-[#16A34A]">Бесплатно</span>
          ) : (
            formatPrice(deliveryFee)
          )}
        </span>
      </div>
      <div className="mt-3 flex justify-between border-t border-slate-100 pt-3">
        <span className="text-base font-bold text-slate-900">Итого</span>
        <span className="text-base font-extrabold text-[#2563EB]">{formatPrice(total)}</span>
      </div>
    </div>
  );
}
