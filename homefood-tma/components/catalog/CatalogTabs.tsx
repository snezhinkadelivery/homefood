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
  const visible = types
    .filter((t) => t.status === 'active' || t.status === 'coming_soon')
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
      return a.sort_order - b.sort_order;
    });
  if (visible.length === 0) return null;
  return (
    <div className="bg-white px-4 pt-3 pb-2">
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {visible.map((t) => {
          const comingSoon = t.status === 'coming_soon';
          return (
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
              {comingSoon && (
                <span
                  className={cn(
                    'ml-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                    activeId === t.id
                      ? 'bg-white/20 text-white'
                      : 'bg-[#DBEAFE] text-[#2563EB]',
                  )}
                >
                  Скоро
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
