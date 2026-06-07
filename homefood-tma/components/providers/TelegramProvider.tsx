'use client';

import { useEffect } from 'react';

export function TelegramProvider({ children }: { children: React.ReactNode }) {
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

  return <>{children}</>;
}
