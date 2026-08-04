import { supabaseAdmin } from '@/lib/supabase-admin';
import { CatalogStatusSelect } from '@/components/catalog/CatalogStatusSelect';
import { MenuItemToggle } from '@/components/catalog/MenuItemToggle';
import { ToastViewport } from '@/components/ui/Toast';
import type { CatalogType, Category, MenuItem } from '@/types';

export const dynamic = 'force-dynamic';

const STATUS_META: Record<
  CatalogType['status'],
  { label: string; className: string; description: string }
> = {
  active: {
    label: 'Активен',
    className: 'bg-[#DCFCE7] text-[#166534]',
    description: 'Покупатели видят каталог и могут оформлять блюда.',
  },
  coming_soon: {
    label: 'Скоро',
    className: 'bg-[#DBEAFE] text-[#1D4ED8]',
    description: 'Покупатели видят вкладку как анонс, но не могут заказать.',
  },
  hidden: {
    label: 'Скрыт',
    className: 'bg-[#F1F5F9] text-[#64748B]',
    description: 'Каталог не показывается покупателям.',
  },
};

export default async function CatalogPage() {
  const [typesRes, catsRes, itemsRes] = await Promise.all([
    supabaseAdmin.from('catalog_types').select('*').order('sort_order'),
    supabaseAdmin.from('categories').select('*').order('sort_order'),
    supabaseAdmin.from('menu_items').select('*').order('sort_order'),
  ]);

  const types = (typesRes.data ?? []) as CatalogType[];
  const categories = (catsRes.data ?? []) as Category[];
  const items = (itemsRes.data ?? []) as MenuItem[];
  const sortedTypes = [...types].sort((a, b) => {
    const statusOrder = { active: 0, coming_soon: 1, hidden: 2 };
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    return a.sort_order - b.sort_order;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Каталог</h1>
        <p className="text-sm text-[#64748B]">
          Управление позициями меню и состоянием каталогов
        </p>
      </div>

      {sortedTypes.map((type) => {
        const typeCats = categories.filter((c) => c.catalog_type_id === type.id);
        const status = STATUS_META[type.status] ?? STATUS_META.hidden;
        const typeItems = items.filter((item) =>
          typeCats.some((cat) => cat.id === item.category_id),
        );
        const activeCount = typeItems.filter((item) => item.is_active).length;

        return (
          <section
            key={type.id}
            className="space-y-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#E2E8F0]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-[#1E293B]">{type.name}</h2>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#64748B]">{status.description}</p>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <CatalogStatusSelect catalogType={type} />
                <div className="rounded-xl bg-[#F8FAFC] px-3 py-2 text-right">
                  <p className="text-xs font-medium text-[#64748B]">Позиции</p>
                  <p className="text-sm font-extrabold text-[#1E293B]">
                    {activeCount} / {typeItems.length}
                  </p>
                </div>
              </div>
            </div>

            {typeCats.map((cat) => {
              const catItems = items.filter((i) => i.category_id === cat.id);
              return (
                <div key={cat.id}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-[#64748B]">{cat.name}</h3>
                    <span className="text-xs font-medium text-[#94A3B8]">
                      {catItems.length} поз.
                    </span>
                  </div>
                  {catItems.length > 0 ? (
                    <div className="space-y-2">
                      {catItems.map((item) => (
                        <MenuItemToggle key={item.id} item={item} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-3 text-sm text-[#64748B]">
                      Позиции пока не добавлены.
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        );
      })}

      <ToastViewport />
    </div>
  );
}
