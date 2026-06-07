import { supabaseAdmin } from './supabase-admin';

export const COOKIE_NAME = 'crm_token';
export const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 часов

export async function validateToken(token: string): Promise<boolean> {
  if (!token) return false;
  try {
    const { data, error } = await supabaseAdmin
      .from('admin_tokens')
      .select('expires_at, used')
      .eq('token', token)
      .maybeSingle();

    if (error || !data) return false;
    if (data.used) return false;
    if (new Date(data.expires_at).getTime() < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}
