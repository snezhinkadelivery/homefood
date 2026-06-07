'use client';

import type { CatalogType } from '@/types';
import { cn } from '@/lib/utils';

const TYPE_ICONS: Record<string, string> = {
  retort: '🍱',
  frozen: '❄️',
  semi: '🥟',
};

type Props = {
  types: CatalogType[];
  activeId: number | null;
  onChange: (id: number) => void;
};

export function CatalogTabs({ types, activeId, onChange }: Props) {
  const active = types.filter((t) => t.is_active);
  if (active.length === 0) return null;
  return (
    <div className="bg-white px-4 pt-3 pb-2">
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {active.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-5 py-2 text-sm transition',
              activeId === t.id
                ? 'bg-[#2563EB] font-semibold text-white'
                : 'bg-[#F1F5F9] font-medium text-[#64748B]',
            )}
          >
            <span className="text-base">{TYPE_ICONS[t.slug] ?? '🍽️'}</span>
            {t.name}
          </button>
        ))}
      </div>
    </div>
  );
}
