'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from './StatusBadge';
import { formatDateTime, formatPrice } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';

const FILTERS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'accepted', label: 'Принят' },
  { value: 'on_way', label: 'В пути' },
  { value: 'completed', label: 'Завершён' },
];

export function OrdersTable({ orders }: { orders: Order[] }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== 'all' && o.status !== filter) return false;
      if (!q) return true;
      return (
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q)
      );
    });
  }, [orders, search, filter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по номеру или имени…"
          className="w-full max-w-xs rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none"
        />
        <div className="inline-flex rounded-lg border border-[#E2E8F0] bg-white p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={
                'rounded-md px-3 py-1 text-sm font-medium transition ' +
                (filter === f.value
                  ? 'bg-[#2563EB] text-white'
                  : 'text-[#64748B] hover:text-[#1E293B]')
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white">
        <table className="min-w-full divide-y divide-[#E2E8F0]">
          <thead className="bg-[#F8FAFC]">
            <tr>
              <Th>№ заказа</Th>
              <Th>Клиент</Th>
              <Th>Сумма</Th>
              <Th>Статус</Th>
              <Th>Дата</Th>
              <Th>Действия</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {filtered.map((o) => (
              <tr key={o.id} className="hover:bg-[#F8FAFC]">
                <Td className="font-semibold text-[#2563EB]">{o.order_number}</Td>
                <Td>
                  <div>
                    <p className="font-medium text-[#1E293B]">{o.customer_name}</p>
                    <p className="text-xs text-[#64748B]">{o.phone}</p>
                  </div>
                </Td>
                <Td className="font-semibold">{formatPrice(o.total)}</Td>
                <Td>
                  <StatusBadge status={o.status} />
                </Td>
                <Td className="whitespace-nowrap text-[#64748B]">{formatDateTime(o.created_at)}</Td>
                <Td>
                  <Link
                    href={`/orders/${o.id}`}
                    className="font-medium text-[#2563EB] hover:underline"
                  >
                    Подробнее →
                  </Link>
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-[#64748B]">
                  Заказов не найдено
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#64748B]">
      {children}
    </th>
  );
}
function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-sm ${className}`}>{children}</td>;
}
