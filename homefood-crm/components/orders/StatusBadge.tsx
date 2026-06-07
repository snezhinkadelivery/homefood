import type { OrderStatus } from '@/types';

const MAP: Record<OrderStatus, { label: string; cls: string }> = {
  accepted: { label: 'Принят', cls: 'bg-[#FEF3C7] text-[#CA8A04]' },
  on_way: { label: 'В пути', cls: 'bg-[#DBEAFE] text-[#2563EB]' },
  completed: { label: 'Завершён', cls: 'bg-[#DCFCE7] text-[#16A34A]' },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const conf = MAP[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600' };
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${conf.cls}`}
    >
      {conf.label}
    </span>
  );
}
