'use client';

import { useEffect, useState } from 'react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { PeriodToggle } from '@/components/dashboard/PeriodToggle';
import { TopItemsChart } from '@/components/dashboard/TopItemsChart';
import { formatPrice } from '@/lib/utils';
import type { DashboardMetrics, Period } from '@/types';

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>('today');
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/dashboard?period=${period}`);
        if (!res.ok) throw new Error('Failed to load');
        const json = (await res.json()) as DashboardMetrics;
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Ошибка загрузки');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [period]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Аналитика</h1>
          <p className="text-sm text-[#64748B]">Сводка по продажам и клиентам</p>
        </div>
        <PeriodToggle value={period} onChange={setPeriod} />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-[#DC2626]">{error}</div>
      )}

      {loading && !data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Выручка"
              value={formatPrice(data.revenue)}
              icon="💰"
              color="blue"
            />
            <MetricCard
              title="Заказов"
              value={String(data.ordersCount)}
              icon="📦"
              color="green"
            />
            <MetricCard
              title="Средний чек"
              value={formatPrice(data.avgCheck)}
              icon="🧾"
              color="yellow"
            />
            <MetricCard
              title="Новых клиентов"
              value={String(data.newCustomers)}
              icon="👤"
              color="purple"
            />
            <MetricCard
              title="Повторных клиентов"
              value={String(data.returningCustomers)}
              icon="🔁"
              color="blue"
            />
            <MetricCard
              title="% повторных"
              value={`${data.returningPercent}%`}
              icon="📈"
              color="green"
              subtitle={`${data.returningCustomers} из ${data.newCustomers + data.returningCustomers}`}
            />
            <MetricCard
              title="Всего клиентов"
              value={String(data.newCustomers + data.returningCustomers)}
              icon="👥"
              color="yellow"
            />
            <MetricCard
              title="Топ блюдо"
              value={data.topItems[0]?.name ?? '—'}
              subtitle={data.topItems[0] ? `${data.topItems[0].qty} шт` : undefined}
              icon="🏆"
              color="purple"
            />
          </div>

          <TopItemsChart items={data.topItems} />
        </>
      ) : null}
    </div>
  );
}
