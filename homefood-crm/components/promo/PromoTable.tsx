'use client';

import { useState } from 'react';
import { toast } from '@/components/ui/Toast';

type PromoCode = {
  id: number;
  code: string;
  discount_percent: number;
  used_count: number;
  is_active: boolean;
  created_at: string;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

function PromoRow({ promo }: { promo: PromoCode }) {
  const [active, setActive] = useState(promo.is_active);
  const [saving, setSaving] = useState(false);

  async function onToggle() {
    if (saving) return;
    const next = !active;
    setActive(next);
    setSaving(true);
    try {
      const res = await fetch(`/api/promo/${promo.id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: next }),
      });
      if (!res.ok) throw new Error('failed');
    } catch {
      setActive(!next);
      toast('Не удалось обновить статус', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="border-b border-[#E2E8F0] last:border-b-0">
      <td className="px-4 py-3 text-sm font-mono font-semibold text-[#1E293B]">
        {promo.code}
      </td>
      <td className="px-4 py-3 text-sm text-[#1E293B]">{promo.discount_percent}%</td>
      <td className="px-4 py-3 text-sm">
        {promo.used_count > 0 ? (
          <span className="font-bold text-[#2563EB]">{promo.used_count} раз</span>
        ) : (
          <span className="text-[#94A3B8]">0 раз</span>
        )}
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={onToggle}
          disabled={saving}
          role="switch"
          aria-checked={active}
          className={
            'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-60 ' +
            (active ? 'bg-[#16A34A]' : 'bg-[#CBD5E1]')
          }
        >
          <span
            className={
              'inline-block h-5 w-5 transform rounded-full bg-white shadow transition ' +
              (active ? 'translate-x-5' : 'translate-x-0.5')
            }
          />
        </button>
      </td>
      <td className="px-4 py-3 text-sm text-[#64748B]">{formatDate(promo.created_at)}</td>
    </tr>
  );
}

export function PromoTable({ promos: initial }: { promos: PromoCode[] }) {
  const [promos, setPromos] = useState(initial);
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('10');
  const [creating, setCreating] = useState(false);

  async function onCreate() {
    if (!code.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          discount_percent: Number(discount) || 10,
        }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? 'failed');
      }
      const data = (await res.json()) as PromoCode;
      setPromos((prev) => [data, ...prev]);
      setShowModal(false);
      setCode('');
      setDiscount('10');
      toast('Промокод создан');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка создания';
      toast(msg, 'error');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Промокоды</h1>
          <p className="text-sm text-[#64748B]">Управление скидочными кодами</p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] active:scale-[0.98]"
        >
          + Создать промокод
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <th className="px-4 py-3 text-xs font-semibold uppercase text-[#64748B]">Код</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase text-[#64748B]">Скидка</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase text-[#64748B]">Использований</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase text-[#64748B]">Статус</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase text-[#64748B]">Создан</th>
            </tr>
          </thead>
          <tbody>
            {promos.map((p) => (
              <PromoRow key={p.id} promo={p} />
            ))}
            {promos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#94A3B8]">
                  Нет промокодов
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-[#1E293B]">Новый промокод</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-[#64748B]">Код</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="BLOG_ANNA"
                  className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm font-mono uppercase focus:border-[#2563EB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#64748B]">Скидка (%)</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  min={1}
                  max={100}
                  className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={onCreate}
                disabled={creating || !code.trim()}
                className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-60"
              >
                {creating ? '...' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
