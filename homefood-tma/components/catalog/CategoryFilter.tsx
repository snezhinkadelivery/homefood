'use client';

import type { Category } from '@/types';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS: Record<string, string> = {
  first: '🍲',
  second: '🍖',
  sauces: '🥘',
};

type Props = {
  categories: Category[];
  activeId: number | 'all';
  onChange: (id: number | 'all') => void;
};

export function CategoryFilter({ categories, activeId, onChange }: Props) {
  return (
    <div className="border-b border-[#E2E8F0] bg-white px-4 py-2">
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        <FilterButton
          active={activeId === 'all'}
          onClick={() => onChange('all')}
          icon="🍽️"
          label="Все"
        />
        {categories.map((c) => (
          <FilterButton
            key={c.id}
            active={activeId === c.id}
            onClick={() => onChange(c.id)}
            icon={CATEGORY_ICONS[c.slug] ?? '🍽️'}
            label={c.name}
          />
        ))}
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[20px] px-3.5 py-1.5 text-[13px] font-semibold transition',
        active
          ? 'bg-[#16A34A] text-white'
          : 'border-[1.5px] border-[#E2E8F0] bg-white text-[#475569]',
      )}
    >
      <span className="text-sm">{icon}</span>
      {label}
    </button>
  );
}
