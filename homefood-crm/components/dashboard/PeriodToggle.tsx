'use client';

import type { Period } from '@/types';

const OPTIONS: { value: Period; label: string }[] = [
  { value: 'today', label: 'Сегодня' },
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'all', label: 'Всё время' },
];

type Props = {
  value: Period;
  onChange: (v: Period) => void;
};

export function PeriodToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex max-w-full overflow-x-auto rounded-lg border border-[#E2E8F0] bg-white p-1">
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={
              'shrink-0 rounded-md px-4 py-1.5 text-sm font-medium transition ' +
              (active
                ? 'bg-[#2563EB] text-white'
                : 'text-[#64748B] hover:text-[#1E293B]')
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
