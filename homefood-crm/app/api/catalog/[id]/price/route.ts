import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const itemId = Number(id);
  if (!itemId) return NextResponse.json({ error: 'invalid id' }, { status: 400 });

  let body: { price?: number };
  try {
    body = (await request.json()) as { price?: number };
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 });
  }

  const price = body.price;
  if (typeof price !== 'number' || !Number.isInteger(price) || price < 0) {
    return NextResponse.json({ error: 'valid price required' }, { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin
      .from('menu_items')
      .update({ price })
      .eq('id', itemId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[catalog price] error:', err);
    return NextResponse.json({ error: 'update failed' }, { status: 500 });
  }
}
