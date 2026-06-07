'use client';

import { useEffect, useState } from 'react';
import type { TelegramUser } from '@/types';

export function useTelegram() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tg = window.Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      setUser(tg.initDataUnsafe.user);
    }
    setReady(true);
  }, []);

  return { user, ready };
}
