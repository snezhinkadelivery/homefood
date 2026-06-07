'use client';

import { useState } from 'react';
import { toast } from '@/components/ui/Toast';

type Props = {
  initial: {
    delivery_phone: string;
    bank_name: string;
    bank_account: string;
    bank_holder: string;
  };
};

export function SettingsForm({ initial }: Props) {
  const [phone, setPhone] = useState(initial.delivery_phone);
  const [bankName, setBankName] = useState(initial.bank_name);
  const [bankAccount, setBankAccount] = useState(initial.bank_account);
  const [bankHolder, setBankHolder] = useState(initial.bank_holder);
  const [savingPhone, setSavingPhone] = useState(false);
  const [savingBank, setSavingBank] = useState(false);

  async function save(payload: Record<string, string>): Promise<boolean> {
    try {
      const res = await fetch('/api/settings/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async function savePhone() {
    setSavingPhone(true);
    const ok = await save({ delivery_phone: phone });
    setSavingPhone(false);
    toast(ok ? 'Сохранено' : 'Не удалось сохранить', ok ? 'success' : 'error');
  }

  async function saveBank() {
    setSavingBank(true);
    const ok = await save({
      bank_name: bankName,
      bank_account: bankAccount,
      bank_holder: bankHolder,
    });
    setSavingBank(false);
    toast(ok ? 'Сохранено' : 'Не удалось сохранить', ok ? 'success' : 'error');
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
        <h2 className="text-base font-bold text-[#1E293B]">Контакты доставки</h2>
        <p className="mt-1 text-xs text-[#64748B]">
          Номер показывается клиенту в уведомлении «Заказ в пути»
        </p>
        <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-[#64748B]">
          Номер телефона
        </label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none"
        />
        <button
          type="button"
          onClick={savePhone}
          disabled={savingPhone}
          className="mt-4 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:opacity-60"
        >
          {savingPhone ? 'Сохраняем…' : 'Сохранить'}
        </button>
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
        <h2 className="text-base font-bold text-[#1E293B]">Реквизиты для оплаты</h2>
        <p className="mt-1 text-xs text-[#64748B]">
          Реквизиты отправляются клиенту вместе с подтверждением заказа
        </p>

        <Field label="Банк" value={bankName} onChange={setBankName} />
        <Field label="Номер счёта" value={bankAccount} onChange={setBankAccount} />
        <Field label="Держатель счёта" value={bankHolder} onChange={setBankHolder} />

        <button
          type="button"
          onClick={saveBank}
          disabled={savingBank}
          className="mt-4 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:opacity-60"
        >
          {savingBank ? 'Сохраняем…' : 'Сохранить все'}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mt-4">
      <label className="block text-xs font-medium uppercase tracking-wide text-[#64748B]">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none"
      />
    </div>
  );
}
