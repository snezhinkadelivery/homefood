import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { CatalogType } from '@/types';

const VALID_STATUSES: CatalogType['status'][] = ['active', 'coming_soon', 'hidden'];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const catalogTypeId = Number(id);
  if (!catalogTypeId) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  let body: { status?: CatalogType['status'] };
  try {
    body = (await request.json()) as { status?: CatalogType['status'] };
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 });
  }

  if (!body.status || !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: 'invalid status' }, { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin
      .from('catalog_types')
      .update({
        status: body.status,
        is_active: body.status === 'active',
      })
      .eq('id', catalogTypeId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[catalog type status] error:', err);
    return NextResponse.json({ error: 'update failed' }, { status: 500 });
  }
}
