import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const FREE_DELIVERY_MIN = 50000;
export const DELIVERY_FEE = 4000;

export function getMenuImageUrl(fileName: string | null): string | null {
  if (!fileName) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return `/images/menu/${fileName}`;
  return `${base}/storage/v1/object/public/menu-images/${fileName}`;
}
