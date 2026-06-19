import jwt from 'jsonwebtoken';

export const COOKIE_NAME = 'crm_token';
export const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 дней

export type JwtPayload = {
  tg_id: number;
  name?: string;
};

export function verifyToken(token: string): JwtPayload | null {
  if (!token) {
    console.error('[auth] no token');
    return null;
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('[auth] JWT_SECRET not set in env');
    return null;
  }
  console.error(`[auth] JWT_SECRET length=${secret.length}`);
  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    console.error(`[auth] jwt verified, tg_id=${payload.tg_id}`);
    const rawIds = process.env.ADMIN_TG_IDS ?? '';
    console.error(`[auth] ADMIN_TG_IDS="${rawIds}"`);
    const adminIds = rawIds.split(',').map((id) => Number(id.trim())).filter(Boolean);
    if (!adminIds.includes(payload.tg_id)) {
      console.error(`[auth] tg_id ${payload.tg_id} not in admin list ${JSON.stringify(adminIds)}`);
      return null;
    }
    return payload;
  } catch (err) {
    console.error('[auth] jwt verify error:', (err as Error).message);
    return null;
  }
}
