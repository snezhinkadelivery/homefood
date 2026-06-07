'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

type State = 'idle' | 'checking' | 'success' | 'error';

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token');
  const [state, setState] = useState<State>(token ? 'checking' : 'idle');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = (await res.json()) as { success: boolean; error?: string };
        if (data.success) {
          setState('success');
          router.replace('/');
        } else {
          setState('error');
          setError('Ссылка недействительна или устарела');
        }
      } catch {
        setState('error');
        setError('Не удалось подключиться к серверу');
      }
    })();
  }, [token, router]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <div className="flex flex-col items-center">
          <Image
            src="/logo.jpeg"
            alt="HomeFood"
            width={72}
            height={72}
            className="h-18 w-18 rounded-2xl object-cover"
          />
          <h1 className="mt-4 text-xl font-bold text-[#1E293B]">HomeFood CRM</h1>
          <p className="mt-1 text-sm text-[#64748B]">Админ-панель</p>
        </div>

        <div className="mt-8 min-h-[80px]">
          {state === 'idle' && (
            <p className="text-center text-sm text-[#64748B]">
              Для входа используйте ссылку, отправленную в Telegram через команду
              <span className="font-semibold text-[#1E293B]"> /admin</span>
            </p>
          )}

          {state === 'checking' && (
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
              <p className="text-sm text-[#64748B]">Проверяем токен…</p>
            </div>
          )}

          {state === 'success' && (
            <p className="text-center text-sm font-medium text-[#16A34A]">
              ✓ Авторизация успешна, перенаправляем…
            </p>
          )}

          {state === 'error' && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-center text-sm font-medium text-[#DC2626]">
              {error}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-[#64748B]">Загрузка…</div>}>
      <LoginContent />
    </Suspense>
  );
}
