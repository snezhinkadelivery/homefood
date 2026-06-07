import { NextResponse } from 'next/server';
import { COOKIE_NAME, COOKIE_MAX_AGE, validateToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string };
    const token = body.token?.trim();

    if (!token) {
      return NextResponse.json({ success: false, error: 'token required' }, { status: 400 });
    }

    const valid = await validateToken(token);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'invalid token' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
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
