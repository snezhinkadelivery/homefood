type Item = { name: string; qty: number };

export function TopItemsChart({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
        <h3 className="text-base font-bold text-[#1E293B]">🏆 Топ блюд</h3>
        <p className="mt-4 text-sm text-[#64748B]">Нет данных за выбранный период</p>
      </div>
    );
  }

  const max = Math.max(...items.map((i) => i.qty), 1);

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
      <h3 className="text-base font-bold text-[#1E293B]">🏆 Топ блюд</h3>
      <div className="mt-4 space-y-3">
        {items.map((item, i) => {
          const percent = (item.qty / max) * 100;
          return (
            <div key={item.name + i} className="grid grid-cols-[24px_1fr_50px] items-center gap-3">
              <span className="text-sm font-medium text-[#64748B]">{i + 1}.</span>
              <div>
                <p className="mb-1 text-sm font-medium text-[#1E293B]">{item.name}</p>
                <div className="h-2 overflow-hidden rounded-full bg-[#F1F5F9]">
                  <div
                    className="h-full rounded-full bg-[#2563EB] transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
              <span className="text-right text-sm font-semibold text-[#1E293B]">
                {item.qty} шт
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
