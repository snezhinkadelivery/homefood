'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useCatalog } from '@/hooks/useCatalog';
import { useCart } from '@/hooks/useCart';
import { Header } from '@/components/catalog/Header';
import { CatalogTabs } from '@/components/catalog/CatalogTabs';
import { CategoryFilter } from '@/components/catalog/CategoryFilter';
import { MenuItemCard } from '@/components/catalog/MenuItemCard';
import { ComingSoonPanel } from '@/components/catalog/ComingSoonPanel';
import { EmptyCategoryState } from '@/components/catalog/EmptyCategoryState';
import { formatPrice } from '@/lib/utils';

export default function HomePage() {
  const { loading, error, catalogTypes, categories, items } = useCatalog();
  const { totalItems, total, hydrated } = useCart();
  const [activeType, setActiveType] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');

  useEffect(() => {
    if (activeType === null && catalogTypes.length > 0) {
      const firstActive = catalogTypes.find((t) => t.status === 'active');
      const firstVisible = catalogTypes.find(
        (t) => t.status === 'active' || t.status === 'coming_soon',
      );
      if (firstActive) setActiveType(firstActive.id);
      else if (firstVisible) setActiveType(firstVisible.id);
    }
  }, [catalogTypes, activeType]);

  const selectedType = useMemo(
    () => catalogTypes.find((t) => t.id === activeType) ?? null,
    [catalogTypes, activeType],
  );

  const firstActiveType = useMemo(
    () => catalogTypes.find((t) => t.status === 'active') ?? null,
    [catalogTypes],
  );

  useEffect(() => {
    setActiveCategory('all');
  }, [activeType]);

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.catalog_type_id === activeType),
    [categories, activeType],
  );

  const visibleItems = useMemo(() => {
    const categoryOrder = new Map(visibleCategories.map((c) => [c.id, c.sort_order]));
    const inType = items.filter((i) =>
      visibleCategories.some((c) => c.id === i.category_id),
    ).sort((a, b) => {
      const categoryDiff =
        (categoryOrder.get(a.category_id) ?? 0) - (categoryOrder.get(b.category_id) ?? 0);
      if (categoryDiff !== 0) return categoryDiff;
      return a.sort_order - b.sort_order;
    });
    if (activeCategory === 'all') return inType;
    return inType.filter((i) => i.category_id === activeCategory);
  }, [items, visibleCategories, activeCategory]);

  const activeCategoryName = useMemo(() => {
    if (activeCategory === 'all') return undefined;
    return visibleCategories.find((c) => c.id === activeCategory)?.name;
  }, [activeCategory, visibleCategories]);

  const isComingSoon = selectedType?.status === 'coming_soon';

  return (
    <main className="min-h-screen bg-[#EFF6FF] pb-[110px]">
      <Header />

      <CatalogTabs
        types={catalogTypes}
        activeId={activeType}
        onChange={setActiveType}
      />

      {!isComingSoon && (
        <CategoryFilter
          categories={visibleCategories}
          activeId={activeCategory}
          onChange={setActiveCategory}
        />
      )}

      <section
        className={`flex flex-wrap justify-center py-4 ${
          selectedType?.slug === 'frozen' ? 'gap-2 px-2' : 'gap-4 px-4'
        }`}
      >
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

        {!loading && !error && isComingSoon && (
          <ComingSoonPanel
            onOpenActive={() => {
              if (firstActiveType) setActiveType(firstActiveType.id);
            }}
          />
        )}

        {!loading && !error && !isComingSoon && visibleItems.length === 0 && (
          <EmptyCategoryState categoryName={activeCategoryName} />
        )}

        {!loading && !isComingSoon &&
          visibleItems.map((item, idx) => (
            <MenuItemCard
              key={item.id}
              item={item}
              priority={idx < 4}
              catalogSlug={selectedType?.slug}
            />
          ))}
      </section>

      {hydrated && totalItems > 0 && (
        <Link
          href="/cart"
          className="animate-slide-up fixed bottom-4 left-0 right-0 z-10 mx-auto flex h-14 w-[calc(100%-2rem)] max-w-[398px] items-center justify-between rounded-2xl px-5 text-white active:scale-[0.98]"
          style={{
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
