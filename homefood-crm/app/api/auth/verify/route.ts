import { NextResponse } from 'next/server';
import { COOKIE_NAME, COOKIE_MAX_AGE, verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string };
    const token = body.token?.trim();

    if (!token) {
      return NextResponse.json({ success: false, error: 'token required' }, { status: 400 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'invalid or expired token' },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ success: true, name: payload.name });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
    return response;
  } catch {
    return NextResponse.json({ success: false, error: 'bad request' }, { status: 400 });
  }
}
