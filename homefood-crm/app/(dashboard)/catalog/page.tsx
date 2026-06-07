import { supabaseAdmin } from '@/lib/supabase-admin';
import { MenuItemToggle } from '@/components/catalog/MenuItemToggle';
import { ToastViewport } from '@/components/ui/Toast';
import type { CatalogType, Category, MenuItem } from '@/types';

export const dynamic = 'force-dynamic';

export default async function CatalogPage() {
  const [typesRes, catsRes, itemsRes] = await Promise.all([
    supabaseAdmin.from('catalog_types').select('*').order('sort_order'),
    supabaseAdmin.from('categories').select('*').order('sort_order'),
    supabaseAdmin.from('menu_items').select('*').order('sort_order'),
  ]);

  const types = (typesRes.data ?? []) as CatalogType[];
  const categories = (catsRes.data ?? []) as Category[];
  const items = (itemsRes.data ?? []) as MenuItem[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Каталог</h1>
        <p className="text-sm text-[#64748B]">Управление позициями меню</p>
      </div>

      {types.map((type) => {
        const typeCats = categories.filter((c) => c.catalog_type_id === type.id);
        return (
          <section key={type.id} className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#1E293B]">{type.name}</h2>
              {!type.is_active && (
                <span className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-xs font-medium text-[#64748B]">
                  скрыт
                </span>
              )}
            </div>

            {typeCats.map((cat) => {
              const catItems = items.filter((i) => i.category_id === cat.id);
              if (catItems.length === 0) return null;
              return (
                <div key={cat.id}>
                  <h3 className="mb-2 text-sm font-semibold text-[#64748B]">{cat.name}</h3>
                  <div className="space-y-2">
                    {catItems.map((item) => (
                      <MenuItemToggle key={item.id} item={item} />
                    ))}
                  </div>
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
