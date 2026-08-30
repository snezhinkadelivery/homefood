import { formatDateTime, formatPrice } from '@/lib/utils';
import type { PromoAnalytics } from '@/types';

type Props = {
  promos: PromoAnalytics[];
};

export function PromoAnalyticsTable({ promos }: Props) {
  const totalOrders = promos.reduce((sum, promo) => sum + promo.ordersCount, 0);
  const totalGross = promos.reduce((sum, promo) => sum + promo.grossItemsTotal, 0);

  return (
    <section className="rounded-xl border border-[#E2E8F0] bg-white">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-[#E2E8F0] px-5 py-4">
        <div>
          <h2 className="text-base font-bold text-[#1E293B]">Промокоды</h2>
          <p className="mt-1 text-sm text-[#64748B]">Заказы и сумма товаров до скидки</p>
        </div>
        {promos.length > 0 && (
          <p className="text-sm font-semibold text-[#1E293B]">
            Всего: {totalOrders} {pluralizeOrders(totalOrders)} · {formatPrice(totalGross)}
          </p>
        )}
      </div>

      {promos.length === 0 ? (
        <p className="px-5 py-8 text-sm text-[#64748B]">Нет применений промокодов за выбранный период</p>
      ) : (
        <div className="divide-y divide-[#E2E8F0]">
          {promos.map((promo) => (
            <details key={promo.code} className="group">
              <summary className="grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 marker:hidden hover:bg-[#F8FAFC]">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#1E293B]">{promo.code}</p>
                  <p className="mt-1 text-sm text-[#64748B]">
                    {promo.ordersCount} {pluralizeOrders(promo.ordersCount)}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <p className="font-bold text-[#1E293B]">{formatPrice(promo.grossItemsTotal)}</p>
                  <span className="text-lg leading-none text-[#64748B] transition-transform group-open:rotate-180" aria-hidden>
                    ⌄
                  </span>
                </div>
              </summary>

              <div className="grid grid-cols-2 gap-3 bg-[#F8FAFC] px-5 pb-4 pt-1 lg:grid-cols-4">
                <Detail label="Товары до скидки" value={formatPrice(promo.grossItemsTotal)} />
                <Detail label="Сумма скидок" value={formatPrice(promo.discountTotal)} />
                <Detail label="Средняя сумма товаров" value={formatPrice(promo.avgItemsTotal)} />
                <Detail label="Последний заказ" value={formatDateTime(promo.lastOrderAt)} />
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-[#64748B]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#1E293B]">{value}</p>
    </div>
  );
}

function pluralizeOrders(count: number): string {
  const lastTwo = count % 100;
  const last = count % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return 'заказов';
  if (last === 1) return 'заказ';
  if (last >= 2 && last <= 4) return 'заказа';
  return 'заказов';
}
