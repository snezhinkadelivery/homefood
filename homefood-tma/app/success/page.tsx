'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';

type Settings = {
  bank_name: string;
  bank_account: string;
  bank_holder: string;
};

function SuccessContent() {
  const params = useSearchParams();
  const orderNumber = params.get('order') ?? '';
  const totalParam = params.get('total');
  const total = totalParam ? Number(totalParam) : null;

  const [settings, setSettings] = useState<Settings | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('key, value')
          .in('key', ['bank_name', 'bank_account', 'bank_holder']);
        if (error) throw error;
        const map: Record<string, string> = {};
        (data ?? []).forEach((r: { key: string; value: string }) => {
          map[r.key] = r.value;
        });
        setSettings({
          bank_name: map.bank_name ?? '',
          bank_account: map.bank_account ?? '',
          bank_holder: map.bank_holder ?? '',
        });
      } catch {
        setSettings({ bank_name: '', bank_account: '', bank_holder: '' });
      }
    })();
  }, []);

  async function copyAccount() {
    if (!settings) return;
    try {
      await navigator.clipboard.writeText(settings.bank_account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  }

  return (
    <main className="px-4 pt-10 pb-[120px]">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#16A34A] animate-pop">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="check-stroke"
            />
          </svg>
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-slate-900">Заказ принят!</h1>
        {orderNumber && (
          <p className="mt-1 text-base font-bold text-[#2563EB]">№ {orderNumber}</p>
        )}
        {total !== null && !Number.isNaN(total) && (
          <p className="mt-1 text-base font-extrabold text-slate-900">
            {formatPrice(total)}
          </p>
        )}
        <p className="mt-4 max-w-[300px] text-sm text-slate-600">
          Уведомления о статусе придут в Telegram
        </p>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm font-bold text-slate-900">💳 Оплата переводом</p>
        {settings ? (
          <div className="mt-3 space-y-1">
            <p className="text-sm font-semibold text-slate-700">{settings.bank_name}</p>
            <p className="text-base font-extrabold text-slate-900">
              {settings.bank_account}
            </p>
            <p className="text-sm text-slate-500">{settings.bank_holder}</p>
            <button
              type="button"
              onClick={copyAccount}
              className="mt-3 flex h-11 w-full items-center justify-center rounded-xl bg-[#EAB308] text-sm font-extrabold text-white shadow-sm active:scale-[0.98]"
            >
              {copied ? '✅ Скопировано!' : '📋 Скопировать номер счёта'}
            </button>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            <div className="skeleton h-4 w-32 rounded" />
            <div className="skeleton h-5 w-40 rounded" />
            <div className="skeleton h-4 w-28 rounded" />
          </div>
        )}
      </div>

      <Link
        href="/"
        className="fixed bottom-4 left-1/2 z-10 flex h-14 w-[calc(100%-2rem)] max-w-[398px] -translate-x-1/2 items-center justify-center rounded-2xl bg-[#2563EB] text-base font-extrabold text-white shadow-lg shadow-blue-200 active:scale-[0.98]"
      >
        ← Вернуться в меню
      </Link>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-sm text-slate-500">Загрузка…</div>}>
      <SuccessContent />
    </Suspense>
  );
}
