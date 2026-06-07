'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { CatalogType, Category, MenuItem } from '@/types';

type CatalogState = {
  loading: boolean;
  error: string | null;
  catalogTypes: CatalogType[];
  categories: Category[];
  items: MenuItem[];
};

export function useCatalog() {
  const [state, setState] = useState<CatalogState>({
    loading: true,
    error: null,
    catalogTypes: [],
    categories: [],
    items: [],
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [typesRes, catRes, itemsRes] = await Promise.all([
          supabase.from('catalog_types').select('*').order('sort_order'),
          supabase.from('categories').select('*').order('sort_order'),
          supabase
            .from('menu_items')
            .select('*')
            .eq('is_active', true)
            .order('sort_order'),
        ]);
        if (cancelled) return;
        if (typesRes.error) throw typesRes.error;
        if (catRes.error) throw catRes.error;
        if (itemsRes.error) throw itemsRes.error;
        setState({
          loading: false,
          error: null,
          catalogTypes: (typesRes.data ?? []) as CatalogType[],
          categories: (catRes.data ?? []) as Category[],
          items: (itemsRes.data ?? []) as MenuItem[],
        });
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : 'Ошибка загрузки каталога';
        setState((s) => ({ ...s, loading: false, error: msg }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
