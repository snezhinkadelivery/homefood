'use client';

import { useState } from 'react';
import { toast } from '@/components/ui/Toast';
import { formatPrice } from '@/lib/utils';
import type { MenuItem } from '@/types';

export function MenuItemToggle({ item }: { item: MenuItem }) {
  const [active, setActive] = useState(item.is_active);
  const [saving, setSaving] = useState(false);

  async function onToggle() {
    if (saving) return;
    const next = !active;
    setActive(next);
    setSaving(true);
    try {
      const res = await fetch(`/api/catalog/${item.id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: next }),
      });
      if (!res.ok) throw new Error('failed');
    } catch {
      setActive(!next);
      toast('Не удалось обновить позицию', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={
        'flex items-center justify-between rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 ' +
        (active ? '' : 'opacity-60')
      }
    >
      <div className="flex items-center gap-3">
        {item.image_url ? (
          <div className="h-10 w-10 rounded-lg bg-[#F1F5F9]" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F1F5F9] text-[#94A3B8]">
            🖼️
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-[#1E293B]">{item.name}</p>
          <p className="text-xs text-[#64748B]">
            {item.price > 0 ? formatPrice(item.price) : '—'}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggle}
        disabled={saving}
        role="switch"
        aria-checked={active}
        className={
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-60 ' +
          (active ? 'bg-[#16A34A]' : 'bg-[#CBD5E1]')
        }
      >
        <span
          className={
            'inline-block h-5 w-5 transform rounded-full bg-white shadow transition ' +
            (active ? 'translate-x-5' : 'translate-x-0.5')
          }
        />
      </button>
    </div>
  );
}
