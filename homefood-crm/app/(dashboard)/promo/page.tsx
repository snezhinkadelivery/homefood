import { supabaseAdmin } from '@/lib/supabase-admin';
import { PromoTable } from '@/components/promo/PromoTable';
import { ToastViewport } from '@/components/ui/Toast';

export const dynamic = 'force-dynamic';

type PromoCode = {
  id: number;
  code: string;
  discount_percent: number;
  used_count: number;
  gross_items_total: number;
  is_active: boolean;
  created_at: string;
};

export default async function PromoPage() {
  const [{ data }, { data: orders }] = await Promise.all([
    supabaseAdmin
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('orders')
      .select('promo_code, subtotal')
      .not('promo_code', 'is', null),
  ]);

  const totalsByPromo = new Map<string, number>();

  for (const order of orders ?? []) {
    const code = String(order.promo_code ?? '').trim().toUpperCase();
    if (!code) continue;
    totalsByPromo.set(code, (totalsByPromo.get(code) ?? 0) + Number(order.subtotal ?? 0));
  }

  const promos = ((data ?? []) as Omit<PromoCode, 'gross_items_total'>[]).map((promo) => ({
    ...promo,
    gross_items_total: totalsByPromo.get(promo.code.trim().toUpperCase()) ?? 0,
  }));

  return (
    <>
      <PromoTable promos={promos} />
      <ToastViewport />
    </>
  );
}
