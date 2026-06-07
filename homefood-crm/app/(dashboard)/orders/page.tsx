import { supabaseAdmin } from '@/lib/supabase-admin';
import { OrdersTable } from '@/components/orders/OrdersTable';
import { ToastViewport } from '@/components/ui/Toast';
import type { Order } from '@/types';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  const orders = (data ?? []) as Order[];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Заказы</h1>
        <p className="text-sm text-[#64748B]">Все заказы клиентов</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-[#DC2626]">
          Ошибка загрузки заказов
        </div>
      )}

      <OrdersTable orders={orders} />
      <ToastViewport />
    </div>
  );
}
