'use client';

import { FREE_DELIVERY_MIN } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';

export function DeliveryProgressBar({ subtotal }: { subtotal: number }) {
  const free = subtotal >= FREE_DELIVERY_MIN;
  const percent = Math.min(100, Math.round((subtotal / FREE_DELIVERY_MIN) * 100));
  const left = Math.max(0, FREE_DELIVERY_MIN - subtotal);

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-sm font-bold text-slate-800">
        {free
          ? '🎉 Доставка бесплатна!'
          : `До бесплатной доставки: ${formatPrice(left)}`}
      </p>
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${free ? 100 : percent}%`,
            background: free ? '#16A34A' : '#2563EB',
          }}
        />
      </div>
    </div>
  );
}
