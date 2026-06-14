'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tg = window.Telegram?.WebApp;
    if (!tg) return;
    try {
      tg.ready();
      tg.expand();
    } catch {
      // Telegram SDK not available outside the WebApp — ignore.
    }
  }, []);

  // При открытии TMA всегда начинаем с каталога
  useEffect(() => {
    if (pathname !== '/') {
      router.replace('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
