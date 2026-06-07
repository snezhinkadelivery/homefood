'use client';

import { useState } from 'react';
import { toast } from '@/components/ui/Toast';
import type { OrderStatus } from '@/types';

const STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'accepted', label: 'Принят' },
  { value: 'on_way', label: 'В пути' },
  { value: 'completed', label: 'Завершён' },
];

type Props = {
  orderId: number;
  current: OrderStatus;
};

export function StatusSelector({ orderId, current }: Props) {
  const [value, setValue] = useState<OrderStatus>(current);
  const [saving, setSaving] = useState(false);

  async function onChange(next: OrderStatus) {
    const prev = value;
    setValue(next);
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error('failed');
      toast('Статус обновлён, уведомление отправлено');
    } catch {
      setValue(prev);
      toast('Не удалось обновить статус', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      value={value}
      disabled={saving}
      onChange={(e) => onChange(e.target.value as OrderStatus)}
      className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm font-medium text-[#1E293B] focus:border-[#2563EB] focus:outline-none disabled:opacity-60"
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
