import { supabaseAdmin } from '@/lib/supabase-admin';
import { PromoTable } from '@/components/promo/PromoTable';
import { ToastViewport } from '@/components/ui/Toast';

export const dynamic = 'force-dynamic';

type PromoCode = {
  id: number;
  code: string;
  discount_percent: number;
  used_count: number;
  is_active: boolean;
  created_at: string;
};

export default async function PromoPage() {
  const { data } = await supabaseAdmin
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });

  const promos = (data ?? []) as PromoCode[];

  return (
    <>
      <PromoTable promos={promos} />
      <ToastViewport />
    </>
  );
}
