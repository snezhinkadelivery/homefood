'use client';

import Image from 'next/image';
import { useState } from 'react';
import { toast } from '@/components/ui/Toast';
import { formatPrice, getMenuImageUrl } from '@/lib/utils';
import type { MenuItem } from '@/types';

export function MenuItemToggle({ item }: { item: MenuItem }) {
  const [active, setActive] = useState(item.is_active);
  const [saving, setSaving] = useState(false);
  const imageUrl = getMenuImageUrl(item.image_url);
  const frozenLayout = item.image_url?.startsWith('frozen/');

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
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={
            'relative shrink-0 overflow-hidden rounded-lg bg-[#F1F5F9] ring-1 ring-[#E2E8F0] ' +
            (frozenLayout ? 'h-14 w-24' : 'h-12 w-12')
          }
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={item.name}
              fill
              sizes={frozenLayout ? '96px' : '48px'}
              className={frozenLayout ? 'object-contain' : 'object-cover'}
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#94A3B8]">
              🖼️
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-medium leading-5 text-[#1E293B]">
            {item.name}
          </p>
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
