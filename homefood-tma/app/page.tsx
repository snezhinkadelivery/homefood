'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useCatalog } from '@/hooks/useCatalog';
import { useCart } from '@/hooks/useCart';
import { Header } from '@/components/catalog/Header';
import { CatalogTabs } from '@/components/catalog/CatalogTabs';
import { CategoryFilter } from '@/components/catalog/CategoryFilter';
import { MenuItemCard } from '@/components/catalog/MenuItemCard';
import { formatPrice } from '@/lib/utils';

export default function HomePage() {
  const { loading, error, catalogTypes, categories, items } = useCatalog();
  const { totalItems, total, hydrated } = useCart();
  const [activeType, setActiveType] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');

  useEffect(() => {
    if (activeType === null && catalogTypes.length > 0) {
      const firstActive = catalogTypes.find((t) => t.is_active);
      if (firstActive) setActiveType(firstActive.id);
    }
  }, [catalogTypes, activeType]);

  useEffect(() => {
    setActiveCategory('all');
  }, [activeType]);

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.catalog_type_id === activeType),
    [categories, activeType],
  );

  const visibleItems = useMemo(() => {
    const inType = items.filter((i) =>
      visibleCategories.some((c) => c.id === i.category_id),
    );
    if (activeCategory === 'all') return inType;
    return inType.filter((i) => i.category_id === activeCategory);
  }, [items, visibleCategories, activeCategory]);

  return (
    <main className="min-h-screen bg-[#EFF6FF] pb-[110px]">
      <Header />

      <CatalogTabs
        types={catalogTypes}
        activeId={activeType}
        onChange={setActiveType}
      />

      <CategoryFilter
        categories={visibleCategories}
        activeId={activeCategory}
        onChange={setActiveCategory}
      />

      <section className="flex flex-wrap justify-center gap-4 p-4">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="skeleton shrink-0 rounded-full"
              style={{ width: 155, height: 155 }}
            />
          ))}

        {error && (
          <div className="w-full rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && visibleItems.length === 0 && (
          <div className="w-full rounded-[20px] bg-white p-6 text-center text-sm text-[#64748B] shadow-sm">
            В этой категории пока нет блюд.
          </div>
        )}

        {!loading &&
          visibleItems.map((item, idx) => (
            <MenuItemCard key={item.id} item={item} priority={idx < 4} />
          ))}
      </section>

      {hydrated && totalItems > 0 && (
        <Link
          href="/cart"
          className="animate-slide-up fixed bottom-0 left-1/2 z-10 flex h-14 w-[calc(100%-2rem)] max-w-[398px] -translate-x-1/2 items-center justify-between rounded-2xl px-5 text-white transition active:scale-[0.98]"
          style={{
            bottom: '16px',
            background: 'linear-gradient(90deg, #2563EB 0%, #1D4ED8 100%)',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)',
          }}
        >
          <span className="flex items-center gap-2 text-base font-bold">
            🛒 Перейти в корзину
          </span>
          <span className="text-base font-bold">{formatPrice(total)}</span>
        </Link>
      )}
    </main>
  );
}
