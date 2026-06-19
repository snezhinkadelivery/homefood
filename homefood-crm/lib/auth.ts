import jwt from 'jsonwebtoken';

export const COOKIE_NAME = 'crm_token';
export const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 дней

export type JwtPayload = {
  tg_id: number;
  name?: string;
};

export function verifyToken(token: string): JwtPayload | null {
  if (!token) return null;
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('[auth] JWT_SECRET not set');
    return null;
  }
  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    const rawIds = process.env.ADMIN_TG_IDS ?? '';
    const adminIds = rawIds.split(',').map((id) => Number(id.trim())).filter(Boolean);
    if (!adminIds.includes(payload.tg_id)) return null;
    return payload;
  } catch {
    return null;
  }
}
