import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const ALLOWED = new Set([
  'delivery_phone',
  'bank_name',
  'bank_account',
  'bank_holder',
  'free_delivery_min',
  'delivery_fee',
]);

export async function POST(request: Request) {
  let body: Record<string, string>;
  try {
    body = (await request.json()) as Record<string, string>;
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 });
  }

  const entries = Object.entries(body).filter(
    ([key, val]) => ALLOWED.has(key) && typeof val === 'string',
  );
  if (entries.length === 0) {
    return NextResponse.json({ error: 'no valid keys' }, { status: 400 });
  }

  try {
    const rows = entries.map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabaseAdmin
      .from('settings')
      .upsert(rows, { onConflict: 'key' });
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[settings save] error:', err);
    return NextResponse.json({ error: 'save failed' }, { status: 500 });
  }
}
