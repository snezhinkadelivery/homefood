import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  let body: { code?: string; discount_percent?: number };
  try {
    body = (await request.json()) as { code?: string; discount_percent?: number };
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 });
  }

  const code = body.code?.trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ error: 'code required' }, { status: 400 });
  }

  const discountPercent = body.discount_percent || 10;
  if (discountPercent < 1 || discountPercent > 100) {
    return NextResponse.json({ error: 'discount_percent must be 1-100' }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('promo_codes')
      .insert({ code, discount_percent: discountPercent })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    const msg = (err as { message?: string })?.message ?? 'insert failed';
    const isDuplicate = msg.includes('duplicate') || msg.includes('unique');
    return NextResponse.json(
      { error: isDuplicate ? 'Такой промокод уже существует' : msg },
      { status: isDuplicate ? 409 : 500 },
    );
  }
}
