'use client';

import Image from 'next/image';
import { useState } from 'react';
import { toast } from '@/components/ui/Toast';
import { formatPrice, getMenuImageUrl } from '@/lib/utils';
import type { MenuItem } from '@/types';

export function MenuItemToggle({ item }: { item: MenuItem }) {
  const [active, setActive] = useState(item.is_active);
  const [saving, setSaving] = useState(false);
  const [price, setPrice] = useState(String(item.price));
  const [savedPrice, setSavedPrice] = useState(item.price);
  const [priceSaving, setPriceSaving] = useState(false);
  const imageUrl = getMenuImageUrl(item.image_url);
  const frozenLayout = item.image_url?.startsWith('frozen/');
  const numericPrice = Number(price);
  const priceChanged = Number.isInteger(numericPrice) && numericPrice !== savedPrice;

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

  async function onSavePrice() {
    if (priceSaving || !Number.isInteger(numericPrice) || numericPrice < 0) return;
    setPriceSaving(true);
    try {
      const res = await fetch(`/api/catalog/${item.id}/price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: numericPrice }),
      });
      if (!res.ok) throw new Error('failed');
      setSavedPrice(numericPrice);
      toast('Цена обновлена');
    } catch {
      toast('Не удалось обновить цену', 'error');
    } finally {
      setPriceSaving(false);
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
          <p className="text-xs text-[#64748B]">{formatPrice(savedPrice)}</p>
        </div>
      </div>

      <div className="ml-3 flex shrink-0 items-center gap-3">
        <label className="flex items-center gap-1 rounded-xl border border-[#CBD5E1] bg-white px-3 py-2">
          <input
            value={price}
            onChange={(event) => setPrice(event.target.value.replace(/\D/g, ''))}
            inputMode="numeric"
            className="w-20 bg-transparent text-right text-sm font-bold text-[#1E293B] outline-none"
            aria-label={`Цена: ${item.name}`}
          />
          <span className="text-sm font-bold text-[#64748B]">₩</span>
        </label>

        {priceChanged && (
          <button
            type="button"
            onClick={onSavePrice}
            disabled={priceSaving}
            className="h-9 rounded-xl bg-[#2563EB] px-3 text-xs font-bold text-white transition active:scale-95 disabled:opacity-60"
          >
            {priceSaving ? '...' : 'Сохранить'}
          </button>
        )}

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
    </div>
  );
}
