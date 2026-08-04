'use client';

import { useState } from 'react';
import { toast } from '@/components/ui/Toast';
import type { CatalogType } from '@/types';

const OPTIONS: { value: CatalogType['status']; label: string }[] = [
  { value: 'active', label: 'Активен' },
  { value: 'coming_soon', label: 'Скоро' },
  { value: 'hidden', label: 'Скрыт' },
];

type Props = {
  catalogType: CatalogType;
};

export function CatalogStatusSelect({ catalogType }: Props) {
  const [status, setStatus] = useState<CatalogType['status']>(catalogType.status);
  const [saving, setSaving] = useState(false);

  async function onChange(next: CatalogType['status']) {
    if (saving || next === status) return;
    const previous = status;
    setStatus(next);
    setSaving(true);

    try {
      const res = await fetch(`/api/catalog-types/${catalogType.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error('failed');
      toast('Статус каталога обновлён');
    } catch {
      setStatus(previous);
      toast('Не удалось обновить статус каталога', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-[#64748B]">
        Статус каталога
      </span>
      <select
        value={status}
        onChange={(event) => onChange(event.target.value as CatalogType['status'])}
        disabled={saving}
        className="h-10 rounded-xl border border-[#CBD5E1] bg-white px-3 text-sm font-semibold text-[#1E293B] outline-none transition disabled:opacity-60"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
