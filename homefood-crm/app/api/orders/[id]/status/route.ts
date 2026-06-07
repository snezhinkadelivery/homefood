import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { OrderStatus } from '@/types';

const VALID: OrderStatus[] = ['accepted', 'on_way', 'completed'];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const orderId = Number(id);
  if (!orderId) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  let body: { status?: OrderStatus };
  try {
    body = (await request.json()) as { status?: OrderStatus };
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 });
  }

  const status = body.status;
  if (!status || !VALID.includes(status)) {
    return NextResponse.json({ error: 'invalid status' }, { status: 400 });
  }

  try {
    const { error: updErr } = await supabaseAdmin
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    if (updErr) throw updErr;

    const { error: histErr } = await supabaseAdmin
      .from('order_status_history')
      .insert({ order_id: orderId, status });
    if (histErr) console.error('[status] history insert error:', histErr);

    // Уведомление в бот
    const botUrl = process.env.BOT_URL;
    const botSecret = process.env.BOT_SECRET;
    if (botUrl && botSecret) {
      try {
        await fetch(`${botUrl}/api/status-changed`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-bot-secret': botSecret,
          },
          body: JSON.stringify({ order_id: orderId, status }),
        });
      } catch (err) {
        console.error('[status] bot notify error:', err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[status] update error:', err);
    return NextResponse.json({ error: 'update failed' }, { status: 500 });
  }
}
