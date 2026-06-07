import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const itemId = Number(id);
  if (!itemId) return NextResponse.json({ error: 'invalid id' }, { status: 400 });

  let body: { is_active?: boolean };
  try {
    body = (await request.json()) as { is_active?: boolean };
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 });
  }
  if (typeof body.is_active !== 'boolean') {
    return NextResponse.json({ error: 'is_active required' }, { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin
      .from('menu_items')
      .update({ is_active: body.is_active })
      .eq('id', itemId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[catalog toggle] error:', err);
    return NextResponse.json({ error: 'update failed' }, { status: 500 });
  }
}
