import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { periodStart } from '@/lib/utils';
import type { DashboardMetrics, OrderItemJson, Period } from '@/types';

type OrderRow = {
  total: number;
  user_tg_id: number | null;
  items_json: OrderItemJson[];
  created_at: string;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const period = (url.searchParams.get('period') ?? 'today') as Period;
  const start = periodStart(period);

  try {
    let query = supabaseAdmin.from('orders').select('total, user_tg_id, items_json, created_at');
    if (start) query = query.gte('created_at', start);
    const { data: ordersInPeriod, error: ordersErr } = await query;
    if (ordersErr) throw ordersErr;
    const orders = (ordersInPeriod ?? []) as OrderRow[];

    const revenue = orders.reduce((s, o) => s + (o.total ?? 0), 0);
    const ordersCount = orders.length;
    const avgCheck = ordersCount > 0 ? Math.round(revenue / ordersCount) : 0;

    // Уникальные пользователи в периоде
    const userIdsInPeriod = Array.from(
      new Set(orders.filter((o) => o.user_tg_id !== null).map((o) => o.user_tg_id as number)),
    );

    // Кто из них имел заказы ДО начала периода
    let returningCustomers = 0;
    let newCustomers = 0;
    if (userIdsInPeriod.length > 0 && start) {
      const { data: priorRows } = await supabaseAdmin
        .from('orders')
        .select('user_tg_id')
        .lt('created_at', start)
        .in('user_tg_id', userIdsInPeriod);
      const priorIds = new Set<number>(
        (priorRows ?? []).map((r: { user_tg_id: number }) => r.user_tg_id),
      );
      returningCustomers = userIdsInPeriod.filter((id) => priorIds.has(id)).length;
      newCustomers = userIdsInPeriod.length - returningCustomers;
    } else if (!start) {
      // Для 'all' — все клиенты считаются "новыми" в общем смысле
      newCustomers = userIdsInPeriod.length;
      returningCustomers = 0;
    }

    const totalUnique = userIdsInPeriod.length;
    const returningPercent =
      totalUnique > 0 ? Math.round((returningCustomers / totalUnique) * 100) : 0;

    // Топ блюд
    const counts = new Map<string, number>();
    for (const o of orders) {
      const items = Array.isArray(o.items_json) ? o.items_json : [];
      for (const item of items) {
        if (!item?.name) continue;
        const qty = typeof item.qty === 'number' ? item.qty : 0;
        counts.set(item.name, (counts.get(item.name) ?? 0) + qty);
      }
    }
    const topItems = Array.from(counts.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const result: DashboardMetrics = {
      revenue,
      ordersCount,
      avgCheck,
      newCustomers,
      returningCustomers,
      returningPercent,
      topItems,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error('[dashboard] error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
